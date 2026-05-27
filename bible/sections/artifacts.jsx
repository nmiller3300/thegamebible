/* Game Bible — sections/artifacts.jsx — Full dossier per artifact */
const Ya = window.YSTC;

const ARTIFACT_TYPES = ['Weapon','Armor','Accessory','Tome','Relic','Crown','Instrument','Other'];
const TIER_COLOR = { Common:'var(--moss)', Rare:'oklch(0.65 0.14 75)', Legendary:'var(--imperial-soft)', 'Divine / Forbidden':'oklch(0.55 0.18 30)' };

function ArtifactCard({ entry, onClick, onEdit, onDelete }) {
  const tierColor = TIER_COLOR[entry.tier] || 'var(--ash)';
  return (
    <div className="creature-card" onClick={onClick} title="Open registry">
      <div className="creature-card-image">
        {entry.imageUrl
          ? <img src={entry.imageUrl} alt={entry.name} style={{ objectFit:'contain', background:'var(--paper-2)', padding:'8px' }} />
          : <div className="creature-card-placeholder"><Icon name="star" size={28} stroke={1.2}/><div>Image pending</div></div>}
        <div className="creature-card-threat" style={{ background:tierColor+'22', color:tierColor, borderColor:tierColor+'55' }}>
          {entry.tier || '—'}
        </div>
      </div>
      <div className="creature-card-body">
        <div className="creature-card-category">{entry.artifactType || 'Unknown type'}</div>
        <h3 className="creature-card-name">{entry.name || 'Unnamed'}</h3>
        <div className="creature-card-meta">
          <span>{entry.origin || '—'}</span>
          <span style={{ opacity:0.4 }}>·</span>
          <span>{entry.currentLocation || '—'}</span>
        </div>
        {entry.appearance && <p className="creature-card-excerpt">{entry.appearance.slice(0,90)}{entry.appearance.length>90?'…':''}</p>}
      </div>
      <div className="creature-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={10}/></button>
        <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={10}/></button>
      </div>
    </div>
  );
}

