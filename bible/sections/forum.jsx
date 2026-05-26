/* Game Bible — sections/forum.jsx
 * Threads + replies. Routing: '#/forum'        → list
 *                            '#/forum/<id>'    → single thread
 */
const Yfo = window.YSTC;

const SECTION_TAGS = [
  'The Brain','Bestiary','Characters','Factions and Politics','Magic System',
  'World and Geography','Lore and History','Economy and Trade','Military and Warfare',
  'Society and Reputation','Artifacts and Relics','Dev Log','General',
];

function ForumSection({ route, navigate }) {
  const store = Yfo.useStore();
  const [composing, setComposing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');

  // detect /forum/<id> sub-route
  const parts = route.split('/');
  const threadId = parts.length > 1 ? parts[1] : null;
  const thread = threadId ? store.forumThreads.find((t) => t.id === threadId) : null;

  const me = Yfo.currentDisplayName();

  // Mark current thread as read on view — must run unconditionally for hook order
  useEffect(() => {
    if (!thread) return;
    if (!(thread.readBy || []).includes(me)) {
      Yfo.updateEntry('forumThreads', thread.id, { readBy: [...(thread.readBy || []), me] });
    }
    // eslint-disable-next-line
  }, [thread && thread.id]);

  function newThread(data) {
    const me = Yfo.currentDisplayName();
    const entry = {
      id: Yfo.uid(),
      title: data.title,
      content: data.content,
      sectionTag: data.sectionTag,
      authorDisplayName: me,
      status: 'open',
      createdAt: Yfo.nowISO(),
      updatedAt: Yfo.nowISO(),
      readBy: [me],
    };
    Yfo.setStore({ forumThreads: [entry, ...store.forumThreads] });
    Yfo.logActivity('Forum', 'opened thread', data.title);
    setComposing(false);
    navigate('forum/' + entry.id);
  }

  function postReply(threadObj, content) {
    const me = Yfo.currentDisplayName();
    const reply = {
      id: Yfo.uid(),
      threadId: threadObj.id,
      content,
      authorDisplayName: me,
      createdAt: Yfo.nowISO(),
    };
    Yfo.setStore({
      forumReplies: [...store.forumReplies, reply],
      forumThreads: store.forumThreads.map((t) => t.id === threadObj.id
        ? { ...t, updatedAt: Yfo.nowISO(), readBy: [me] }   // marks unread for everyone else
        : t),
    });
    Yfo.logActivity('Forum', 'replied to', threadObj.title);
  }

  function toggleStatus(t) {
    const next = t.status === 'open' ? 'resolved' : 'open';
    Yfo.updateEntry('forumThreads', t.id, { status: next });
    Yfo.logActivity('Forum', next === 'resolved' ? 'resolved' : 'reopened', t.title);
  }

  // Single-thread view
  if (thread) {
    const replies = store.forumReplies.filter((r) => r.threadId === thread.id);
    return (
      <Section>
        <div className="row" style={{ marginBottom: 16 }}>
          <button className="btn ghost small" onClick={() => navigate('forum')}><Icon name="chevron" size={11} style={{ transform: 'rotate(180deg)' }}/> Back to threads</button>
        </div>
        <DocHead
          kicker={'Forum thread · ' + thread.sectionTag}
          title={thread.title}
          deck=""
          code="FORUM-001"
          codeMeta={{ status: thread.status, replies: replies.length, opened: Yfo.formatStamp(thread.createdAt) }}
        />

        <article className="paper-card spacious" style={{ marginBottom: 22 }}>
          <div className="spread" style={{ marginBottom: 10 }}>
            <span className="attrib"><b>{thread.authorDisplayName}</b><span className="sep">·</span><span>{Yfo.formatStamp(thread.createdAt)}</span></span>
            <div className="row">
              <span className="tag-badge">{thread.sectionTag}</span>
              <StatusPill status={thread.status} />
            </div>
          </div>
          {thread.content.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
          <div className="spread" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--rule)' }}>
            <button className="btn on-paper small" onClick={() => toggleStatus(thread)}>
              {thread.status === 'open' ? 'Mark as resolved' : 'Reopen thread'}
            </button>
            <button className="btn on-paper small danger" onClick={() => setDeleting(thread)}>
              <Icon name="trash" size={10}/> Delete thread
            </button>
          </div>
        </article>

        <SectionMark>Replies</SectionMark>
        {replies.length === 0 ? (
          <EmptyState icon="chat" title="No replies yet." body="The first reply unlocks the thread for the other user." />
        ) : (
          <div style={{ marginBottom: 22 }}>
            {replies.map((r) => (
              <div key={r.id} className="reply">
                <div className="head">
                  <span className="author">{r.authorDisplayName}</span>
                  <span className="when">{Yfo.formatStamp(r.createdAt)}</span>
                </div>
                <div className="body">{r.content.split(/\n+/).map((p, i) => <p key={i} style={{ margin:'2px 0' }}>{p}</p>)}</div>
              </div>
            ))}
          </div>
        )}

        <ReplyComposer onPost={(c) => postReply(thread, c)} />

        <ConfirmDialog
          open={!!deleting}
          title="Delete this thread?"
          body="The thread and all of its replies will be removed."
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            Yfo.setStore({
              forumThreads: store.forumThreads.filter((t) => t.id !== deleting.id),
              forumReplies: store.forumReplies.filter((r) => r.threadId !== deleting.id),
            });
            Yfo.logActivity('Forum', 'deleted thread', deleting.title);
            navigate('forum');
            setDeleting(null);
          }}
        />
      </Section>
    );
  }

  // Index view
  const visible = store.forumThreads.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'open') return t.status === 'open';
    if (filter === 'resolved') return t.status === 'resolved';
    if (filter === 'unread') return !(t.readBy || []).includes(me);
    return true;
  });

  return (
    <Section>
      <DocHead
        kicker="Studio · Internal communication"
        title="The"
        titleEm="Forum"
        deck="Where the two creators talk things through. Tag each thread with a section so it stays linked to where decisions land."
        code="FORUM-001"
        codeMeta={{ threads: store.forumThreads.length, open: store.forumThreads.filter((t) => t.status === 'open').length }}
      />

      <div className="spread" style={{ marginBottom: 18 }}>
        <div className="row wrap">
          {['all','open','resolved','unread'].map((f) => (
            <button key={f} className={'btn small ' + (filter === f ? 'primary' : 'ghost')} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button className="btn primary" onClick={() => setComposing(true)}><Icon name="plus" size={13}/> New thread</button>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="chat" title="The forum is quiet." body="Threads opened by either user appear here. Tag each one with the section it concerns; threads without replies surface on the Dashboard so nothing falls through." action={<button className="btn on-paper primary" onClick={() => setComposing(true)}><Icon name="plus" size={12}/> Open the first thread</button>} />
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {visible.map((t) => {
            const unread = !(t.readBy || []).includes(me);
            const replies = store.forumReplies.filter((r) => r.threadId === t.id).length;
            return (
              <article key={t.id} className="thread" onClick={() => navigate('forum/' + t.id)}
                style={ unread ? { boxShadow: '0 14px 28px -22px oklch(0 0 0 / 0.5), inset 0 0 0 1px var(--imperial-soft)' } : undefined }
              >
                <div className="head">
                  <div className="title">
                    {unread && <span style={{ color: 'var(--imperial)', marginRight: 8 }}>\u25cf</span>}
                    {t.title}
                  </div>
                  <span className="tag-badge">{t.sectionTag}</span>
                </div>
                <p className="preview">{t.content.slice(0, 200)}{t.content.length > 200 ? '…' : ''}</p>
                <div className="meta">
                  <span><b style={{ color: 'var(--ink-2)' }}>{t.authorDisplayName}</b> · opened {Yfo.relativeStamp(t.createdAt)}</span>
                  <span>{replies} {replies === 1 ? 'reply' : 'replies'}</span>
                  <StatusPill status={t.status} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {composing && <ThreadComposer onCancel={() => setComposing(false)} onSave={newThread} />}
    </Section>
  );
}

function ThreadComposer({ onCancel, onSave }) {
  const [d, setD] = useState({ title: '', content: '', sectionTag: 'General' });
  return (
    <Modal open={true} onClose={onCancel} width="wide">
      <div className="modal-head">
        <div><h2>Open a new thread</h2><div className="tiny-label" style={{ marginTop:6 }}>Forum · thread</div></div>
        <div className="doc-code">FORUM-001 · NEW</div>
      </div>
      <Field label="Title"><TextInput value={d.title} onChange={(v) => setD({ ...d, title: v })} placeholder="What to call the wolf in the Iron Hills" /></Field>
      <Field label="Section tag (required)"><Select value={d.sectionTag} onChange={(v) => setD({ ...d, sectionTag: v })} options={SECTION_TAGS} /></Field>
      <Field label="Body"><TextArea value={d.content} onChange={(v) => setD({ ...d, content: v })} rows={7} /></Field>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onCancel}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.title.trim() || !d.content.trim()} onClick={() => onSave(d)}>Open thread</button>
        </div>
      </div>
    </Modal>
  );
}

function ReplyComposer({ onPost }) {
  const [v, setV] = useState('');
  function send() { if (!v.trim()) return; onPost(v.trim()); setV(''); }
  return (
    <article className="paper-card">
      <div className="eyebrow muted">Reply</div>
      <Field label={'As ' + Yfo.currentDisplayName()}>
        <TextArea value={v} onChange={setV} rows={3} placeholder="…" />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn on-paper primary" onClick={send} disabled={!v.trim()}><Icon name="plus" size={11}/> Post reply</button>
      </div>
    </article>
  );
}

window.ForumSection = ForumSection;
