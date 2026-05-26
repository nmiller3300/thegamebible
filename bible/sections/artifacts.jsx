/* Game Bible — sections/artifacts.jsx */
const Ya = window.YSTC;

const ARTIFACT_TYPES = ['Weapon','Armor','Accessory','Tome','Relic','Other'];

function ArtifactsSection() {
  const store = Ya.useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editingTiers, setEditingTiers] = useState(false);
  const [filter, setFilter] = useState('all');

  const tierNames = store.artifactTiers.map((t) => t.name);

  function save(data) {
    if (editing && editing.id) {
      Ya.updateEntry('artifacts', editing.id, data);
      Ya.logActivity('Artifacts', 'edited', data.name);
    } else {
      const saved = Ya.addEntry('artifacts', data);
      Ya.logActivity('Artifacts', 'added', saved.name);
    }
    setEditing(null);
  }
  function saveTiers(rows) {
    Ya.setStore({ artifactTiers: rows });
    Ya.logActivity('Artifacts', 'updated', 'tier system');
    setEditingTiers(false);
  }

  const visible = store.artifacts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'lost') return a.currentLocation && /unknown|lost/i.test(a.currentLocation);
    return a.tier === filter;
  });
  const lost = store.artifacts.filter((a) => a.currentLocation && /unknown|lost/i.test(a.currentLocation));

  return (
    <Section>
      <DocHead
        kicker="Index · Objects of power"
        title="Artifacts &"
        titleEm="Relics"
        deck="From mildly enchanted to divine. The tier system is editable; every entry can carry a curse, a cost, and a current location."
        code="RELIC-001"
        codeMeta={{ artifacts: store.artifacts.length, lost: lost.length, tiers: store.artifactTiers.length }}
      />

      <SectionMark>Tier system · reference</SectionMark>
      <article className="paper-card">
        <div className="card-head">
          <div>
            <div className="eyebrow muted">Editable table</div>
            <h3>Confirmed tiers</h3>
          </div>
          <button className="btn on-paper small" onClick={() => setEditingTiers(true)}><Icon name="pencil" size={11}/> Edit tiers</button>
        </div>
        <table className="tbl">
          <thead><tr><th style={{ width: 220 }}>Tier</th><th>Description</th></tr></thead>
          <tbody>
            {store.artifactTiers.map((t) => (
              <tr key={t.id}><td className="k">{t.name}</td><td>{t.description}</td></tr>
            ))}
            {store.artifactTiers.length === 0 && (
              <tr><td colSpan={2} className="empty">No tiers defined.</td></tr>
            )}
          </tbody>
        </table>
      </article>

      <div className="spread" style={{ marginTop: 32, marginBottom: 18 }}>
        <SectionMark>Artifact index</SectionMark>
        <button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add artifact</button>
      </div>

      <div className="row wrap" style={{ marginBottom: 18, gap: 6 }}>
        <button className={'btn small ' + (filter === 'all' ? 'primary' : 'ghost')} onClick={() => setFilter('all')}>All <span style={{ opacity:.6, marginLeft: 6 }}>{store.artifacts.length}</span></button>
        {tierNames.map((t) => {
          const n = store.artifacts.filter((a) => a.tier === t).length;
          return <button key={t} className={'btn small ' + (filter === t ? 'primary' : 'ghost')} onClick={() => setFilter(t)}>{t} <span style={{ opacity:.6, marginLeft: 6 }}>{n}</span></button>;
        })}
        <button className={'btn small ' + (filter === 'lost' ? 'primary' : 'ghost')} onClick={() => setFilter('lost')}>Lost <span style={{ opacity:.6, marginLeft: 6 }}>{lost.length}</span></button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="grail"
          title="No artifacts recorded yet."
          body="Each entry supports appearance, power, origin, current location, lore, and a cost or curse. Mark current location as Unknown or Lost to surface the artifact in the Lost subsection."
          action={<button className="btn on-paper primary" onClick={() => setEditing({})}><Icon name="plus" size={12}/> Add the first artifact</button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {visible.map((a) => <ArtifactCard key={a.id} a={a} onEdit={() => setEditing(a)} onDelete={() => setDeleting(a)} />)}
        </div>
      )}

      {lost.length > 0 && filter === 'all' && (
        <>
          <SectionMark>Lost artifacts · potential quests</SectionMark>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {lost.map((a) => (
              <article key={a.id} className="paper-card tight" onClick={() => setEditing(a)} style={{ cursor: 'pointer' }}>
                <div className="eyebrow muted">{a.tier || 'Untiered'}</div>
                <h4 style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 18, margin: '4px 0' }}>{a.name}</h4>
                <p style={{ fontSize: 13.5, margin: 0, color: 'var(--ink-mute)' }}>Last seen: {a.currentLocation}</p>
              </article>
            ))}
          </div>
        </>
      )}

      {editing !== null && (
        <ArtifactForm
          open={true}
          entry={editing.id ? editing : null}
          tiers={tierNames}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {editingTiers && (
        <TiersEditor open={true} tiers={store.artifactTiers} onClose={() => setEditingTiers(false)} onSave={saveTiers} />
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete this artifact?"
        body={deleting ? `\u201C${deleting.name}\u201D will be removed.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { Ya.deleteEntry('artifacts', deleting.id); Ya.logActivity('Artifacts', 'removed', deleting.name); setDeleting(null); }}
      />
    </Section>
  );
}

function ArtifactCard({ a, onEdit, onDelete }) {
  return (
    <article className={'paper-card' + (a.status === 'pending' ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">{a.tier || 'Untiered'} · {a.artifactType || '—'}</div>
          <h3>{a.name}</h3>
        </div>
        <StatusPill status={a.status || 'confirmed'} />
      </div>
      {a.imagePlaceholderLabel && <div style={{ marginBottom: 14 }}><ImageSlot label={a.imagePlaceholderLabel} height={160} /></div>}
      {a.appearance && <Field2 label="Appearance" body={a.appearance} />}
      {a.powerAbility && <Field2 label="Power" body={a.powerAbility} />}
      <div className="meta-row" style={{ marginTop: 10 }}>
        <div className="k">Origin</div>          <div className={'v ' + (a.origin ? '' : 'empty')}>{a.origin || '—'}</div>
        <div className="k">Current location</div><div className={'v ' + (a.currentLocation ? '' : 'empty')}>{a.currentLocation || '—'}</div>
      </div>
      {a.lore && <Field2 label="Lore" body={a.lore} />}
      {a.costCurse && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: 'oklch(0.45 0.135 27 / 0.07)', borderLeft: '2px solid var(--imperial)' }}>
          <div className="tiny-label" style={{ color: 'var(--imperial)' }}>Cost · curse</div>
          <p style={{ fontSize: 14.5, margin: '4px 0 0', color: 'var(--ink)' }}>{a.costCurse}</p>
        </div>
      )}
      <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
        <Attrib entry={a} />
        <div className="row">
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={11}/> Delete</button>
        </div>
      </div>
    </article>
  );
}

function ArtifactForm({ open, entry, tiers, onClose, onSave }) {
  const [d, setD] = useState({});
  useEffect(() => {
    setD({
      name:'', artifactType: ARTIFACT_TYPES[0], tier: tiers[0] || '',
      appearance:'', powerAbility:'', origin:'', currentLocation:'', lore:'',
      costCurse:'', imagePlaceholderLabel:'', status:'confirmed', ...(entry || {}),
    });
  }, [entry, open, tiers]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={open} onClose={onClose} width="wide">
      <div className="modal-head">
        <div><h2>{entry ? 'Edit artifact' : 'Add an artifact'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Artifacts · entry</div></div>
        <div className="doc-code">RELIC-001 · ENTRY</div>
      </div>
      <div className="field-row three">
        <Field label="Name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="The Crown of Ash" /></Field>
        <Field label="Type"><Select value={d.artifactType} onChange={(v) => set('artifactType', v)} options={ARTIFACT_TYPES} /></Field>
        <Field label="Tier"><Select value={d.tier} onChange={(v) => set('tier', v)} options={tiers} /></Field>
      </div>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v) => set('appearance', v)} rows={2} /></Field>
      <Field label="Power and ability"><TextArea value={d.powerAbility} onChange={(v) => set('powerAbility', v)} rows={3} /></Field>
      <div className="field-row">
        <Field label="Origin"><TextInput value={d.origin} onChange={(v) => set('origin', v)} /></Field>
        <Field label="Current location" hint="Type Unknown or Lost to surface this in the Lost Artifacts subsection.">
          <TextInput value={d.currentLocation} onChange={(v) => set('currentLocation', v)} placeholder="Lost · last seen in the Ash Hills" />
        </Field>
      </div>
      <Field label="Lore and legend"><TextArea value={d.lore} onChange={(v) => set('lore', v)} rows={3} /></Field>
      <Field label="Cost or curse"><TextArea value={d.costCurse} onChange={(v) => set('costCurse', v)} rows={2} /></Field>
      <Field label="Image placeholder label"><TextInput value={d.imagePlaceholderLabel} onChange={(v) => set('imagePlaceholderLabel', v)} placeholder="Held on a velvet pad" /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Add artifact'}</button>
        </div>
      </div>
    </Modal>
  );
}

function TiersEditor({ open, tiers, onClose, onSave }) {
  const [list, setList] = useState(tiers);
  useEffect(() => { setList(tiers); }, [tiers]);
  function setRow(i, k, v) { const next = list.slice(); next[i] = { ...next[i], [k]: v }; setList(next); }
  function add() { setList([...list, { id: Ya.uid(), name:'', description:'' }]); }
  function remove(i) { setList(list.filter((_, idx) => idx !== i)); }
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div><h2>Edit artifact tiers</h2><div className="tiny-label" style={{ marginTop:6 }}>Reorder, rename, or remove</div></div>
        <div className="doc-code">RELIC-001 · TIERS</div>
      </div>
      <div className="stack-sm">
        {list.map((t, i) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
            <input type="text" value={t.name} onChange={(e) => setRow(i, 'name', e.target.value)} placeholder="Tier name" />
            <input type="text" value={t.description} onChange={(e) => setRow(i, 'description', e.target.value)} placeholder="Description" />
            <button className="btn on-paper small danger" onClick={() => remove(i)}>Remove</button>
          </div>
        ))}
        <button className="btn on-paper small" onClick={add}><Icon name="plus" size={11}/> Add tier</button>
      </div>
      <div className="modal-actions">
        <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
        <button className="btn on-paper primary" onClick={() => onSave(list.filter((r) => r.name.trim()))}>Save tiers</button>
      </div>
    </Modal>
  );
}

window.ArtifactsSection = ArtifactsSection;
