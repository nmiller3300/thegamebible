/* Game Bible — sections/devlog.jsx
 * Append-only attributed log. No editing — delete-only with confirmation.
 */
const Ydl = window.YSTC;

function DevLogSection() {
  const store = Ydl.useStore();
  const [draft, setDraft] = useState('');
  const [deleting, setDeleting] = useState(null);

  function post() {
    const t = draft.trim();
    if (!t) return;
    const me = Ydl.currentDisplayName();
    const entry = {
      id: Ydl.uid(),
      content: t,
      authorDisplayName: me,
      createdAt: Ydl.nowISO(),
    };
    Ydl.setStore({ devLog: [entry, ...store.devLog] });
    Ydl.logActivity('Dev Log', 'posted', t.slice(0, 60));
    setDraft('');
  }

  return (
    <Section>
      <DocHead
        kicker="Studio · Decisions of record"
        title="Dev"
        titleEm="Log"
        deck="Every confirmed decision, name, system rule, or lore choice made during development. Once posted, entries cannot be edited \u2014 only deleted with confirmation."
        code="DEV-001"
        codeMeta={{ entries: store.devLog.length }}
      />

      <article className="paper-card spacious" style={{ marginBottom: 26 }}>
        <div className="eyebrow muted">New entry</div>
        <Field label={'Posting as ' + Ydl.currentDisplayName()}>
          <TextArea value={draft} onChange={setDraft} rows={4} placeholder="e.g. The capital is named Cair Veylan. Confirmed in today's meeting." />
        </Field>
        <div className="spread">
          <span className="muted italic" style={{ fontSize: 14 }}>An honest record of how decisions were actually made.</span>
          <button className="btn on-paper primary" onClick={post} disabled={!draft.trim()}>
            <Icon name="plus" size={12}/> Post entry
          </button>
        </div>
      </article>

      <SectionMark>Entries, newest first</SectionMark>
      {store.devLog.length === 0 ? (
        <EmptyState
          icon="log"
          title="The log starts empty."
          body="Once decisions begin landing, post them here. Each entry stamps the author and the time. Entries are immutable \u2014 if a decision changes, post a new entry rather than rewriting an old one."
        />
      ) : (
        <div className="stack">
          {store.devLog.map((e) => (
            <article key={e.id} className="paper-card">
              <div className="spread" style={{ alignItems: 'baseline', marginBottom: 8 }}>
                <span className="attrib">
                  <span>posted</span>
                  <b>{e.authorDisplayName}</b>
                  <span className="sep">·</span>
                  <span>{Ydl.formatStamp(e.createdAt)}</span>
                </span>
                <button className="btn on-paper small danger" onClick={() => setDeleting(e)}><Icon name="trash" size={10}/> Delete</button>
              </div>
              {e.content.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this entry?"
        body="Entries are normally immutable. Deleting removes it permanently and cannot be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          Ydl.setStore({ devLog: store.devLog.filter((x) => x.id !== deleting.id) });
          Ydl.logActivity('Dev Log', 'deleted', deleting.content.slice(0, 60));
          setDeleting(null);
        }}
      />
    </Section>
  );
}

window.DevLogSection = DevLogSection;
