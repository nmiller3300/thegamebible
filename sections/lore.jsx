/* Game Bible — sections/lore.jsx */
const Yl = window.YSTC;


function EraForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ name:'', eraType:'', description:'', displayOrder:0, ...(entry||{}) });
  useEffect(() => { setD({ name:'', eraType:'', description:'', displayOrder:0, ...(entry||{}) }); }, [entry]);
  return (
    <>
      <div className="field-row">
        <Field label="Era name"><TextInput value={d.name} onChange={(v) => setD({...d,name:v})} placeholder="The Silver Years" /></Field>
        <Field label="Era type"><TextInput value={d.eraType||d.type||''} onChange={(v) => setD({...d,eraType:v})} placeholder="Rise of Civilization" /></Field>
      </div>
      <Field label="Description"><TextArea value={d.description} onChange={(v) => setD({...d,description:v})} rows={4} /></Field>
      <Field label="Display order"><TextInput value={String(d.displayOrder||0)} onChange={(v) => setD({...d,displayOrder:parseInt(v)||0})} /></Field>
      <div className="modal-actions"><span></span><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" onClick={() => onSave(d)}>Save</button></div></div>
    </>
  );
}
function EventForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ eventName:'', whoInvolved:'', lastingImpact:'', ...(entry||{}) });
  useEffect(() => { setD({ eventName:'', whoInvolved:'', lastingImpact:'', ...(entry||{}) }); }, [entry]);
  return (
    <>
      <Field label="Event name"><TextInput value={d.eventName} onChange={(v) => setD({...d,eventName:v})} /></Field>
      <Field label="Who was involved"><TextInput value={d.whoInvolved} onChange={(v) => setD({...d,whoInvolved:v})} /></Field>
      <Field label="Lasting impact"><TextArea value={d.lastingImpact} onChange={(v) => setD({...d,lastingImpact:v})} rows={3} /></Field>
      <div className="modal-actions"><span></span><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.eventName?.trim()} onClick={() => onSave(d)}>Save</button></div></div>
    </>
  );
}

function LoreSection() {
  const store = Yl.useStore();
  const [editingEra, setEditingEra] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEraId, setSelectedEraId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  function saveEra(data) {
    if (editingEra && editingEra.id) { Yl.updateEntry('loreEras', editingEra.id, data); Yl.logActivity('Lore', 'edited era', data.name || data.eraType || data.type); }
    else { Yl.addEntry('loreEras', data); Yl.logActivity('Lore', 'added era', data.name || data.eraType || data.type); }
    setEditingEra(null);
  }
  function saveEvent(data) {
    const eraId = selectedEraId || (editingEvent && editingEvent.eraId);
    if (editingEvent && editingEvent.id) { Yl.updateEntry('loreEvents', editingEvent.id, data); }
    else { Yl.addEntry('loreEvents', { ...data, eraId }); }
    setEditingEvent(null);
  }
  function patchLoreBlock(id, data) { Yl.saveLoreBlock(id, data); Yl.logActivity('Lore', 'edited', id); }

  const sortedEras = [...store.loreEras].sort((a,b) => (a.displayOrder||0) - (b.displayOrder||0));

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Archive · Historical Record</div>
          <h1 className="dossier-h1">Lore & <em>History</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            The past shapes everything the player walks into. Even things they never learn directly.
            Something greater existed before the empire. Ruins. Dead languages. Carvings in old stone.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>LORE-001</div>
          <div><span>eras</span>{store.loreEras.length}</div>
          <div><span>events</span>{store.loreEvents.length}</div>
        </div>
      </div>

      <div className="spread" style={{ marginBottom:18 }}>
        <div className="section-mark" style={{ margin:0, flex:1 }}>Eras of History</div>
        <button className="btn primary small" onClick={() => setEditingEra({})}><Icon name="plus" size={11}/> Add era</button>
      </div>

      <div className="lore-timeline">
        {sortedEras.map((era, i) => {
          const events = store.loreEvents.filter(e => e.eraId === era.id);
          return (
            <div key={era.id} className="lore-era">
              <div className="lore-era-marker">
                <div className="lore-era-dot"></div>
                {i < sortedEras.length - 1 && <div className="lore-era-line"></div>}
              </div>
              <div className="lore-era-content">
                <div className="paper-card">
                  <div className="card-head">
                    <div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--imperial)', marginBottom:6 }}>
                        {era.type || era.eraType || '—'}
                      </div>
                      <h3>{era.name || <span className="muted italic">Unnamed era</span>}</h3>
                    </div>
                    <div className="row" style={{ gap:8 }}>
                      <button className="btn small on-paper" onClick={() => { setSelectedEraId(era.id); setEditingEvent({}); }}><Icon name="plus" size={10}/> Event</button>
                      <button className="btn small on-paper" onClick={() => setEditingEra(era)}><Icon name="pencil" size={10}/></button>
                    </div>
                  </div>
                  {era.description && <p>{era.description}</p>}
                  {events.length > 0 && (
                    <div style={{ marginTop:14 }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:10, paddingBottom:8, borderBottom:'1px dashed var(--rule)' }}>Key events</div>
                      {events.map(ev => (
                        <div key={ev.id} className="lore-event-row">
                          <div className="lore-event-name">{ev.eventName}</div>
                          {ev.whoInvolved && <div className="lore-event-meta">Involved: {ev.whoInvolved}</div>}
                          {ev.lastingImpact && <div className="lore-event-impact">{ev.lastingImpact}</div>}
                          <button className="btn small on-paper ghost lore-event-edit" onClick={() => setEditingEvent(ev)}><Icon name="pencil" size={9}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {events.length === 0 && <p className="muted italic" style={{ marginTop:10 }}>No events recorded for this era.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-mark" style={{ marginTop:40 }}>Myths & Legends</div>
      <div className="stack">
        <ProseBlock title="Myths and Legends" body={store.loreMyths.content} isConfirmed={store.loreMyths.isConfirmed} onChange={(p) => patchLoreBlock('myths', p)} emptyHint="Stories people tell that may or may not be true." />
        <ProseBlock title="Lost and Forbidden Knowledge" body={store.loreLost.content} isConfirmed={store.loreLost.isConfirmed} onChange={(p) => patchLoreBlock('lost', p)} emptyHint="What has been erased from history. What the empire does not want known." />
      </div>

      {editingEra && (
        <Modal open onClose={() => setEditingEra(null)}>
          <div className="modal-head"><h2>{editingEra.id ? 'Edit era' : 'Add an era'}</h2><div className="doc-code">LORE-001</div></div>
          <EraForm entry={editingEra} onClose={() => setEditingEra(null)} onSave={saveEra} />
        </Modal>
      )}
      {editingEvent && (
        <Modal open onClose={() => setEditingEvent(null)}>
          <div className="modal-head"><h2>{editingEvent.id ? 'Edit event' : 'Add an event'}</h2><div className="doc-code">LORE-001</div></div>
          <EventForm entry={editingEvent} onClose={() => setEditingEvent(null)} onSave={saveEvent} />
        </Modal>
      )}
    </Section>
  );
}

window.LoreSection = LoreSection;
