/* Game Bible — sections/devlog.jsx — Dev Log + Decision Log */
const Ydl = window.YSTC;

function DevlogSection() {
  const store = Ydl.useStore();
  const [tab, setTab] = useState('decisions');
  const [draft, setDraft] = useState('');
  const [editingDecision, setEditingDecision] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function addNote() {
    if (!draft.trim()) return;
    Ydl.addEntry('devLog', { content: draft, authorDisplayName: Ydl.currentDisplayName() });
    Ydl.logActivity('Dev Log', 'added', 'note');
    setDraft('');
  }

  function saveDecision(data) {
    if (editingDecision && editingDecision.id) {
      Ydl.updateEntry('decisions', editingDecision.id, data);
      Ydl.logActivity('Decision Log', 'edited', data.what);
    } else {
      Ydl.addEntry('decisions', data);
      Ydl.logActivity('Decision Log', 'recorded', data.what);
    }
    setEditingDecision(null);
  }

  function confirmDelete() {
    if (!deleting) return;
    Ydl.deleteEntry(deleting.collection, deleting.entry.id);
    setDeleting(null);
  }

  const decisions = store.decisions || [];

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Studio Tools · Record Keeping</div>
          <h1 className="dossier-h1">Dev <em>Log</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            What was decided and why. A year from now you will not remember either.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>DEV-001</div>
          <div><span>decisions</span>{decisions.length}</div>
          <div><span>notes</span>{store.devLog.length}</div>
        </div>
      </div>

      <nav className="tabs" style={{ marginBottom:28 }}>
        <button role="tab" aria-selected={tab==='decisions'} onClick={() => setTab('decisions')}>
          <span className="num">01</span>Decision Log
        </button>
        <button role="tab" aria-selected={tab==='notes'} onClick={() => setTab('notes')}>
          <span className="num">02</span>Notes
        </button>
      </nav>

      {tab === 'decisions' && (
        <div>
          <div className="spread" style={{ marginBottom:22 }}>
            <p style={{ margin:0, color:'var(--ash)', fontStyle:'italic', fontSize:15 }}>
              Every significant creative decision — what was chosen, what was rejected, and why. The context that gets lost.
            </p>
            <button className="btn primary" onClick={() => setEditingDecision({})}><Icon name="plus" size={13}/> Record a decision</button>
          </div>

          {decisions.length === 0 ? (
            <EmptyState dark title="No decisions recorded yet."
              body="Start logging decisions now, while the reasons are fresh. What did you decide? What did you rule out? Why?"
              action={<button className="btn primary" onClick={() => setEditingDecision({})}><Icon name="plus" size={13}/> Record the first decision</button>} />
          ) : (
            <div className="decision-timeline">
              {[...decisions].reverse().map(d => (
                <div key={d.id} className="decision-entry">
                  <div className="decision-marker">
                    <div className="decision-dot" style={{ background: d.section ? 'var(--imperial)' : 'var(--ash)' }}></div>
                    <div className="decision-line"></div>
                  </div>
                  <div className="decision-card paper-card">
                    <div className="card-head">
                      <div>
                        {d.section && <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--imperial)', marginBottom:5 }}>{d.section}</div>}
                        <h3>{d.what}</h3>
                      </div>
                      <div className="row" style={{ gap:8, flexShrink:0 }}>
                        <button className="btn small on-paper" onClick={() => setEditingDecision(d)}><Icon name="pencil" size={10}/></button>
                        <button className="btn small on-paper danger" onClick={() => setDeleting({ collection:'decisions', entry:d })}><Icon name="trash" size={10}/></button>
                      </div>
                    </div>
                    {d.why && (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:6 }}>Why</div>
                        <p style={{ margin:0, color:'var(--ink-2)', lineHeight:1.65 }}>{d.why}</p>
                      </div>
                    )}
                    {d.rejected && (
                      <div style={{ padding:'10px 14px', background:'var(--paper-2)', borderRadius:2, marginBottom:12 }}>
                        <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:4 }}>What was ruled out</div>
                        <p style={{ margin:0, color:'var(--ink-2)', fontSize:14 }}>{d.rejected}</p>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:'1px dashed var(--rule)' }}>
                      <Attrib entry={d} />
                      {d.immutable && (
                        <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--moss)' }}>Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div>
          <div style={{ marginBottom:22 }}>
            <Field dark label="Add a note">
              <TextArea value={draft} onChange={setDraft} rows={3} placeholder="Quick notes, reminders, anything that doesn't fit elsewhere yet." />
            </Field>
            <button className="btn primary small" disabled={!draft.trim()} onClick={addNote}><Icon name="plus" size={11}/> Add note</button>
          </div>
          {store.devLog.length === 0 ? (
            <EmptyState dark title="No notes yet." body="Quick thoughts, session summaries, things to revisit." />
          ) : (
            <div className="stack">
              {[...store.devLog].reverse().map(e => (
                <div key={e.id} className="paper-card tight" style={{ position:'relative' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', color:'var(--ink-mute)', textTransform:'uppercase', marginBottom:8 }}>
                    {e.authorDisplayName || e.author || 'Unknown'} · {Ydl.formatStamp(e.createdAt)}
                  </div>
                  <p style={{ margin:0, color:'var(--ink-2)', lineHeight:1.65 }}>{e.content}</p>
                  <button className="btn small on-paper danger" style={{ position:'absolute', top:12, right:12 }} onClick={() => setDeleting({ collection:'devLog', entry:e })}><Icon name="trash" size={10}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingDecision && (
        <DecisionForm entry={editingDecision.id ? editingDecision : null} onClose={() => setEditingDecision(null)} onSave={saveDecision} />
      )}

      {deleting && (
        <Modal open onClose={() => setDeleting(null)}>
          <ConfirmDialog title="Remove this entry?" body="This permanently deletes it." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
        </Modal>
      )}
    </Section>
  );
}

function DecisionForm({ entry, onClose, onSave }) {
  const SECTIONS = ['Bestiary','Characters','Factions','Artifacts','Magic System','World','Lore','Economy','Military','Society','General'];
  const [d, setD] = useState({ what:'', why:'', rejected:'', section:'', immutable:false, ...(entry||{}) });
  useEffect(() => { setD({ what:'', why:'', rejected:'', section:'', immutable:false, ...(entry||{}) }); }, [entry]);
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit decision' : 'Record a decision'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Decision Log · DEV-001</div></div>
      </div>
      <Field label="What was decided"><TextInput value={d.what} onChange={(v) => setD({...d,what:v})} placeholder="The Veilborn cannot use magic in public" /></Field>
      <Field label="Why — the reasoning behind it"><TextArea value={d.why} onChange={(v) => setD({...d,why:v})} rows={4} placeholder="What problem did this solve? What made this the right call?" /></Field>
      <Field label="What was ruled out — alternatives considered"><TextArea value={d.rejected} onChange={(v) => setD({...d,rejected:v})} rows={3} placeholder="What else was on the table and why it was rejected." /></Field>
      <div className="field-row">
        <Field label="Section"><Select value={d.section} onChange={(v) => setD({...d,section:v})} options={['', ...SECTIONS]} /></Field>
      </div>
      <div className="toggle-row" style={{ marginBottom:14 }}>
        <input type="checkbox" checked={d.immutable||false} onChange={(e) => setD({...d,immutable:e.target.checked})} />
        <span>Lock this decision — mark as settled and not to be revisited</span>
      </div>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.what?.trim()} onClick={() => onSave(d)}>{entry ? 'Save' : 'Record decision'}</button>
        </div>
      </div>
    </Modal>
  );
}

window.DevlogSection = DevlogSection;
window.DevLogSection = DevlogSection;