function ArtifactDossier({ entry, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('description');
  const tierColor = TIER_COLOR[entry.tier] || 'var(--ash)';
  const tabs = [
    { id:'description', label:'Description' },
    { id:'powers',      label:'Powers' },
    { id:'history',     label:'History' },
    { id:'lore',        label:'Lore' },
  ];
  return (
    <div className="dossier-shell">
      <div className="dossier-topbar">
        <button className="dossier-back" onClick={onBack}><Icon name="chevronLeft" size={14}/> Artifacts</button>
        <span className="dossier-crumbs">{entry.artifactType||'Relic'} <span>/</span> {entry.name}</span>
        <div style={{ flex:1 }}></div>
        <div className="dossier-meta">
          <div><span>tier</span>{entry.tier||'—'}</div>
          <div><span>origin</span>{entry.origin||'—'}</div>
          <div><span>updated</span>{Ya.formatStamp(entry.updatedAt).split('·')[0].trim()}</div>
        </div>
        <div className="dossier-status-pill" style={{ '--tc': tierColor }}>{entry.tier||'Unknown tier'}</div>
        <button className="btn small" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
      </div>
      <div className="dossier-title-block">
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Relic Registry · {entry.artifactType||'Unknown'}</div>
          <h1 className="dossier-h1">{entry.name}</h1>
          {entry.origin && <div className="dossier-latin">— Origin: {entry.origin} —</div>}
        </div>
        <div className="dossier-ids">
          <div><span>type</span>{entry.artifactType||'—'}</div>
          <div><span>tier</span>{entry.tier||'—'}</div>
          <div><span>origin</span>{entry.origin||'—'}</div>
          <div><span>location</span>{entry.currentLocation||'—'}</div>
        </div>
      </div>
      <div className="dossier-hero">
        <div className="dossier-stage">
          <div className="dossier-stage-label"><span>Plate I · Reference image</span><span style={{ opacity:0.5 }}>Relic Registry</span></div>
          <ImageSlot value={entry.imageUrl||''} onChange={(url) => Ya.updateEntry('artifacts', entry.id, {imageUrl:url})} height={360} label="Object photograph — neutral background, full view" />
          {entry.currentLocation && <div className="dossier-ruler"><span>Current location:</span> {entry.currentLocation}</div>}
        </div>
        <div className="dossier-spec">
          {[['Type',entry.artifactType||'—'],['Tier',entry.tier||'—'],['Origin',entry.origin||'—'],['Location',entry.currentLocation||'—']].map(([k,v]) => (
            <div key={k} className="dossier-spec-row"><span className="dossier-spec-k">{k}</span><span className="dossier-spec-v" style={{ fontSize:16 }}>{v}</span></div>
          ))}
          {entry.costCurse && <div className="dossier-verdict"><span style={{ display:'block', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--imperial)', fontStyle:'normal', marginBottom:8 }}>Cost / Curse</span>{entry.costCurse}</div>}
        </div>
      </div>
      <div className="dossier-deepdive">
        <div className="section-mark" style={{ marginBottom:18 }}>Registry Study</div>
        <div className="tabs">
          {tabs.map((t,i) => <button key={t.id} role="tab" aria-selected={activeTab===t.id} onClick={() => setActiveTab(t.id)}><span className="num">0{i+1}</span>{t.label}</button>)}
        </div>
        <div style={{ paddingTop:32 }}>
          {activeTab==='description' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 01 · Physical Description</div>
                <div className="dossier-drop-text">{entry.appearance ? entry.appearance.split(/\n+/).map((p,i)=><p key={i}>{p}</p>) : <p className="muted italic">No description recorded.</p>}</div>
              </div>
              <div className="dossier-aside-col">
                <div className="dossier-aside-card">
                  <div className="dossier-aside-label">Registry entry</div>
                  {[['Type',entry.artifactType],['Tier',entry.tier],['Origin',entry.origin],['Location',entry.currentLocation]].map(([k,v])=> v && <div key={k} style={{ marginBottom:12 }}><div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:3 }}>{k}</div><div style={{ color:'var(--ink)', fontSize:15 }}>{v}</div></div>)}
                </div>
              </div>
            </div>
          )}
          {activeTab==='powers' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 02 · Powers & Abilities</div>
              {entry.powerAbility ? <div className="dossier-drop-text" style={{ marginTop:14 }}>{entry.powerAbility.split(/\n+/).map((p,i)=><p key={i}>{p}</p>)}</div> : <p className="muted italic">No powers recorded.</p>}
              {entry.costCurse && <><div className="dossier-eyebrow" style={{ marginTop:24 }}>Cost / Curse</div>{entry.costCurse.split(/\n+/).map((p,i)=><p key={i} style={{ color:'var(--ink-2)', marginBottom:12 }}>{p}</p>)}</>}
            </div>
          )}
          {activeTab==='history' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 03 · History & Provenance</div>
              {entry.origin ? <><div style={{ marginTop:14 }}><div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:8 }}>Origin</div><p style={{ color:'var(--ink-2)' }}>{entry.origin}</p></div></> : null}
              {entry.currentLocation ? <><div style={{ marginTop:18 }}><div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:8 }}>Current location</div><p style={{ color:'var(--ink-2)' }}>{entry.currentLocation}</p></div></> : null}
              {!entry.origin && !entry.currentLocation && <p className="muted italic">No history on record.</p>}
            </div>
          )}
          {activeTab==='lore' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 04 · Lore & Legend</div>
              {entry.lore ? <div className="dossier-drop-text" style={{ marginTop:14 }}>{entry.lore.split(/\n+/).map((p,i)=><p key={i}>{p}</p>)}</div> : <p className="muted italic">No lore recorded.</p>}
            </div>
          )}
        </div>
      </div>
      <div className="dossier-footer">
        <span>Relic Registry · {entry.artifactType} · {entry.name}</span>
        <span className="dossier-footer-sigil">— catalogued under the seal of the Concept Studio —</span>
        <Attrib entry={entry} />
      </div>
    </div>
  );
}

