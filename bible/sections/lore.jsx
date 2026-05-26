/* Game Bible — sections/lore.jsx */
const Yl = window.YSTC;

const ERA_TYPES = [
  'The Beginning',
  'Rise of Civilization',
  'A Great Conflict',
  'The Current Era',
  'Other',
];

function LoreSection() {
  const store = Yl.useStore();
  const [editingEra, setEditingEra] = useState(null);
  const [deletingEra, setDeletingEra] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // { eraId, entry }
  const [deletingEvent, setDeletingEvent] = useState(null);

  function patchEra(id, partial) {
    Yl.setStore({
      loreEras: store.loreEras.map((e) => e.id === id ? { ...e, ...partial } : e),
    });
  }
  function addEra() {
    const e = { id: Yl.uid(), name: '', type: 'Other', description: '', displayOrder: store.loreEras.length };
    Yl.setStore({ loreEras: [...store.loreEras, e] });
    Yl.logActivity('Lore', 'added era', e.type);
  }
  function removeEra(id) {
    Yl.setStore({
      loreEras: store.loreEras.filter((e) => e.id !== id),
      loreEvents: store.loreEvents.filter((ev) => ev.eraId !== id),
    });
  }
  function reorder(id, dir) {
    const sorted = [...store.loreEras].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const swap = dir < 0 ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    const t = sorted[idx].displayOrder;
    sorted[idx].displayOrder = sorted[swap].displayOrder;
    sorted[swap].displayOrder = t;
    Yl.setStore({ loreEras: sorted });
  }

  function saveEvent(data) {
    if (editingEvent.entry) {
      Yl.updateEntry('loreEvents', editingEvent.entry.id, data);
      Yl.logActivity('Lore', 'edited event', data.eventName);
    } else {
      const saved = Yl.addEntry('loreEvents', { ...data, eraId: editingEvent.eraId });
      Yl.logActivity('Lore', 'added event', saved.eventName);
    }
    setEditingEvent(null);
  }

  function patchSimpleBlock(key, partial) {
    Yl.setStore({ [key]: { ...store[key], ...partial } });
  }

  const sortedEras = [...store.loreEras].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Section>
      <DocHead
        kicker="System · The world's age"
        title="Lore &"
        titleEm="History"
        deck="Something greater existed before the empire. The weight of that must be felt even while specific details remain TBD."
        code="LORE-001"
        codeMeta={{ eras: store.loreEras.length, events: store.loreEvents.length }}
      />

      <div className="spread" style={{ marginBottom: 18 }}>
        <SectionMark>Eras</SectionMark>
        <button className="btn ghost small" onClick={addEra}><Icon name="plus" size={11}/> Add era</button>
      </div>

      <div className="stack" style={{ gap: 22 }}>
        {sortedEras.map((era, idx) => {
          const events = store.loreEvents.filter((ev) => ev.eraId === era.id);
          return (
            <article key={era.id} className="paper-card spacious">
              <div className="card-head">
                <div>
                  <div className="eyebrow muted">Era · {String(idx+1).padStart(2,'0')}</div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {era.name || <span className="muted italic">Unnamed era</span>}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--imperial)', fontStyle: 'normal' }}>
                      {era.type}
                    </span>
                  </h3>
                </div>
                <div className="row">
                  <button className="btn small on-paper" onClick={() => reorder(era.id, -1)} title="Move up">↑</button>
                  <button className="btn small on-paper" onClick={() => reorder(era.id, +1)} title="Move down">↓</button>
                  <button className="btn small on-paper" onClick={() => setEditingEra(era)}><Icon name="pencil" size={11}/> Edit</button>
                  <button className="btn small on-paper danger" onClick={() => setDeletingEra(era)}><Icon name="trash" size={11}/> Delete</button>
                </div>
              </div>
              {era.description
                ? era.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
                : <p className="muted italic">No description yet for this era.</p>}

              <div className="divider"></div>

              <div className="spread" style={{ marginBottom: 10 }}>
                <div className="eyebrow muted">Key events</div>
                <button className="btn on-paper small" onClick={() => setEditingEvent({ eraId: era.id, entry: null })}>
                  <Icon name="plus" size={11}/> Add event
                </button>
              </div>
              {events.length === 0 ? (
                <p className="muted italic" style={{ marginBottom: 0 }}>No events recorded in this era.</p>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Who was involved</th>
                      <th>Lasting impact</th>
                      <th style={{ width: 90 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td className="k">{ev.eventName}</td>
                        <td>{ev.whoInvolved || <span className="empty">\u2014</span>}</td>
                        <td>{ev.lastingImpact || <span className="empty">\u2014</span>}</td>
                        <td>
                          <div className="row">
                            <button className="btn small on-paper" onClick={() => setEditingEvent({ eraId: era.id, entry: ev })}><Icon name="pencil" size={10}/></button>
                            <button className="btn small on-paper danger" onClick={() => setDeletingEvent(ev)}><Icon name="trash" size={10}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          );
        })}
        {sortedEras.length === 0 && (
          <EmptyState
            icon="scroll"
            title="No eras yet."
            body="The brief seeds four eras (Beginning, Rise of Civilization, A Great Conflict, Current Era). Add them back, or design your own."
            action={<button className="btn on-paper primary" onClick={addEra}><Icon name="plus" size={12}/> Add an era</button>}
          />
        )}
      </div>

      <SectionMark>Additional</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        <ProseBlock title="Myths and legends" body={store.loreMyths.content} isConfirmed={store.loreMyths.isConfirmed}
          onChange={(p) => patchSimpleBlock('loreMyths', p)} emptyHint="Folk tales, prophecies, the bedtime stories peasants tell about old kings." />
        <ProseBlock title="Lost and forbidden knowledge" body={store.loreLost.content} isConfirmed={store.loreLost.isConfirmed}
          onChange={(p) => patchSimpleBlock('loreLost', p)} emptyHint="Dead languages, sealed libraries, names the empire has tried to forget." />
      </div>

      {editingEra && <EraEditor era={editingEra} onClose={() => setEditingEra(null)} onSave={(d) => { patchEra(editingEra.id, d); setEditingEra(null); Yl.logActivity('Lore', 'edited era', d.name || editingEra.type); }} />}
      {editingEvent && <EventEditor entry={editingEvent.entry} onClose={() => setEditingEvent(null)} onSave={saveEvent} />}

      <ConfirmDialog
        open={!!deletingEra}
        title="Delete this era?"
        body={deletingEra ? `\u201C${deletingEra.name || deletingEra.type}\u201D and all events within it will be removed.` : ''}
        onCancel={() => setDeletingEra(null)}
        onConfirm={() => { removeEra(deletingEra.id); Yl.logActivity('Lore', 'removed era', deletingEra.name || deletingEra.type); setDeletingEra(null); }}
      />
      <ConfirmDialog
        open={!!deletingEvent}
        title="Delete this event?"
        body={deletingEvent ? `\u201C${deletingEvent.eventName}\u201D will be removed.` : ''}
        onCancel={() => setDeletingEvent(null)}
        onConfirm={() => { Yl.deleteEntry('loreEvents', deletingEvent.id); Yl.logActivity('Lore', 'removed event', deletingEvent.eventName); setDeletingEvent(null); }}
      />
    </Section>
  );
}

function EraEditor({ era, onClose, onSave }) {
  const [d, setD] = useState(era);
  useEffect(() => { setD(era); }, [era]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-head">
        <div><h2>Edit era</h2><div className="tiny-label" style={{ marginTop:6 }}>Era \u00b7 timeline slot</div></div>
        <div className="doc-code">LORE-001 · ERA</div>
      </div>
      <div className="field-row">
        <Field label="Era name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="The Silver Years" /></Field>
        <Field label="Era type"><Select value={d.type} onChange={(v) => set('type', v)} options={ERA_TYPES} /></Field>
      </div>
      <Field label="Description"><TextArea value={d.description} onChange={(v) => set('description', v)} rows={6} /></Field>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" onClick={() => onSave(d)}>Save changes</button>
        </div>
      </div>
    </Modal>
  );
}

function EventEditor({ entry, onClose, onSave }) {
  const [d, setD] = useState(entry || { eventName:'', whoInvolved:'', lastingImpact:'' });
  useEffect(() => { setD(entry || { eventName:'', whoInvolved:'', lastingImpact:'' }); }, [entry]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit event' : 'Add event'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Within an era</div></div>
        <div className="doc-code">LORE-001 · EVENT</div>
      </div>
      <Field label="Event name"><TextInput value={d.eventName} onChange={(v) => set('eventName', v)} placeholder="The Salt War" /></Field>
      <Field label="Who was involved"><TextInput value={d.whoInvolved} onChange={(v) => set('whoInvolved', v)} /></Field>
      <Field label="Lasting impact"><TextArea value={d.lastingImpact} onChange={(v) => set('lastingImpact', v)} rows={3} /></Field>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.eventName?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Add event'}</button>
        </div>
      </div>
    </Modal>
  );
}

window.LoreSection = LoreSection;
