import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, ButtonGroup, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay,
  Flex, Heading, HStack, Link, Select, Spinner, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAssistantAccessQuery, useAssistantThreadsQuery, useAssistantThreadQuery, useCreateAssistantThreadMutation, useAssistantActionMutation } from 'api/assistant';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';

const label = (s: string) => s.toLowerCase().replace(/_/g, ' ');
type ComposeMode = 'QUESTION' | 'FEEDBACK' | 'REQUEST';
const failure = (e: any, fallback: string) => {
  const message = e?.data?.message || e?.data?.error || fallback;
  return Array.isArray(message) ? message.join(', ') : message;
};
export default function AssistantPanel() {
  const userId = useSelector((state: RootState) => state.user.id);
  const { currentData: access } = useAssistantAccessQuery(String(userId), { skip: !userId, pollingInterval: 60000, refetchOnMountOrArgChange: true });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [userId]);
  // Unmount all private state on account/access changes.
  if (!access || access.assistantAccess === 'NONE') return null;
  return <Box key={`${userId}-${access.assistantAccess}`}>
    <Launcher userId={String(userId)} onOpen={() => setOpen(true)} />
    {open && <Panel developer={access.assistantAccess === 'DEVELOPER'} configured={access.aiConfigured} close={() => setOpen(false)} />}
  </Box>;
}
function Launcher({ userId, onOpen }: { userId: string; onOpen: () => void }) {
  const { t: translate } = useTranslation();
  const { currentData: threads = [] } = useAssistantThreadsQuery(userId, { pollingInterval: 30000 });
  let seen: Record<string, string> = {};
  try { seen = JSON.parse(localStorage.getItem(`assistant-seen-${userId}`) || '{}'); } catch { /* optional */ }
  const ready = threads.filter(t => t.status === 'READY_TO_TEST' && seen[t.id] !== t.updatedAt).length;
  return <Button position="fixed" bottom="24px" right="24px" zIndex={1200} colorScheme="blue" boxShadow="lg" onClick={onOpen}>{translate('common.assistant.askOrSuggest')}{ready > 0 && <Badge ml="8px" colorScheme="green">{translate('common.assistant.readyCount', { count: ready })}</Badge>}</Button>;
}
function Panel({ developer, configured, close }: { developer: boolean; configured: boolean; close: () => void }) {
  const { t: translate, i18n } = useTranslation();
  const location = useLocation();
  const toast = useToast();
  const userId = useSelector((state: RootState) => state.user.id);
  const [selected, setSelected] = useState('');
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [mode, setMode] = useState<ComposeMode>(() => {
    try {
      const saved = localStorage.getItem(`assistant-mode-${userId}`);
      return saved === 'FEEDBACK' || saved === 'REQUEST' ? saved : 'QUESTION';
    } catch { return 'QUESTION'; }
  });
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  const [planBody, setPlanBody] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmApproval, setConfirmApproval] = useState(false);
  const [seen, setSeen] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`assistant-seen-${userId}`) || '{}'); } catch { return {}; }
  });
  const { currentData: threads = [], isLoading, isError: listError } = useAssistantThreadsQuery(String(userId), { pollingInterval: 5000 });
  const { currentData: detail, isFetching, isError: detailError } = useAssistantThreadQuery({ id: selected, account: String(userId) }, { skip: !selected, pollingInterval: 5000 });
  const [create, { isLoading: creating }] = useCreateAssistantThreadMutation();
  const [action, { isLoading: acting }] = useAssistantActionMutation();
  // RTK Query retains the prior argument's data while fetching a different thread.
  const thread = detail?.id === selected ? detail : undefined;
  const plan = thread?.plans[0];
  const busy = creating || acting;
  const active = thread?.runs.some(r => ['QUEUED', 'RUNNING'].includes(r.status));
  const uncancellable = thread?.runs.some(r => r.status === 'RUNNING' || (r.kind === 'IMPLEMENT' && r.status === 'QUEUED'));
  const stale = !!plan && plan.threadRevision !== thread?.revision;
  const approved = !!plan && thread?.runs.some(r => r.kind === 'IMPLEMENT' && r.planId === plan.id);
  useEffect(() => {
    setEditing(false); setConfirmApproval(false); setReply('');
  }, [selected]);
  useEffect(() => {
    if (!thread) return;
    setSeen(previous => {
      if (previous[thread.id] === thread.updatedAt) return previous;
      const next = { ...previous, [thread.id]: thread.updatedAt };
      try { localStorage.setItem(`assistant-seen-${userId}`, JSON.stringify(next)); } catch { /* storage is optional */ }
      return next;
    });
  }, [thread?.id, thread?.updatedAt, userId]);
  const perform = async (kind: 'messages' | 'plan' | 'plans' | 'approve' | 'status', payload?: unknown) => {
    try {
      await action({ id: selected, action: kind, body: payload }).unwrap();
      if (kind === 'messages') setReply('');
      if (kind === 'plans') setEditing(false);
      setConfirmApproval(false);
      toast({ status: 'success', title: kind === 'approve' ? translate('common.assistant.approved') : translate('common.assistant.saved') });
    } catch (e) { toast({ status: 'error', title: failure(e, translate('common.assistant.requestFailed')) }); }
  };
  const submit = async (nextMode = mode, content = body) => {
    if (!content.trim()) return;
    try {
      const result = await create({ mode: nextMode === 'REQUEST' ? 'FEEDBACK' : nextMode, body: content.trim(), page: nextMode === 'REQUEST' ? '' : location.pathname,
        release: process.env.REACT_APP_RELEASE || 'unknown', browser: navigator.userAgent.slice(0, 300) }).unwrap();
      setSelected(result.id); setComposing(false); setBody('');
      try { localStorage.setItem(`assistant-mode-${userId}`, nextMode); } catch { /* optional */ }
      toast({ status: 'success', title: nextMode === 'REQUEST' ? translate('common.assistant.requestSent') : nextMode === 'FEEDBACK' ? translate('common.assistant.feedbackSent') : translate('common.assistant.questionSaved') });
    } catch (e) { toast({ status: 'error', title: failure(e, translate('common.assistant.requestFailed')) }); }
  };
  const visible = threads.filter(t => filter === 'ALL' ||
    (filter === 'REVIEW' && t.mode === 'FEEDBACK' && ['OPEN', 'NEEDS_REVIEW'].includes(t.status)) ||
    (filter === 'PROGRESS' && ['IN_PROGRESS', 'CODE_REVIEW'].includes(t.status)) || t.status === filter);
  return <Drawer isOpen placement="right" onClose={close} size="lg">
    <DrawerOverlay /><DrawerContent><DrawerCloseButton aria-label={translate('common.assistant.close')} /><DrawerHeader>{developer ? translate('common.assistant.reviewInbox') : translate('common.assistant.askOrSuggest')}</DrawerHeader>
      <DrawerBody pb="24px">
        {!configured && <Box bg="yellow.50" p="12px" borderRadius="md" mb="16px"><Text fontSize="sm">{translate('common.assistant.notConfigured')}</Text></Box>}
        <HStack mb="16px"><Button size="sm" onClick={() => { setSelected(''); setComposing(false); }}>{translate('common.assistant.conversations')}</Button><Button size="sm" colorScheme="blue" onClick={() => { setSelected(''); setComposing(true); }}>{translate('common.assistant.newMessage')}</Button></HStack>
        {composing ? <Stack spacing="16px">
          <ButtonGroup isAttached><Button aria-pressed={mode === 'QUESTION'} colorScheme={mode === 'QUESTION' ? 'blue' : 'gray'} onClick={() => setMode('QUESTION')}>{translate('common.assistant.question')}</Button><Button aria-pressed={mode === 'FEEDBACK'} colorScheme={mode === 'FEEDBACK' ? 'blue' : 'gray'} onClick={() => setMode('FEEDBACK')}>{translate('common.assistant.feedback')}</Button><Button aria-pressed={mode === 'REQUEST'} colorScheme={mode === 'REQUEST' ? 'blue' : 'gray'} onClick={() => setMode('REQUEST')}>{translate('common.assistant.newRequest')}</Button></ButtonGroup>
          <Text fontSize="sm" color="gray.600">{mode === 'REQUEST' ? translate('common.assistant.independentPage') : translate('common.assistant.aboutPage', { page: location.pathname })}</Text>
          <Textarea aria-label={mode === 'QUESTION' ? translate('common.assistant.yourQuestion') : mode === 'REQUEST' ? translate('common.assistant.yourRequest') : translate('common.assistant.yourFeedback')} placeholder={mode === 'QUESTION' ? translate('common.assistant.questionPlaceholder') : mode === 'REQUEST' ? translate('common.assistant.requestPlaceholder') : translate('common.assistant.feedbackPlaceholder')} value={body} onChange={e => setBody(e.target.value)} maxLength={8000} minH="160px" />
          <Text fontSize="sm" color="gray.600">{mode === 'QUESTION' ? translate('common.assistant.questionHint') : mode === 'REQUEST' ? translate('common.assistant.requestHint') : translate('common.assistant.feedbackHint')}</Text>
          <Button colorScheme="blue" isLoading={creating} isDisabled={!body.trim()} onClick={() => submit()}>{translate('common.assistant.send')}</Button>
        </Stack> : !selected ? <Stack spacing="12px">
          {developer && <Select aria-label={translate('common.assistant.filterInbox')} value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">{translate('common.assistant.allConversations')}</option><option value="REVIEW">{translate('common.assistant.needsReview')}</option><option value="PROGRESS">{translate('common.assistant.inProgress')}</option><option value="READY_TO_TEST">{translate('common.assistant.readyToTest')}</option><option value="RESOLVED">{translate('common.assistant.resolved')}</option><option value="DEFERRED">{translate('common.assistant.deferred')}</option><option value="DISMISSED">{translate('common.assistant.dismissed')}</option></Select>}
          {isLoading && <Spinner label={translate('common.assistant.loading')} />}{listError && <Text role="alert">{translate('common.assistant.listError')}</Text>}
          {!isLoading && !listError && !visible.length && <Text color="gray.600">{translate('common.assistant.empty')}</Text>}
          {visible.map(t => <Box key={t.id} as="button" textAlign="left" borderWidth="1px" borderRadius="md" p="14px" onClick={() => setSelected(t.id)}>
            <HStack mb="6px"><Badge>{t.mode === 'QUESTION' ? translate('common.assistant.question') : t.page ? translate('common.assistant.feedback') : translate('common.assistant.newRequest')}</Badge><Badge colorScheme={t.status === 'READY_TO_TEST' ? 'green' : 'blue'}>{translate(`common.assistant.status.${t.status}`, { defaultValue: label(t.status) })}</Badge>{seen[t.id] !== t.updatedAt && <Badge colorScheme="orange">{translate('common.assistant.new')}</Badge>}</HStack>
            <Text noOfLines={2}>{t.preview}</Text><Text fontSize="xs" color="gray.500" mt="4px">{t.page || translate('common.assistant.noPage')} · {new Date(t.updatedAt).toLocaleString(i18n.language === 'am' ? 'hy-AM' : 'en-US')}</Text>
          </Box>)}
        </Stack> : !thread ? <>{detailError ? <Text role="alert">{translate('common.assistant.unavailable')}</Text> : <Spinner label={translate('common.assistant.loading')} />}</> : <Stack spacing="16px">
          <Flex justify="space-between"><Badge>{translate(`common.assistant.status.${thread.status}`, { defaultValue: label(thread.status) })}</Badge>{isFetching && <Spinner size="xs" label={translate('common.assistant.loading')} />}</Flex>
          <Text fontSize="sm">{thread.page ? <Link href={thread.page} color="blue.600">{translate('common.assistant.openPage', { page: thread.page })}</Link> : translate('common.assistant.noPage')} · {translate('common.assistant.release', { release: thread.release })}</Text>
          {thread.messages.map(m => <Box key={m.id} p="12px" bg={m.kind === 'AI' ? 'blue.50' : m.kind === 'SYSTEM' ? 'gray.50' : 'gray.100'} borderRadius="md">
            <Text fontSize="xs" fontWeight="bold" mb="4px">{m.kind === 'AI' ? translate('common.assistant.aiAssistant') : m.kind === 'SYSTEM' ? translate('common.assistant.update') : m.authorId === String(userId) ? translate('common.assistant.you') : translate('common.assistant.reviewer')}</Text><Text whiteSpace="pre-wrap">{m.body}</Text>
          </Box>)}
          {active && <Text fontSize="sm" color="gray.600">{configured ? translate('common.assistant.processing') : translate('common.assistant.waiting')}</Text>}
          {thread.runs.some(r => r.status === 'FAILED') && <Text fontSize="sm" color="red.600">{translate('common.assistant.failedJob')}{developer ? translate('common.assistant.developerFailure') : translate('common.assistant.contributorFailure')}</Text>}
          {developer && thread.runs.filter(r => r.error || r.result).map(r => <Box key={r.id} borderWidth="1px" p="12px" borderRadius="md"><Text fontWeight="bold">{translate(`common.assistant.kind.${r.kind}`, { defaultValue: label(r.kind) })} · {translate(`common.assistant.status.${r.status}`, { defaultValue: label(r.status) })}</Text>{r.error && <Text whiteSpace="pre-wrap">{r.error}</Text>}{r.result?.summary && <Text whiteSpace="pre-wrap">{r.result.summary}</Text>}{r.result?.pullRequests?.map(url => <Link display="block" key={url} href={url} isExternal color="blue.600">{translate('common.assistant.reviewPr')}</Link>)}</Box>)}
          <Textarea aria-label={translate('common.assistant.reply')} placeholder={translate('common.assistant.replyPlaceholder')} value={reply} onChange={e => setReply(e.target.value)} maxLength={8000} />
          <Button isLoading={acting} isDisabled={!reply.trim()} onClick={() => perform('messages', { body: reply })}>{translate('common.assistant.sendReply')}</Button>
          {thread.mode === 'QUESTION' && <><Button variant="outline" isLoading={creating} onClick={() => submit('FEEDBACK', thread.messages.filter(m => m.kind !== 'SYSTEM').map(m => `${m.kind}: ${m.body}`).join('\n').slice(-8000))}>{translate('common.assistant.asFeedback')}</Button>{developer && <Button isDisabled={busy || active} onClick={() => perform('plan')}>{translate('common.assistant.retryAnswer')}</Button>}</>}
          {thread.status === 'READY_TO_TEST' && <ButtonGroup><Button colorScheme="green" isDisabled={busy} onClick={() => perform('status', { status: 'RESOLVED' })}>{translate('common.assistant.looksGood')}</Button><Button isDisabled={busy} onClick={() => perform('status', { status: 'OPEN' })}>{translate('common.assistant.needsWork')}</Button></ButtonGroup>}
          {developer && thread.mode === 'FEEDBACK' && <Box borderTopWidth="1px" pt="16px">
            <Heading size="sm" mb="12px">{translate('common.assistant.developerReview')}</Heading>
            {plan ? <Stack spacing="12px">
              <Text fontSize="sm">{translate('common.assistant.planVersion', { version: plan.version })}{stale ? translate('common.assistant.stale') : ''}</Text>
              {editing ? <><Textarea aria-label={translate('common.assistant.editPlanLabel')} minH="300px" value={planBody} maxLength={40000} onChange={e => setPlanBody(e.target.value)} /><Button isLoading={acting} isDisabled={!planBody.trim()} onClick={() => perform('plans', { basePlanId: plan.id, body: planBody })}>{translate('common.assistant.saveVersion')}</Button><Button variant="ghost" onClick={() => setEditing(false)}>{translate('common.assistant.cancelEdit')}</Button></> : <><Text whiteSpace="pre-wrap">{plan.body}</Text><Button isDisabled={busy || active || stale} onClick={() => { setPlanBody(plan.body); setEditing(true); }}>{translate('common.assistant.editPlan')}</Button></>}
              {!editing && thread.status === 'NEEDS_REVIEW' && !approved && <>
                {confirmApproval ? <Box bg="orange.50" p="12px"><Text mb="8px">{translate('common.assistant.confirmCoding', { version: plan.version })}</Text><ButtonGroup><Button colorScheme="green" isLoading={acting} isDisabled={active || stale} onClick={() => perform('approve', { planId: plan.id })}>{translate('common.assistant.confirmStart')}</Button><Button onClick={() => setConfirmApproval(false)}>{translate('common.assistant.cancel')}</Button></ButtonGroup></Box> : <Button colorScheme="green" isDisabled={busy || active || stale} onClick={() => setConfirmApproval(true)}>{translate('common.assistant.approveStart')}</Button>}
              </>}
              {thread.plans.length > 1 && <details><summary>{translate('common.assistant.previousVersions')}</summary>{thread.plans.slice(1).map(p => <Box key={p.id} py="12px"><Text fontWeight="bold">{translate('common.assistant.version', { version: p.version })}</Text><Text whiteSpace="pre-wrap">{p.body}</Text></Box>)}</details>}
            </Stack> : <Text mb="12px">{translate('common.assistant.planPending')}</Text>}
            <Stack mt="16px" spacing="8px"><Button isDisabled={busy || active} onClick={() => perform('plan')}>{plan ? translate('common.assistant.regenerate') : translate('common.assistant.generate')}</Button>
              <ButtonGroup flexWrap="wrap"><Button size="sm" isDisabled={busy || uncancellable} onClick={() => perform('status', { status: 'DEFERRED' })}>{translate('common.assistant.defer')}</Button><Button size="sm" isDisabled={busy || uncancellable} onClick={() => perform('status', { status: 'DISMISSED' })}>{translate('common.assistant.dismiss')}</Button>{thread.status === 'CODE_REVIEW' && <Button size="sm" colorScheme="green" isDisabled={busy} onClick={() => perform('status', { status: 'READY_TO_TEST' })}>{translate('common.assistant.deployed')}</Button>}</ButtonGroup>
            </Stack>
          </Box>}
        </Stack>}
      </DrawerBody>
    </DrawerContent>
  </Drawer>;
}
