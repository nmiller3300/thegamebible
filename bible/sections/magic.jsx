/* Game Bible — sections/magic.jsx */
const Ym = window.YSTC;

const SUGGESTED_CONFIRMED = [
  'Magic Equals Status', 'The Ascended', 'The Veilborn', 'Magic and Class', 'Why Magic Matters for Gameplay',
];
const SUGGESTED_PENDING = [
  'Name of the Magic System', 'Schools and Types of Magic', 'The Cost of Casting', 'Regulating Organization', 'Magical Locations',
];

function MagicSection() {
  const store = Ym.useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function save(data) {
    if (editing && editing.id) {
      Ym.updateEntry('magicEntries', editing.id, data);
      Ym.logActivity('Magic System', 'edited', data.title);
    } else {
      const saved = Ym.addEntry('magicEntries', data);
      Ym.logActivity('Magic System', 'added', saved.title);
    }
    setEditing(null);
  }
  function quickAdd(title, status) {
    setEditing({ title, body: '', status });
  }

  const confirmed = store.magicEntries.filter((b) => b.status === 'confirmed');
  const pending = store.magicEntries.filter((b) => b.status !== 'confirmed');

  return (
    <Section>
      <DocHead
        kicker="System · The Blood of Power"
        title="Magic"
        titleEm="System"
        deck="Magic equals status. The social mechanics are confirmed; the costs, schools, and regulation are still being decided."
        code="MAGIC-001"
        codeMeta={{ blocks: store.magicEntries.length, confirmed: confirmed.length, pending: pending.length }}
      />

      <div className="row" style={{ marginBottom: 22, justifyContent: 'flex-end' }}>
        <button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add block</button>
      </div>

      {store.magicEntries.length === 0 && (
        <>
          <SectionMark>Suggested blocks · drop-in</SectionMark>
          <div className="row wrap" style={{ marginBottom: 18 }}>
            {SUGGESTED_CONFIRMED.map((t) => (
              <button key={t} className="btn small" onClick={() => quickAdd(t, 'confirmed')}>
                <Icon name="plus" size={11}/> {t}
                <span style={{ color: 'var(--moss)', marginLeft: 8, fontSize: 9, letterSpacing: '0.16em' }}>· CONFIRMED</span>
              </button>
            ))}
            {SUGGESTED_PENDING.map((t) => (
              <button key={t} className="btn small ghost" onClick={() => quickAdd(t, 'pending')}>
                <Icon name="plus" size={11}/> {t}
                <span style={{ color: 'var(--imperial-soft)', marginLeft: 8, fontSize: 9, letterSpacing: '0.16em' }}>· PENDING</span>
              </button>
            ))}
          </div>
          <EmptyState
            icon="spark"
            title="No magic blocks yet."
            body="Magic is a flexible content-block system. Add as many blocks as the design needs. Each one has a title, body, and a confirmed/pending toggle so the document can carry conviction and uncertainty side by side."
            action={<button className="btn on-paper primary" onClick={() => setEditing({})}><Icon name="plus" size={12}/> Add the first block</button>}
          />
        </>
      )}

      {confirmed.length > 0 && (
        <>
          <SectionMark>Confirmed · canonical</SectionMark>
          <div className="stack">
            {confirmed.map((b) => <FreeBlock key={b.id} block={b} onEdit={() => setEditing(b)} onDelete={() => setDeleting(b)} />)}
          </div>
        </>
      )}

      {pending.length > 0 && (
        <>
          <SectionMark>Pending · still being decided</SectionMark>
          <div className="stack">
            {pending.map((b) => <FreeBlock key={b.id} block={b} onEdit={() => setEditing(b)} onDelete={() => setDeleting(b)} />)}
          </div>
        </>
      )}

      {editing !== null && (
        <FreeBlockEditor open={true} entry={editing.id ? editing : (editing.title ? editing : null)} onClose={() => setEditing(null)} onSave={save} hint="Magic system block" />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this block?"
        body={deleting ? `\u201C${deleting.title}\u201D will be removed.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { Ym.deleteEntry('magicEntries', deleting.id); Ym.logActivity('Magic System', 'removed', deleting.title); setDeleting(null); }}
      />
    </Section>
  );
}

window.MagicSection = MagicSection;
