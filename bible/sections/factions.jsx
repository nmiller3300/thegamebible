/* Game Bible — sections/factions.jsx — Full dossier per faction */
const Yf = window.YSTC;

const FACTION_TYPES = ['Empire','Kingdom','City-State','Noble House','Guild','Tribe','Cult','Rebel Faction','Religious Order','Criminal Network','Other'];
const MILITARY_STRENGTH = ['Dominant','Strong','Moderate','Weak','Negligible','Unknown'];
const STRENGTH_COLOR = { Dominant:'oklch(0.55 0.18 30)', Strong:'var(--imperial-soft)', Moderate:'oklch(0.65 0.14 75)', Weak:'var(--moss)', Negligible:'var(--ash)', Unknown:'var(--ash)' };

function FactionCard({ entry, onClick, onEdit, onDelete }) {
  const strColor = STRENGTH_COLOR[entry.militaryStrength] || 'var(--ash)';
  return (
    <div className="creature-card" onClick={onClick} title="Open dossier">
      <div className="creature-card-image">
        {entry.imageUrl
          ? <img src={entry.imageUrl} alt={entry.name} />
          : <div className="creature-card-placeholder"><Icon name="flag" size={28} stroke={1.2} /><div>Banner pending</div></div>}
        <div className="creature-card-threat" style={{ background: strColor+'22', color: strColor, borderColor: strColor+'55' }}>
          {entry.militaryStrength || '—'}
        </div>
      </div>
      <div className="creature-card-body">
        <div className="creature-card-category">{entry.factionType || 'Unknown type'}</div>
        <h3 className="creature-card-name">{entry.name || 'Unnamed'}</h3>
        <div className="creature-card-meta">
          <span>{entry.leader || '—'}</span>
          <span style={{ opacity:0.4 }}>·</span>
          <span>{entry.region || '—'}</span>
        </div>
        {entry.reputation && <p className="creature-card-excerpt">{entry.reputation.slice(0,90)}{entry.reputation.length>90?'…':''}</p>}
      </div>
      <div className="creature-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={10}/></button>
        <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={10}/></button>
      </div>
    </div>
  );
}

