import { api } from './api';
export type AssistantAccess = 'NONE' | 'CONTRIBUTOR' | 'DEVELOPER';
export type Thread = {
  id: string; mode: 'QUESTION' | 'FEEDBACK'; page: string; release: string;
  status: string; revision: number; updatedAt: string; preview?: string;
};
export type Plan = { id: string; version: number; threadRevision: number; body: string; sourceRefs: Record<string, string> };
export type Conversation = Thread & {
  messages: { id: string; kind: string; body: string; createdAt: string; authorId?: string }[];
  plans: Plan[];
  runs: { id: string; kind: string; status: string; planId?: string; error?: string; result?: { summary?: string; pullRequests?: string[] } }[];
};
const taggedApi = api.enhanceEndpoints({ addTagTypes: ['Assistant'] });
export const assistantApi = taggedApi.injectEndpoints({ endpoints: builder => ({
  assistantAccess: builder.query<{ assistantAccess: AssistantAccess; aiConfigured: boolean }, string>({ query: () => ({ url: 'assistant/access' }) }),
  assistantThreads: builder.query<Thread[], string>({ query: () => ({ url: 'assistant/threads' }), providesTags: ['Assistant'] }),
  assistantThread: builder.query<Conversation, { id: string; account: string }>({ query: ({ id }) => ({ url: `assistant/threads/${id}` }), providesTags: ['Assistant'] }),
  createAssistantThread: builder.mutation<{ id: string }, { mode: 'QUESTION' | 'FEEDBACK'; body: string; page: string; release: string; browser: string }>({
    query: body => ({ url: 'assistant/threads', method: 'POST', body }), invalidatesTags: ['Assistant'],
  }),
  assistantAction: builder.mutation<unknown, { id: string; action: 'messages' | 'plan' | 'plans' | 'approve' | 'status'; body?: unknown }>({
    query: ({ id, action, body }) => ({ url: `assistant/threads/${id}/${action}`, method: action === 'status' ? 'PATCH' : 'POST', body }), invalidatesTags: ['Assistant'],
  }),
}) });
export const { useAssistantAccessQuery, useAssistantThreadsQuery, useAssistantThreadQuery, useCreateAssistantThreadMutation, useAssistantActionMutation } = assistantApi;
