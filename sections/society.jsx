/* Game Bible — sections/society.jsx */
const Ysoc = window.YSTC;


function SocialClassForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ className:'', description:'', privileges:'', limitations:'', isConfirmed:true, ...(entry||{}) });
  useEffect(() => { setD({ className:'', description:'', privileges:'', limitations:'', isConfirmed:true, ...(entry||{}) }); }, [entry]);
  return (
    <>
      <Field label="Class name"><TextInput value={d.className} onChange={(v) => setD({...d,className:v})} /></Field>
      <Field label="Description"><TextArea value={d.description} onChange={(v) => setD({...d,description:v})} rows={2} /></Field>
      <div className="field-row">
        <Field label="Starting privileges"><TextInput value={d.privileges} onChange={(v) => setD({...d,privileges:v})} /></Field>
        <Field label="Limitations"><TextInput value={d.limitations} onChange={(v) => setD({...d,limitations:v})} /></Field>
      </div>
      <div className="modal-actions"><ConfirmedToggle value={d.isConfirmed} onChange={(b) => setD({...d,isConfirmed:b})} /><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.className?.trim()} onClick={() => onSave(d)}>Save</button></div></div>
    </>
  );
}

function SocietySection() {
  const store = Ysoc.useStore();
  const [editingClass, setEditingClass] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  function saveClass(data) {
    if (editingClass && editingClass.id) Ysoc.updateEntry('socialClasses', editingClass.id, data);
    else Ysoc.addEntry('socialClasses', data);
    setEditingClass(null);
  }

  function patchBlock(id, data) {
    Ysoc.saveSocialBlock(id, { ...store.socialBlocks[id], ...data });
    Ysoc.logActivity('Society', 'edited', id);
  }

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>System · Social Order</div>
          <h1 className="dossier-h1">Society & <em>Reputation</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            The world watches what you do. Your reputation is your reality. Magic users can bypass this hierarchy entirely — and the resentment that creates runs deep.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>SOC-001</div>
          <div><span>classes</span>{store.socialClasses.length}</div>
          <div><span>hierarchy</span>confirmed</div>
        </div>
      </div>

      <div className="section-mark">Class Hierarchy</div>
      <div className="paper-card" style={{ marginBottom:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <p style={{ margin:0, fontStyle:'italic', color:'var(--ink-2)' }}>{store.socialNote}</p>
          <button className="btn small on-paper" onClick={() => Ysoc.addEntry('socialClasses', { className:'New Class', description:'', privileges:'', limitations:'', isConfirmed:false })}><Icon name="plus" size={11}/> Add class</button>
        </div>
        <div className="hierarchy-stack">
          {[...store.socialClasses].reverse().map((c, i, arr) => (
            <div key={c.id} className="hierarchy-rung" style={{ '--depth': i / arr.length }}>
              <div className="hierarchy-rung-content">
                <div className="hierarchy-class-name">{c.className}</div>
                <div className="hierarchy-class-desc">{c.description}</div>
                <div className="hierarchy-class-meta">
                  <span><b>Privileges:</b> {c.privileges || '—'}</span>
                  <span><b>Limits:</b> {c.limitations || '—'}</span>
                </div>
              </div>
              <button className="btn small on-paper ghost hierarchy-edit" onClick={() => setEditingClass(c)}><Icon name="pencil" size={10}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-mark">Reputation System</div>
      <div className="stack">
        {Object.entries(store.socialBlocks).map(([id, block]) => (
          <ProseBlock key={id} title={block.title || id} body={block.content} isConfirmed={block.isConfirmed} onChange={(p) => patchBlock(id, p)} emptyHint="Define how this layer of reputation affects the player." />
        ))}
      </div>

      {editingClass && (
        <Modal open onClose={() => setEditingClass(null)}>
          <div className="modal-head"><h2>{editingClass.id ? 'Edit class' : 'Add a class'}</h2><div className="doc-code">SOC-001</div></div>
          <SocialClassForm entry={editingClass} onClose={() => setEditingClass(null)} onSave={saveClass} />
        </Modal>
      )}
    </Section>
  );
}

window.SocietySection = SocietySection;