function FactionDossier({ entry, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');
  const strColor = STRENGTH_COLOR[entry.militaryStrength] || 'var(--ash)';
  const tabs = [
    { id:'overview',    label:'Overview' },
    { id:'military',    label:'Military' },
    { id:'economy',     label:'Economy' },
    { id:'allegiances', label:'Allegiances' },
    { id:'classified',  label:'Classified' },
  ];
  return (
    <div className="dossier-shell">
      <div className="dossier-topbar">
        <button className="dossier-back" onClick={onBack}><Icon name="chevronLeft" size={14}/> Factions</button>
        <span className="dossier-crumbs">{entry.factionType || 'Unknown'} <span>/</span> {entry.name}</span>
        <div style={{ flex:1 }}></div>
        <div className="dossier-meta">
          <div><span>leader</span>{entry.leader || '—'}</div>
          <div><span>capital</span>{entry.capital || '—'}</div>
          <div><span>updated</span>{Yf.formatStamp(entry.updatedAt).split('·')[0].trim()}</div>
        </div>
        <div className="dossier-status-pill" style={{ '--tc': strColor }}>Military · {entry.militaryStrength || '—'}</div>
        <button className="btn small" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
      </div>

      <div className="dossier-title-block">
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Political Intelligence · {entry.factionType || 'Unknown'}</div>
          <h1 className="dossier-h1">{entry.name}</h1>
          {entry.region && <div className="dossier-latin">— {entry.region} —</div>}
        </div>
        <div className="dossier-ids">
          <div><span>type</span>{entry.factionType || '—'}</div>
          <div><span>leader</span>{entry.leader || '—'}</div>
          <div><span>capital</span>{entry.capital || '—'}</div>
          <div><span>military</span>{entry.militaryStrength || '—'}</div>
        </div>
      </div>

      <div className="dossier-hero">
        <div className="dossier-stage">
          <div className="dossier-stage-label"><span>Banner · Primary reference</span><span style={{ opacity:0.5 }}>Intelligence File</span></div>
          <ImageSlot value={entry.imageUrl || ''} onChange={(url) => Yf.updateEntry('factions', entry.id, { imageUrl: url })} height={360} label="Faction banner, seal, or symbol" />
          {entry.reputation && <div className="dossier-ruler"><span>Reputation:</span> {entry.reputation}</div>}
        </div>
        <div className="dossier-spec">
          {[
            ['Type', entry.factionType || '—'],
            ['Leader', entry.leader || '—'],
            ['Capital', entry.capital || '—'],
            ['Region', entry.region || '—'],
            ['Military', entry.militaryStrength || '—'],
          ].map(([k,v]) => (
            <div key={k} className="dossier-spec-row">
              <span className="dossier-spec-k">{k}</span>
              <span className="dossier-spec-v" style={{ fontSize:16 }}>{v}</span>
            </div>
          ))}
          {entry.reputation && <div className="dossier-verdict">{entry.reputation}</div>}
        </div>
      </div>

      <div className="dossier-deepdive">
        <div className="section-mark" style={{ marginBottom:18 }}>Intelligence Assessment</div>
        <div className="tabs">
          {tabs.map((t,i) => (
            <button key={t.id} role="tab" aria-selected={activeTab===t.id} onClick={() => setActiveTab(t.id)}>
              <span className="num">0{i+1}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ paddingTop:32 }}>

          {activeTab==='overview' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 01 · Overview</div>
                <div className="dossier-drop-text">
                  {entry.economy ? entry.economy.split(/\n+/).map((p,i) => <p key={i}>{p}</p>) : <p className="muted italic">No overview recorded.</p>}
                </div>
              </div>
              <div className="dossier-aside-col">
                <div className="dossier-aside-card">
                  <div className="dossier-aside-label">At a glance</div>
                  {[['Type',entry.factionType],['Leader',entry.leader],['Capital',entry.capital],['Region',entry.region]].map(([k,v]) => v && (
                    <div key={k} style={{ marginBottom:12 }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:3 }}>{k}</div>
                      <div style={{ color:'var(--ink)', fontSize:15 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab==='military' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 02 · Military Assessment</div>
              <div style={{ display:'flex', alignItems:'center', gap:16, margin:'18px 0 28px' }}>
                <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:24, color:'var(--ink)' }}>Military strength:</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:16, letterSpacing:'0.12em', color: strColor, borderBottom:'2px solid '+strColor, paddingBottom:2 }}>{entry.militaryStrength || 'Unknown'}</div>
              </div>
              {!entry.militaryStrength && <p className="muted italic">No military intelligence on file.</p>}
            </div>
          )}

          {activeTab==='economy' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 03 · Economy & Resources</div>
              {entry.economy
                ? <div style={{ marginTop:14 }}>{entry.economy.split(/\n+/).map((p,i) => <p key={i} style={{ color:'var(--ink-2)', marginBottom:12 }}>{p}</p>)}</div>
                : <p className="muted italic">No economic intelligence on file.</p>}
            </div>
          )}

          {activeTab==='allegiances' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div className="paper-card">
                <div className="dossier-eyebrow">Allies</div>
                {entry.allies ? <p style={{ marginTop:12, color:'var(--ink-2)' }}>{entry.allies}</p> : <p className="muted italic">None confirmed.</p>}
              </div>
              <div className="paper-card">
                <div className="dossier-eyebrow">Enemies</div>
                {entry.enemies ? <p style={{ marginTop:12, color:'var(--ink-2)' }}>{entry.enemies}</p> : <p className="muted italic">None confirmed.</p>}
              </div>
              {entry.reputation && (
                <div className="paper-card" style={{ gridColumn:'span 2' }}>
                  <div className="dossier-eyebrow">How outsiders see them</div>
                  <p style={{ marginTop:12, color:'var(--ink-2)' }}>{entry.reputation}</p>
                </div>
              )}
            </div>
          )}

          {activeTab==='classified' && (
            <div className="dossier-restrictions" style={{ marginTop:0 }}>
              <div className="dossier-restrictions-inner">
                <h3>Hidden agenda</h3>
                <p className="dossier-restrictions-lede">Classified intelligence. Not for general circulation.</p>
                {entry.hiddenAgenda
                  ? <div style={{ fontFamily:'var(--serif)', fontSize:17, color:'var(--paper)', lineHeight:1.7, fontStyle:'italic' }}>{entry.hiddenAgenda}</div>
                  : <div style={{ fontStyle:'italic', color:'var(--ash)', fontSize:14 }}>No classified intelligence on file.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dossier-footer">
        <span>Political Intelligence · {entry.factionType} · {entry.name}</span>
        <span className="dossier-footer-sigil">— classified under the seal of the Concept Studio —</span>
        <Attrib entry={entry} />
      </div>
    </div>
  );
}

function FactionForm({ entry, onClose, onSave }) {
  const init = { name:'', factionType:'', leader:'', capital:'', region:'', militaryStrength:'', allies:'', enemies:'', economy:'', reputation:'', hiddenAgenda:'', imageUrl:'', status:'pending', ...(entry||{}) };
  const [d, setD] = useState(init);
  useEffect(() => { setD({ ...init, ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p=>({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head"><div><h2>{entry?'Edit faction':'Add a faction'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Factions & Politics</div></div><div className="doc-code">FACT-001</div></div>
      <div className="field-row"><Field label="Name"><TextInput value={d.name} onChange={(v) => set('name',v)} /></Field><Field label="Type"><Select value={d.factionType} onChange={(v) => set('factionType',v)} options={['', ...FACTION_TYPES]} /></Field></div>
      <div className="field-row three"><Field label="Leader"><TextInput value={d.leader} onChange={(v) => set('leader',v)} /></Field><Field label="Capital"><TextInput value={d.capital} onChange={(v) => set('capital',v)} /></Field><Field label="Region"><TextInput value={d.region} onChange={(v) => set('region',v)} /></Field></div>
      <Field label="Military strength"><Select value={d.militaryStrength} onChange={(v) => set('militaryStrength',v)} options={['', ...MILITARY_STRENGTH]} /></Field>
      <div className="field-row"><Field label="Allies"><TextArea value={d.allies} onChange={(v) => set('allies',v)} rows={2} /></Field><Field label="Enemies"><TextArea value={d.enemies} onChange={(v) => set('enemies',v)} rows={2} /></Field></div>
      <Field label="Economy & resources"><TextArea value={d.economy} onChange={(v) => set('economy',v)} rows={3} /></Field>
      <Field label="Reputation — how outsiders see them"><TextArea value={d.reputation} onChange={(v) => set('reputation',v)} rows={2} /></Field>
      <Field label="Hidden agenda — classified"><TextArea value={d.hiddenAgenda} onChange={(v) => set('hiddenAgenda',v)} rows={3} /></Field>
      <Field label="Banner / symbol image"><ImageSlot value={d.imageUrl} onChange={(v) => set('imageUrl',v)} height={140} /></Field>
      <div className="modal-actions"><ConfirmedToggle value={d.status==='confirmed'} onChange={(b) => set('status',b?'confirmed':'pending')} /><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry?'Save':'Add faction'}</button></div></div>
    </Modal>
  );
}


function TensionForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ title:'', parties:'', summary:'', status:'open', ...(entry||{}) });
  useEffect(() => { setD({ title:'', parties:'', summary:'', status:'open', ...(entry||{}) }); }, [entry]);
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head"><h2>{entry ? 'Edit tension' : 'Add a tension'}</h2><div className="doc-code">FACT-001</div></div>
      <Field label="Headline"><TextInput value={d.title} onChange={(v) => setD({...d,title:v})} /></Field>
      <Field label="Parties involved"><TextInput value={d.parties} onChange={(v) => setD({...d,parties:v})} /></Field>
      <Field label="Summary"><TextArea value={d.summary} onChange={(v) => setD({...d,summary:v})} rows={5} /></Field>
      <div className="modal-actions"><span></span><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.title?.trim()} onClick={() => onSave(d)}>Save</button></div></div>
    </Modal>
  );
}

function FactionsSection() {
  const store = Yf.useStore();
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('factions');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingTension, setEditingTension] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const selectedEntry = selectedId ? store.factions.find(e => e.id === selectedId) : null;

  function openDossier(e) { setSelectedId(e.id); setView('dossier'); }
  function closeDossier() { setView('list'); setSelectedId(null); }
  function saveFaction(data) {
    if (editing && editing.id) { Yf.updateEntry('factions', editing.id, data); Yf.logActivity('Factions', 'edited', data.name); }
    else { Yf.addEntry('factions', data); Yf.logActivity('Factions', 'added', data.name); }
    setEditing(null);
  }
  function saveTension(data) {
    if (editingTension && editingTension.id) Yf.updateEntry('factionTensions', editingTension.id, data);
    else Yf.addEntry('factionTensions', data);
    setEditingTension(null);
  }
  function confirmDelete() { if (!deleting) return; Yf.deleteEntry(deleting.collection, deleting.entry.id); Yf.logActivity('Factions', 'removed', deleting.entry.name); setDeleting(null); }

  if (view === 'dossier' && selectedEntry) {
    return (
      <Section>
        <FactionDossier entry={selectedEntry} onBack={closeDossier} onEdit={() => setEditing(selectedEntry)} />
        {editing && <FactionForm entry={editing} onClose={() => setEditing(null)} onSave={saveFaction} />}
      </Section>
    );
  }

  return (
    <Section>
      <DocHead kicker="Intelligence · Political Landscape" title="Factions &" titleEm="Politics" deck="Every faction, house, and power structure in Eravan. The empire is fracturing. Nothing here is stable." code="FACT-001" codeMeta={{ factions: store.factions.length, tensions: store.factionTensions.length }} />
      <div className="spread" style={{ marginBottom:18 }}>
        <nav className="tabs" style={{ flex:1 }}>
          <button role="tab" aria-selected={tab==='factions'} onClick={() => setTab('factions')}><span className="num">01</span>Factions & Houses</button>
          <button role="tab" aria-selected={tab==='tensions'} onClick={() => setTab('tensions')}><span className="num">02</span>Political Tensions</button>
        </nav>
        <button className="btn primary" onClick={() => tab==='factions' ? setEditing({}) : setEditingTension({})}><Icon name="plus" size={13}/> Add {tab==='factions'?'faction':'tension'}</button>
      </div>

      {tab==='factions' && (
        store.factions.length===0
          ? <EmptyState dark title="No factions recorded yet." body="Every faction becomes a full intelligence dossier. Add the first one." action={<button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add the first faction</button>} />
          : <div className="creature-grid">{store.factions.map(e => <FactionCard key={e.id} entry={e} onClick={() => openDossier(e)} onEdit={() => setEditing(e)} onDelete={() => setDeleting({ collection:'factions', entry:e })} />)}</div>
      )}

      {tab==='tensions' && (
        store.factionTensions.length===0
          ? <EmptyState dark title="No political tensions recorded." body="Document the simmering conflicts the player can step into or ignite." action={<button className="btn primary" onClick={() => setEditingTension({})}><Icon name="plus" size={13}/> Add a tension</button>} />
          : <div className="stack">{store.factionTensions.map(t => (
              <div key={t.id} className="paper-card">
                <div className="card-head"><h3>{t.title || 'Untitled tension'}</h3><div className="row" style={{ gap:8 }}><button className="btn small on-paper" onClick={() => setEditingTension(t)}><Icon name="pencil" size={11}/></button><button className="btn small on-paper danger" onClick={() => setDeleting({ collection:'factionTensions', entry:t })}><Icon name="trash" size={11}/></button></div></div>
                {t.parties && <p style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', color:'var(--imperial)', textTransform:'uppercase', margin:'0 0 10px' }}>{t.parties}</p>}
                {t.summary && <p style={{ color:'var(--ink-2)', marginBottom:10 }}>{t.summary}</p>}
                <Attrib entry={t} />
              </div>
            ))}</div>
      )}

      {editing && <FactionForm entry={editing.id?editing:null} onClose={() => setEditing(null)} onSave={saveFaction} />}
      {editingTension && (
        <TensionForm entry={editingTension.id ? editingTension : null} onClose={() => setEditingTension(null)} onSave={saveTension} />
      )}
      {deleting && <Modal open onClose={() => setDeleting(null)}><ConfirmDialog title={`Remove ${deleting.entry.name||deleting.entry.title}?`} body="This permanently deletes this record." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} /></Modal>}
    </Section>
  );
}

window.FactionsSection = FactionsSection;
