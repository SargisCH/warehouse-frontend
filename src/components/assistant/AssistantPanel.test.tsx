import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import en from '../../translations/en/common.json';
import am from '../../translations/am/common.json';
import { ChakraProvider } from '@chakra-ui/react';
import AssistantPanel from './AssistantPanel';
import * as assistant from 'api/assistant';

jest.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/admin/sales' }) }));
jest.mock('react-redux', () => ({ useSelector: (select: any) => select({ user: { id: 'account-1' } }) }));
jest.mock('api/assistant', () => ({
  useAssistantAccessQuery: jest.fn(), useAssistantThreadsQuery: jest.fn(), useAssistantThreadQuery: jest.fn(),
  useCreateAssistantThreadMutation: jest.fn(), useAssistantActionMutation: jest.fn(),
}));
const mock = assistant as jest.Mocked<typeof assistant>;
const create = jest.fn();
const action = jest.fn();
const conversation: assistant.Conversation = {
  id: 'feedback-1', mode: 'FEEDBACK', page: '/admin/sales', release: 'test', status: 'NEEDS_REVIEW', revision: 1,
  updatedAt: '2026-10-19T12:00:00Z', messages: [{ id: 'msg', kind: 'USER', body: 'Add a manager filter', authorId: 'account-1', createdAt: '2026-10-19T12:00:00Z' }],
  plans: [{ id: 'plan-1', version: 1, threadRevision: 1, body: 'Add filter to the sales list', sourceRefs: {} }], runs: [],
};
const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: 'en', interpolation: { escapeValue: false }, resources: {
    en: { translation: { common: en } }, am: { translation: { common: am } },
  } });
});
function mount() { return render(<I18nextProvider i18n={i18n}><ChakraProvider><AssistantPanel /></ChakraProvider></I18nextProvider>); }
beforeEach(async () => {
  await i18n.changeLanguage('en');
  jest.clearAllMocks(); localStorage.clear();
  mock.useAssistantAccessQuery.mockReturnValue({ currentData: { assistantAccess: 'CONTRIBUTOR', aiConfigured: false } } as any);
  mock.useAssistantThreadsQuery.mockReturnValue({ currentData: [] } as any);
  mock.useAssistantThreadQuery.mockImplementation((arg: any) => ({ currentData: arg.id ? conversation : undefined } as any));
  create.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'feedback-1' }) });
  action.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  mock.useCreateAssistantThreadMutation.mockReturnValue([create, { isLoading: false }] as any);
  mock.useAssistantActionMutation.mockReturnValue([action, { isLoading: false }] as any);
});

test('assistant composer follows the selected language without losing its draft', async () => {
  await i18n.changeLanguage('am');
  mount();
  fireEvent.click(screen.getByRole('button', { name: am.assistant.askOrSuggest }));
  fireEvent.click(await screen.findByRole('button', { name: am.assistant.newMessage }));
  fireEvent.click(screen.getByRole('button', { name: am.assistant.newRequest, exact: true }));
  fireEvent.change(screen.getByRole('textbox', { name: am.assistant.yourRequest }), { target: { value: 'Ավելացնել նոր էջ' } });
  expect(screen.getByText(am.assistant.requestHint)).toBeTruthy();
  await act(async () => { await i18n.changeLanguage('en'); });
  expect(screen.getByRole('button', { name: 'New request', exact: true }).getAttribute('aria-pressed')).toBe('true');
  expect((screen.getByRole('textbox', { name: 'Your request' }) as HTMLTextAreaElement).value).toBe('Ավելացնել նոր էջ');
});

test('Armenian review labels are translated while the plan content stays unchanged', async () => {
  await i18n.changeLanguage('am');
  mock.useAssistantAccessQuery.mockReturnValue({ currentData: { assistantAccess: 'DEVELOPER', aiConfigured: true } } as any);
  mock.useAssistantThreadsQuery.mockReturnValue({ currentData: [{ ...conversation, preview: 'Add a manager filter' }] } as any);
  mount();
  fireEvent.click(screen.getByRole('button', { name: am.assistant.askOrSuggest }));
  const item = await screen.findByRole('button', { name: /Add a manager filter/ });
  expect(item.textContent).toContain(am.assistant.status.NEEDS_REVIEW);
  fireEvent.click(item);
  expect(await screen.findByText('Add filter to the sales list')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: am.assistant.approveStart }));
  expect(screen.getByText(am.assistant.confirmCoding.replace('{{version}}', '1'))).toBeTruthy();
  expect(action).not.toHaveBeenCalled();
});

