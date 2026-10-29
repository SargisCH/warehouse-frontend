import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, ButtonGroup, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay,
  Flex, Heading, HStack, Link, Select, Spinner, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useAssistantAccessQuery, useAssistantThreadsQuery, useAssistantThreadQuery, useCreateAssistantThreadMutation, useAssistantActionMutation } from 'api/assistant';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';

const label = (s: string) => s.toLowerCase().replace(/_/g, ' ');
const failure = (e: any) => {
  const message = e?.data?.message || e?.data?.error || 'The request failed. Your draft is still here.';
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
  const { currentData: threads = [] } = useAssistantThreadsQuery(userId, { pollingInterval: 30000 });
  let seen: Record<string, string> = {};
  try { seen = JSON.parse(localStorage.getItem(`assistant-seen-${userId}`) || '{}'); } catch { /* optional */ }
  const ready = threads.filter(t => t.status === 'READY_TO_TEST' && seen[t.id] !== t.updatedAt).length;
  return <Button position="fixed" bottom="24px" right="24px" zIndex={1200} colorScheme="blue" boxShadow="lg" onClick={onOpen}>Ask or suggest{ready > 0 && <Badge ml="8px" colorScheme="green">{ready} ready to test</Badge>}</Button>;
}
function Panel({ developer, configured, close }: { developer: boolean; configured: boolean; close: () => void }) {
  const location = useLocation();
  const toast = useToast();
  const userId = useSelector((state: RootState) => state.user.id);
  const [selected, setSelected] = useState('');
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [mode, setMode] = useState<'QUESTION' | 'FEEDBACK'>(() => {
    try { return localStorage.getItem(`assistant-mode-${userId}`) === 'FEEDBACK' ? 'FEEDBACK' : 'QUESTION'; } catch { return 'QUESTION'; }
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
      toast({ status: 'success', title: kind === 'approve' ? 'Approved plan queued for implementation' : 'Saved' });
    } catch (e) { toast({ status: 'error', title: failure(e) }); }
  };
  const submit = async (nextMode = mode, content = body) => {
    if (!content.trim()) return;
    try {
      const result = await create({ mode: nextMode, body: content.trim(), page: location.pathname,
        release: process.env.REACT_APP_RELEASE || 'unknown', browser: navigator.userAgent.slice(0, 300) }).unwrap();
      setSelected(result.id); setComposing(false); setBody('');
      try { localStorage.setItem(`assistant-mode-${userId}`, nextMode); } catch { /* optional */ }
      toast({ status: 'success', title: nextMode === 'FEEDBACK' ? 'Thanks—your suggestion has been sent for review.' : 'Question saved' });
    } catch (e) { toast({ status: 'error', title: failure(e) }); }
  };
  const visible = threads.filter(t => filter === 'ALL' ||
    (filter === 'REVIEW' && t.mode === 'FEEDBACK' && ['OPEN', 'NEEDS_REVIEW'].includes(t.status)) ||
    (filter === 'PROGRESS' && ['IN_PROGRESS', 'CODE_REVIEW'].includes(t.status)) || t.status === filter);
  return <Drawer isOpen placement="right" onClose={close} size="lg">
    <DrawerOverlay /><DrawerContent><DrawerCloseButton /><DrawerHeader>{developer ? 'Assistant & review inbox' : 'Ask or suggest'}</DrawerHeader>
      <DrawerBody pb="24px">
        {!configured && <Box bg="yellow.50" p="12px" borderRadius="md" mb="16px"><Text fontSize="sm">AI is not configured yet. Messages and feedback are saved; answers and plans will run after Gemini is connected.</Text></Box>}
        <HStack mb="16px"><Button size="sm" onClick={() => { setSelected(''); setComposing(false); }}>Conversations</Button><Button size="sm" colorScheme="blue" onClick={() => { setSelected(''); setComposing(true); }}>New message</Button></HStack>
        {composing ? <Stack spacing="16px">
          <ButtonGroup isAttached><Button aria-pressed={mode === 'QUESTION'} colorScheme={mode === 'QUESTION' ? 'blue' : 'gray'} onClick={() => setMode('QUESTION')}>Question</Button><Button aria-pressed={mode === 'FEEDBACK'} colorScheme={mode === 'FEEDBACK' ? 'blue' : 'gray'} onClick={() => setMode('FEEDBACK')}>Feedback</Button></ButtonGroup>
          <Text fontSize="sm" color="gray.600">About this page: {location.pathname}</Text>
          <Textarea aria-label={mode === 'QUESTION' ? 'Your question' : 'Your feedback'} placeholder={mode === 'QUESTION' ? 'What would you like to know?' : 'What would you like improved?'} value={body} onChange={e => setBody(e.target.value)} maxLength={8000} minH="160px" />
          <Text fontSize="sm" color="gray.600">{mode === 'QUESTION' ? 'AI answers questions about the app.' : 'Your suggestion goes to a developer for review before any changes start.'}</Text>
          <Button colorScheme="blue" isLoading={creating} isDisabled={!body.trim()} onClick={() => submit()}>Send</Button>
        </Stack> : !selected ? <Stack spacing="12px">
          {developer && <Select aria-label="Filter review inbox" value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All conversations</option><option value="REVIEW">Needs review</option><option value="PROGRESS">In progress</option><option value="READY_TO_TEST">Ready to test</option><option value="RESOLVED">Resolved</option><option value="DEFERRED">Deferred</option><option value="DISMISSED">Dismissed</option></Select>}
          {isLoading && <Spinner />}{listError && <Text role="alert">Could not load conversations. Please reopen the panel.</Text>}
          {!isLoading && !listError && !visible.length && <Text color="gray.600">No conversations yet. Start with a question or suggestion.</Text>}
          {visible.map(t => <Box key={t.id} as="button" textAlign="left" borderWidth="1px" borderRadius="md" p="14px" onClick={() => setSelected(t.id)}>
            <HStack mb="6px"><Badge>{t.mode === 'QUESTION' ? 'Question' : 'Feedback'}</Badge><Badge colorScheme={t.status === 'READY_TO_TEST' ? 'green' : 'blue'}>{label(t.status)}</Badge>{seen[t.id] !== t.updatedAt && <Badge colorScheme="orange">New</Badge>}</HStack>
            <Text noOfLines={2}>{t.preview}</Text><Text fontSize="xs" color="gray.500" mt="4px">{t.page} · {new Date(t.updatedAt).toLocaleString()}</Text>
          </Box>)}
        </Stack> : !thread ? <>{detailError ? <Text role="alert">Conversation unavailable.</Text> : <Spinner />}</> : <Stack spacing="16px">
          <Flex justify="space-between"><Badge>{label(thread.status)}</Badge>{isFetching && <Spinner size="xs" />}</Flex>
          <Text fontSize="sm"><Link href={thread.page} color="blue.600">Open {thread.page}</Link> · Release {thread.release}</Text>
          {thread.messages.map(m => <Box key={m.id} p="12px" bg={m.kind === 'AI' ? 'blue.50' : m.kind === 'SYSTEM' ? 'gray.50' : 'gray.100'} borderRadius="md">
            <Text fontSize="xs" fontWeight="bold" mb="4px">{m.kind === 'AI' ? 'AI assistant' : m.kind === 'SYSTEM' ? 'Update' : m.authorId === String(userId) ? 'You' : 'Reviewer'}</Text><Text whiteSpace="pre-wrap">{m.body}</Text>
          </Box>)}
          {active && <Text fontSize="sm" color="gray.600">{configured ? 'Queued or processing. Updates appear here automatically.' : 'Saved and waiting for Gemini setup.'}</Text>}
          {thread.runs.some(r => r.status === 'FAILED') && <Text fontSize="sm" color="red.600">A previous AI job failed. Your messages are saved.{developer ? ' Check the job details below.' : ' A developer can review and retry it.'}</Text>}
          {developer && thread.runs.filter(r => r.error || r.result).map(r => <Box key={r.id} borderWidth="1px" p="12px" borderRadius="md"><Text fontWeight="bold">{label(r.kind)} · {label(r.status)}</Text>{r.error && <Text whiteSpace="pre-wrap">{r.error}</Text>}{r.result?.summary && <Text whiteSpace="pre-wrap">{r.result.summary}</Text>}{r.result?.pullRequests?.map(url => <Link display="block" key={url} href={url} isExternal color="blue.600">Review pull request</Link>)}</Box>)}
          <Textarea aria-label="Reply" placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)} maxLength={8000} />
          <Button isLoading={acting} isDisabled={!reply.trim()} onClick={() => perform('messages', { body: reply })}>Send reply</Button>
          {thread.mode === 'QUESTION' && <><Button variant="outline" isLoading={creating} onClick={() => submit('FEEDBACK', thread.messages.filter(m => m.kind !== 'SYSTEM').map(m => `${m.kind}: ${m.body}`).join('\n').slice(-8000))}>Send conversation as feedback</Button>{developer && <Button isDisabled={busy || active} onClick={() => perform('plan')}>Retry answer</Button>}</>}
          {thread.status === 'READY_TO_TEST' && <ButtonGroup><Button colorScheme="green" isDisabled={busy} onClick={() => perform('status', { status: 'RESOLVED' })}>Looks good</Button><Button isDisabled={busy} onClick={() => perform('status', { status: 'OPEN' })}>Still needs work</Button></ButtonGroup>}
          {developer && thread.mode === 'FEEDBACK' && <Box borderTopWidth="1px" pt="16px">
            <Heading size="sm" mb="12px">Developer review</Heading>
            {plan ? <Stack spacing="12px">
              <Text fontSize="sm">Plan version {plan.version}{stale ? ' · Feedback changed—regenerate before approval.' : ''}</Text>
              {editing ? <><Textarea aria-label="Edit implementation plan" minH="300px" value={planBody} maxLength={40000} onChange={e => setPlanBody(e.target.value)} /><Button isLoading={acting} isDisabled={!planBody.trim()} onClick={() => perform('plans', { basePlanId: plan.id, body: planBody })}>Save new version</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel edit</Button></> : <><Text whiteSpace="pre-wrap">{plan.body}</Text><Button isDisabled={busy || active || stale} onClick={() => { setPlanBody(plan.body); setEditing(true); }}>Edit plan</Button></>}
              {!editing && thread.status === 'NEEDS_REVIEW' && !approved && <>
                {confirmApproval ? <Box bg="orange.50" p="12px"><Text mb="8px">Start coding plan version {plan.version}? This authorizes a coding job. You still review the resulting PRs before release.</Text><ButtonGroup><Button colorScheme="green" isLoading={acting} isDisabled={active || stale} onClick={() => perform('approve', { planId: plan.id })}>Confirm & start</Button><Button onClick={() => setConfirmApproval(false)}>Cancel</Button></ButtonGroup></Box> : <Button colorScheme="green" isDisabled={busy || active || stale} onClick={() => setConfirmApproval(true)}>Approve & start</Button>}
              </>}
              {thread.plans.length > 1 && <details><summary>Previous plan versions</summary>{thread.plans.slice(1).map(p => <Box key={p.id} py="12px"><Text fontWeight="bold">Version {p.version}</Text><Text whiteSpace="pre-wrap">{p.body}</Text></Box>)}</details>}
            </Stack> : <Text mb="12px">The proposed plan will appear here after AI processing.</Text>}
            <Stack mt="16px" spacing="8px"><Button isDisabled={busy || active} onClick={() => perform('plan')}>{plan ? 'Regenerate plan' : 'Generate / retry plan'}</Button>
              <ButtonGroup flexWrap="wrap"><Button size="sm" isDisabled={busy || uncancellable} onClick={() => perform('status', { status: 'DEFERRED' })}>Defer</Button><Button size="sm" isDisabled={busy || uncancellable} onClick={() => perform('status', { status: 'DISMISSED' })}>Dismiss</Button>{thread.status === 'CODE_REVIEW' && <Button size="sm" colorScheme="green" isDisabled={busy} onClick={() => perform('status', { status: 'READY_TO_TEST' })}>Deployed—ready to test</Button>}</ButtonGroup>
            </Stack>
          </Box>}
        </Stack>}
      </DrawerBody>
    </DrawerContent>
  </Drawer>;
}
