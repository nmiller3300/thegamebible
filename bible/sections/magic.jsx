/* Game Bible — sections/magic.jsx — The Blood of Power */
const Ym = window.YSTC;

const SUGGESTED = [
  { title:'Magic Equals Status',        status:'confirmed' },
  { title:'The Ascended',               status:'confirmed' },
  { title:'The Veilborn',               status:'confirmed' },
  { title:'Magic and Class',            status:'confirmed' },
  { title:'Why Magic Matters',          status:'confirmed' },
  { title:'Name of the Magic System',   status:'pending'   },
  { title:'Schools and Types of Magic', status:'pending'   },
  { title:'The Cost of Casting',        status:'pending'   },
  { title:'Regulating Organization',    status:'pending'   },
  { title:'Magical Locations',          status:'pending'   },
];


function MagicBlockForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ section:'', content:'', isConfirmed:false, ...(entry||{}) });
  useEffect(() => { setD({ section:'', content:'', isConfirmed:false, ...(entry||{}) }); }, [entry]);
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head"><h2>{entry && entry.id ? 'Edit block' : 'Add a block'}</h2><div className="doc-code">MAGIC-001</div></div>
      <Field label="Title"><TextInput value={d.section} onChange={(v) => setD({...d,section:v})} /></Field>
      <Field label="Content"><TextArea value={d.content} onChange={(v) => setD({...d,content:v})} rows={7} /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.isConfirmed} onChange={(b) => setD({...d,isConfirmed:b})} />
        <div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.section?.trim()} onClick={() => onSave(d)}>{entry && entry.id ? 'Save' : 'Add'}</button></div>
      </div>
    </Modal>
  );
}

function MagicSection() {
  const store = Ym.useStore();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const confirmedBlocks = store.magicEntries.filter(b => b.isConfirmed);
  const pendingBlocks   = store.magicEntries.filter(b => !b.isConfirmed);

  function addSuggested(s) {
    Ym.addEntry('magicEntries', { section: s.title, content: '', isConfirmed: s.status === 'confirmed' });
    Ym.logActivity('Magic', 'added', s.title);
  }
  function saveBlock(data) {
    if (editing && editing.id) { Ym.updateEntry('magicEntries', editing.id, data); Ym.logActivity('Magic', 'edited', data.section); }
    else { Ym.addEntry('magicEntries', data); Ym.logActivity('Magic', 'added', data.section); }
    setEditing(null); setAdding(false);
  }
  function deleteBlock(id) { Ym.deleteEntry('magicEntries', id); Ym.logActivity('Magic', 'removed', 'a block'); }

  const existing = new Set(store.magicEntries.map(b => b.section));

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>System · The Blood of Power</div>
          <h1 className="dossier-h1">Magic <em>System</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            Magic equals status. The social mechanics are confirmed. The schools, costs, and physical nature of magic are still being defined.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>MAGIC-001</div>
          <div><span>blocks</span>{store.magicEntries.length}</div>
          <div><span>confirmed</span>{confirmedBlocks.length}</div>
          <div><span>pending</span>{pendingBlocks.length}</div>
        </div>
      </div>

      <div className="spread" style={{ marginBottom:18 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ash)' }}>
          Suggested blocks · drop-in
        </div>
        <button className="btn primary small" onClick={() => setAdding(true)}><Icon name="plus" size={11}/> Add block</button>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:32 }}>
        {SUGGESTED.filter(s => !existing.has(s.title)).map(s => (
          <button key={s.title} className="btn small" style={{ borderColor: s.status==='confirmed' ? 'var(--moss)' : 'var(--rule-dark)', color: s.status==='confirmed' ? 'var(--moss)' : 'var(--ash)' }} onClick={() => addSuggested(s)}>
            <Icon name="plus" size={10}/> {s.title} · <span style={{ opacity:0.6 }}>{s.status}</span>
          </button>
        ))}
      </div>

      {store.magicEntries.length === 0 ? (
        <EmptyState dark title="No magic blocks yet." body="Click a suggested block above or add a custom one." action={<button className="btn primary" onClick={() => setAdding(true)}><Icon name="plus" size={13}/> Add the first block</button>} />
      ) : (
        <div className="stack">
          {confirmedBlocks.length > 0 && <>
            <div className="section-mark">Confirmed</div>
            {confirmedBlocks.map(b => <MagicBlock key={b.id} block={b} onEdit={() => setEditing(b)} onDelete={() => deleteBlock(b.id)} />)}
          </>}
          {pendingBlocks.length > 0 && <>
            <div className="section-mark">Pending</div>
            {pendingBlocks.map(b => <MagicBlock key={b.id} block={b} onEdit={() => setEditing(b)} onDelete={() => deleteBlock(b.id)} />)}
          </>}
        </div>
      )}

      {(editing || adding) && (
        <MagicBlockForm entry={editing} onClose={() => { setEditing(null); setAdding(false); }} onSave={saveBlock} />
      )}
    </Section>
  );
}

function MagicBlock({ block, onEdit, onDelete }) {
  return (
    <article className={'paper-card' + (!block.isConfirmed ? ' tbd' : '')}>
      <div className="card-head">
        <h3>{block.section}</h3>
        <div className="row" style={{ gap:8 }}>
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={11}/></button>
          <span className={'status-dot ' + (block.isConfirmed ? 'confirmed' : 'pending')}></span>
        </div>
      </div>
      {block.content ? block.content.split(/\n+/).map((p,i) => <p key={i}>{p}</p>) : <p className="muted italic">No content yet.</p>}
      <div style={{ marginTop:12, paddingTop:10, borderTop:'1px dashed var(--rule)' }}><Attrib entry={block} /></div>
    </article>
  );
}

window.MagicSection = MagicSection;