test('regular users do not see the assistant button', () => {
  mock.useAssistantAccessQuery.mockReturnValue({ currentData: { assistantAccess: 'NONE', aiConfigured: false } } as any);
  mount(); expect(screen.queryByRole('button', { name: 'Ask or suggest' })).toBeNull();
});

test('contributors submit feedback with one text box and automatic page context', async () => {
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Ask or suggest' }));
  fireEvent.click(await screen.findByRole('button', { name: 'New message' }));
  fireEvent.click(screen.getByRole('button', { name: 'Feedback' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
  fireEvent.change(screen.getByRole('textbox', { name: 'Your feedback' }), { target: { value: 'Add a manager filter' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
  await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ mode: 'FEEDBACK', body: 'Add a manager filter', page: '/admin/sales' })));
  expect(screen.queryByRole('button', { name: 'Approve & start' })).toBeNull();
  expect(screen.queryByText('Add filter to the sales list')).toBeNull();
});

test('contributors submit new requests without attaching the current page', async () => {
  mock.useAssistantThreadQuery.mockImplementation((arg: any) => ({ currentData: arg.id ? { ...conversation, page: '' } : undefined } as any));
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Ask or suggest' }));
  fireEvent.click(await screen.findByRole('button', { name: 'New message' }));
  fireEvent.click(screen.getByRole('button', { name: 'New request', exact: true }));
  expect(screen.queryByText('About this page: /admin/sales')).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Your request' }), { target: { value: '  Add a delivery planning page  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
  await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ mode: 'FEEDBACK', body: 'Add a delivery planning page', page: '' })));
  expect(await screen.findByText(/No specific page/)).toBeTruthy();
  expect(screen.queryByRole('link', { name: /Open/ })).toBeNull();
  expect(action).not.toHaveBeenCalled();
  expect(localStorage.getItem('assistant-mode-account-1')).toBe('REQUEST');
});

test('new request drafts survive submission errors', async () => {
  create.mockReturnValue({ unwrap: () => Promise.reject({ data: { message: 'Could not submit' } }) });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Ask or suggest' }));
  fireEvent.click(await screen.findByRole('button', { name: 'New message' }));
  fireEvent.click(screen.getByRole('button', { name: 'New request', exact: true }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your request' }), { target: { value: 'Add a new reports page' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
  expect(await screen.findByText('Could not submit')).toBeTruthy();
  expect((screen.getByRole('textbox', { name: 'Your request' }) as HTMLTextAreaElement).value).toBe('Add a new reports page');
});

test('developer must explicitly confirm the exact plan before implementation', async () => {
  mock.useAssistantAccessQuery.mockReturnValue({ currentData: { assistantAccess: 'DEVELOPER', aiConfigured: true } } as any);
  mock.useAssistantThreadsQuery.mockReturnValue({ currentData: [{ ...conversation, preview: 'Add a manager filter' }] } as any);
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Ask or suggest' }));
  fireEvent.click(await screen.findByRole('button', { name: /Add a manager filter/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Approve & start' }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm & start' }));
  await waitFor(() => expect(action).toHaveBeenCalledWith({ id: 'feedback-1', action: 'approve', body: { planId: 'plan-1' } }));
});

test('stale plans cannot be approved', async () => {
  mock.useAssistantAccessQuery.mockReturnValue({ currentData: { assistantAccess: 'DEVELOPER', aiConfigured: true } } as any);
  mock.useAssistantThreadsQuery.mockReturnValue({ currentData: [{ ...conversation, preview: 'Add a manager filter' }] } as any);
  mock.useAssistantThreadQuery.mockImplementation((arg: any) => ({ currentData: arg.id ? { ...conversation, revision: 2 } : undefined } as any));
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Ask or suggest' }));
  fireEvent.click(await screen.findByRole('button', { name: /Add a manager filter/ }));
  const approve = await screen.findByRole('button', { name: 'Approve & start' });
  expect(approve.hasAttribute('disabled')).toBe(true);
});