function ArtifactForm({ entry, onClose, onSave }) {
  const store = Ya.useStore();
  const tierOptions = store.artifactTiers.map(t => t.name);
  const init = { name:'', artifactType:'', tier:'', appearance:'', powerAbility:'', origin:'', currentLocation:'', lore:'', costCurse:'', imageUrl:'', status:'pending', ...(entry||{}) };
  const [d, setD] = useState(init);
  useEffect(() => { setD({ ...init, ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p=>({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head"><div><h2>{entry?'Edit artifact':'Add an artifact'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Artifacts & Relics</div></div><div className="doc-code">RELIC-001</div></div>
      <div className="field-row"><Field label="Name"><TextInput value={d.name} onChange={(v)=>set('name',v)}/></Field><Field label="Type"><Select value={d.artifactType} onChange={(v)=>set('artifactType',v)} options={['',...ARTIFACT_TYPES]}/></Field></div>
      <Field label="Tier"><Select value={d.tier} onChange={(v)=>set('tier',v)} options={['',...tierOptions]}/></Field>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v)=>set('appearance',v)} rows={3}/></Field>
      <Field label="Powers & abilities"><TextArea value={d.powerAbility} onChange={(v)=>set('powerAbility',v)} rows={3}/></Field>
      <Field label="Cost or curse"><TextArea value={d.costCurse} onChange={(v)=>set('costCurse',v)} rows={2}/></Field>
      <div className="field-row"><Field label="Origin"><TextInput value={d.origin} onChange={(v)=>set('origin',v)}/></Field><Field label="Current location"><TextInput value={d.currentLocation} onChange={(v)=>set('currentLocation',v)}/></Field></div>
      <Field label="Lore & legend"><TextArea value={d.lore} onChange={(v)=>set('lore',v)} rows={3}/></Field>
      <Field label="Image"><ImageSlot value={d.imageUrl} onChange={(v)=>set('imageUrl',v)} height={180}/></Field>
      <div className="modal-actions"><ConfirmedToggle value={d.status==='confirmed'} onChange={(b)=>set('status',b?'confirmed':'pending')}/><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={()=>onSave(d)}>{entry?'Save':'Add artifact'}</button></div></div>
    </Modal>
  );
}

function ArtifactsSection() {
  const store = Ya.useStore();
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editingTiers, setEditingTiers] = useState(false);

  // Jump to entry from global search
  useEffect(() => {
    if (window._ystcJumpTo && window._ystcJumpTo.section === 'artifacts') {
      var target = store.artifacts.find(e => e.id === window._ystcJumpTo.entryId);
      if (target) { setSelectedId(target.id); setView('dossier'); }
      window._ystcJumpTo = null;
    }
  }, [store.artifacts]);

  const selectedEntry = selectedId ? store.artifacts.find(e=>e.id===selectedId) : null;
  function openDossier(e) { setSelectedId(e.id); setView('dossier'); }
  function closeDossier() { setView('list'); setSelectedId(null); }
  function save(data) {
    if (editing&&editing.id) { Ya.updateEntry('artifacts',editing.id,data); Ya.logActivity('Artifacts','edited',data.name); }
    else { Ya.addEntry('artifacts',data); Ya.logActivity('Artifacts','added',data.name); }
    setEditing(null);
  }
  function confirmDelete() { if(!deleting)return; Ya.deleteEntry(deleting.collection,deleting.entry.id); Ya.logActivity('Artifacts','removed',deleting.entry.name); setDeleting(null); }
  if (view==='dossier'&&selectedEntry) return <Section><ArtifactDossier entry={selectedEntry} onBack={closeDossier} onEdit={()=>setEditing(selectedEntry)}/>{editing&&<ArtifactForm entry={editing} onClose={()=>setEditing(null)} onSave={save}/>}</Section>;
  return (
    <Section>
      <DocHead kicker="Registry · Objects of Power" title="Artifacts &" titleEm="Relics" deck="Every significant object in Eravan. Weapons that ended dynasties. Crowns that drive their wearers mad." code="RELIC-001" codeMeta={{ artifacts: store.artifacts.length, tiers: store.artifactTiers.length }}/>
      <div className="spread" style={{ marginBottom:22 }}>
        <div style={{ display:'flex', gap:12 }}>
          {store.artifactTiers.map(t=>{
            const c = store.artifacts.filter(a=>a.tier===t.name).length;
            return <div key={t.id} style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', color: TIER_COLOR[t.name]||'var(--ash)', opacity: c>0?1:0.4 }}>{t.name} <span style={{ opacity:0.6 }}>({c})</span></div>;
          })}
        </div>
        <div className="row">
          <button className="btn ghost small" onClick={()=>setEditingTiers(true)}><Icon name="drag" size={11}/> Tiers</button>
          <button className="btn primary" onClick={()=>setEditing({})}><Icon name="plus" size={13}/> Add artifact</button>
        </div>
      </div>
      {store.artifacts.length===0
        ? <EmptyState dark title="No artifacts registered." body="Every significant object in the world gets a full registry entry." action={<button className="btn primary" onClick={()=>setEditing({})}><Icon name="plus" size={13}/> Add the first artifact</button>}/>
        : <div className="creature-grid">{store.artifacts.map(e=><ArtifactCard key={e.id} entry={e} onClick={()=>openDossier(e)} onEdit={()=>setEditing(e)} onDelete={()=>setDeleting({collection:'artifacts',entry:e})}/>)}</div>}
      {editing&&<ArtifactForm entry={editing.id?editing:null} onClose={()=>setEditing(null)} onSave={save}/>}
      {deleting&&<ConfirmDialog title={`Remove ${deleting.entry.name}?`} body="This permanently deletes this registry entry." onConfirm={confirmDelete} onCancel={()=>setDeleting(null)}/>}
    </Section>
  );
}
window.ArtifactsSection = ArtifactsSection;
