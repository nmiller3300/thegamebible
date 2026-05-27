/* Game Bible — sections/characters.jsx — Full dossier per character */
const Yc = window.YSTC;

const MAGIC_STATUS = ['None','Ascended','Veilborn','Unknown'];
const MAGIC_COLOR = { None:'var(--ash)', Ascended:'oklch(0.65 0.14 75)', Veilborn:'var(--imperial-soft)', Unknown:'var(--ash)' };
const CLASS_OPTIONS = ['Peasant','Freeman','Tradesperson','Merchant','Knight','Minor Noble','Lord','King','Clergy','Mage','Outlaw','Unknown'];

function CharacterCard({ entry, onClick, onEdit, onDelete }) {
  const magicColor = MAGIC_COLOR[entry.magicStatus] || 'var(--ash)';
  return (
    <div className="creature-card" onClick={onClick} title="Open dossier">
      <div className="creature-card-image">
        {entry.imageUrl
          ? <img src={entry.imageUrl} alt={entry.name} style={{ objectFit:'contain', background:'var(--paper-2)', padding:'8px' }} />
          : <div className="creature-card-placeholder"><Icon name="user" size={28} stroke={1.2} /><div>Portrait pending</div></div>}
        <div className="creature-card-threat" style={{ background: magicColor + '22', color: magicColor, borderColor: magicColor + '55' }}>
          {entry.magicStatus || 'Unknown'}
        </div>
      </div>
      <div className="creature-card-body">
        <div className="creature-card-category">{entry.role || 'Role unknown'}</div>
        <h3 className="creature-card-name">{entry.name || 'Unnamed'}</h3>
        <div className="creature-card-meta">
          <span>{entry.classStanding || '—'}</span>
          <span style={{ opacity:0.4 }}>·</span>
          <span>{entry.location || '—'}</span>
        </div>
        {entry.personality && <p className="creature-card-excerpt">{entry.personality.slice(0, 90)}{entry.personality.length > 90 ? '…' : ''}</p>}
      </div>
      <div className="creature-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={10}/></button>
        <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={10}/></button>
      </div>
    </div>
  );
}

function CharacterDossier({ entry, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('profile');
  const magicColor = MAGIC_COLOR[entry.magicStatus] || 'var(--ash)';
  const tabs = [
    { id:'profile',     label:'Profile' },
    { id:'background',  label:'Background' },
    { id:'allegiances', label:'Allegiances' },
    { id:'intel',       label:'Intel' },
  ];
  return (
    <div className="dossier-shell">
      <div className="dossier-topbar">
        <button className="dossier-back" onClick={onBack}><Icon name="chevronLeft" size={14}/> Characters</button>
        <span className="dossier-crumbs">{entry.role || 'Unknown role'} <span>/</span> {entry.name}</span>
        <div style={{ flex:1 }}></div>
        <div className="dossier-meta">
          <div><span>class</span>{entry.classStanding || '—'}</div>
          <div><span>location</span>{entry.location || '—'}</div>
          <div><span>updated</span>{Yc.formatStamp(entry.updatedAt).split('·')[0].trim()}</div>
        </div>
        <div className="dossier-status-pill" style={{ '--tc': magicColor }}>
          Magic · {entry.magicStatus || 'Unknown'}
        </div>
        <button className="btn small" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
      </div>

      <div className="dossier-title-block">
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Character Record · {entry.role || 'Unknown'}</div>
          <h1 className="dossier-h1">{entry.name}</h1>
          {entry.factionAlignment && <div className="dossier-latin">— {entry.factionAlignment} —</div>}
        </div>
        <div className="dossier-ids">
          <div><span>role</span>{entry.role || '—'}</div>
          <div><span>class</span>{entry.classStanding || '—'}</div>
          <div><span>magic</span>{entry.magicStatus || '—'}</div>
          <div><span>location</span>{entry.location || '—'}</div>
        </div>
      </div>

      <div className="dossier-hero">
        <div className="dossier-stage">
          <div className="dossier-stage-label"><span>Portrait · Primary reference</span><span style={{ opacity:0.5 }}>Field File</span></div>
          <ImageSlot value={entry.imageUrl || ''} onChange={(url) => { Yc.updateEntry('characters', entry.id, { imageUrl: url }); }} height={380} label="Portrait — three-quarter view, neutral expression" />
          {entry.location && <div className="dossier-ruler"><span>Last known location:</span> {entry.location}</div>}
        </div>
        <div className="dossier-spec">
          {[
            ['Role', entry.role || '—'],
            ['Class standing', entry.classStanding || '—'],
            ['Magic status', entry.magicStatus || '—'],
            ['Faction', entry.factionAlignment || '—'],
            ['Location', entry.location || '—'],
          ].map(([k,v]) => (
            <div key={k} className="dossier-spec-row">
              <span className="dossier-spec-k">{k}</span>
              <span className="dossier-spec-v" style={{ fontSize:16 }}>{v}</span>
            </div>
          ))}
          {entry.motivation && <div className="dossier-verdict">{entry.motivation}</div>}
        </div>
      </div>

      <div className="dossier-deepdive">
        <div className="section-mark" style={{ marginBottom:18 }}>Field Study</div>
        <div className="tabs">
          {tabs.map((t,i) => (
            <button key={t.id} role="tab" aria-selected={activeTab===t.id} onClick={() => setActiveTab(t.id)}>
              <span className="num">0{i+1}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ paddingTop:32 }}>

          {activeTab==='profile' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 01 · Appearance</div>
                <div className="dossier-drop-text">
                  {entry.appearance ? entry.appearance.split(/\n+/).map((p,i) => <p key={i}>{p}</p>) : <p className="muted italic">No appearance description recorded.</p>}
                </div>
                {entry.personality && <>
                  <div className="dossier-eyebrow" style={{ marginTop:28 }}>§ Personality</div>
                  {entry.personality.split(/\n+/).map((p,i) => <p key={i} style={{ color:'var(--ink-2)', marginBottom:12 }}>{p}</p>)}
                </>}
              </div>
              <div className="dossier-aside-col">
                <div className="dossier-aside-card">
                  <div className="dossier-aside-label">Field assessment</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[['Class standing',entry.classStanding],['Magic status',entry.magicStatus],['Faction',entry.factionAlignment]].map(([k,v]) => v && (
                      <div key={k}><div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:3 }}>{k}</div><div style={{ color:'var(--ink)', fontSize:15 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab==='background' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                {entry.motivation && <>
                  <div className="dossier-eyebrow">§ 02 · Motivation</div>
                  <div className="dossier-drop-text">{entry.motivation.split(/\n+/).map((p,i) => <p key={i}>{p}</p>)}</div>
                </>}
                {entry.notes && <>
                  <div className="dossier-eyebrow" style={{ marginTop:28 }}>History & Notes</div>
                  {entry.notes.split(/\n+/).map((p,i) => <p key={i} style={{ color:'var(--ink-2)', marginBottom:12 }}>{p}</p>)}
                </>}
                {!entry.motivation && !entry.notes && <p className="muted italic">No background recorded yet.</p>}
              </div>
              {entry.secret && (
                <div className="dossier-aside-col">
                  <div className="dossier-aside-card" style={{ borderLeft:'2px solid var(--imperial)', paddingLeft:18 }}>
                    <div className="dossier-aside-label" style={{ color:'var(--imperial)' }}>Classified · Secret</div>
                    <p style={{ color:'var(--ink-2)', fontSize:15, fontStyle:'italic' }}>{entry.secret}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab==='allegiances' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 03 · Allegiances</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:18 }}>
                {[['Faction alignment',entry.factionAlignment],['Class standing',entry.classStanding],['Magic status',entry.magicStatus],['Reputation modifier',entry.reputationModifier]].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:6 }}>{k}</div>
                    <div style={{ color:'var(--ink)', fontSize:17, fontFamily:'var(--serif)' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==='intel' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 04 · Intelligence Notes</div>
                {entry.questHook && <>
                  <h3 className="dossier-section-h">Quest hook</h3>
                  <div className="dossier-drop-text">{entry.questHook.split(/\n+/).map((p,i) => <p key={i}>{p}</p>)}</div>
                </>}
                {entry.notes && <>
                  <div className="dossier-eyebrow" style={{ marginTop:24 }}>Notes</div>
                  {entry.notes.split(/\n+/).map((p,i) => <p key={i} style={{ color:'var(--ink-2)', marginBottom:12 }}>{p}</p>)}
                </>}
                {!entry.questHook && !entry.notes && <p className="muted italic">No intelligence on file.</p>}
              </div>
              {entry.secret && (
                <div className="dossier-aside-col">
                  <div className="dossier-aside-card" style={{ borderLeft:'2px solid var(--imperial)' }}>
                    <div className="dossier-aside-label" style={{ color:'var(--imperial)' }}>Classified</div>
                    <p style={{ color:'var(--ink-2)', fontSize:15, fontStyle:'italic' }}>{entry.secret}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dossier-footer">
        <span>Character Record · {entry.role} · {entry.name}</span>
        <span className="dossier-footer-sigil">— filed under the seal of the Concept Studio —</span>
        <Attrib entry={entry} />
      </div>
    </div>
  );
}

function CharacterForm({ entry, onClose, onSave }) {
  const init = { name:'', role:'', location:'', factionAlignment:'', classStanding:'', magicStatus:'None', appearance:'', personality:'', motivation:'', secret:'', reputationModifier:'', questHook:'', notes:'', status:'confirmed', imageUrl:'', ...(entry||{}) };
  const [d, setD] = useState(init);
  useEffect(() => { setD({ ...init, ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p => ({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head"><div><h2>{entry ? 'Edit character' : 'Add a character'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Characters & NPCs</div></div><div className="doc-code">CHAR-001</div></div>
      <div className="field-row"><Field label="Name"><TextInput value={d.name} onChange={(v) => set('name',v)} /></Field><Field label="Role"><TextInput value={d.role} onChange={(v) => set('role',v)} placeholder="Noble / Guard / Merchant" /></Field></div>
      <div className="field-row three">
        <Field label="Class standing"><Select value={d.classStanding} onChange={(v) => set('classStanding',v)} options={['', ...CLASS_OPTIONS]} /></Field>
        <Field label="Magic status"><Select value={d.magicStatus} onChange={(v) => set('magicStatus',v)} options={MAGIC_STATUS} /></Field>
        <Field label="Faction"><TextInput value={d.factionAlignment} onChange={(v) => set('factionAlignment',v)} /></Field>
      </div>
      <Field label="Location"><TextInput value={d.location} onChange={(v) => set('location',v)} /></Field>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v) => set('appearance',v)} rows={3} /></Field>
      <Field label="Personality"><TextArea value={d.personality} onChange={(v) => set('personality',v)} rows={2} /></Field>
      <Field label="Motivation"><TextArea value={d.motivation} onChange={(v) => set('motivation',v)} rows={3} /></Field>
      <Field label="Secret — classified"><TextArea value={d.secret} onChange={(v) => set('secret',v)} rows={2} /></Field>
      <div className="field-row"><Field label="Reputation modifier"><TextInput value={d.reputationModifier} onChange={(v) => set('reputationModifier',v)} /></Field><Field label="Quest hook"><TextInput value={d.questHook} onChange={(v) => set('questHook',v)} /></Field></div>
      <Field label="Notes"><TextArea value={d.notes} onChange={(v) => set('notes',v)} rows={2} /></Field>
      <Field label="Portrait"><ImageSlot value={d.imageUrl} onChange={(v) => set('imageUrl',v)} height={160} /></Field>
      <div className="modal-actions"><ConfirmedToggle value={d.status==='confirmed'} onChange={(b) => set('status',b?'confirmed':'pending')} /><div className="right"><button className="btn on-paper ghost" onClick={onClose}>Cancel</button><button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry?'Save':'Add character'}</button></div></div>
    </Modal>
  );
}

// NPC archetypes reference panel
function ArchetypePanel({ archetypes, onEdit }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div className="section-mark">Archetype Reference</div>
      <div style={{ marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p className="muted italic" style={{ margin:0 }}>Recurring NPC patterns the team draws from.</p>
        <button className="btn ghost small" onClick={onEdit}><Icon name="pencil" size={11}/> Edit archetypes</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
        {archetypes.map(a => (
          <div key={a.id} className="paper-card tight">
            <h4 style={{ margin:'0 0 6px', fontStyle:'italic' }}>{a.name}</h4>
            <p style={{ margin:0, fontSize:14, color:'var(--ink-2)' }}>{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharactersSection() {
  const store = Yc.useStore();
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editingArchetypes, setEditingArchetypes] = useState(false);
  const [archetypeDraft, setArchetypeDraft] = useState([]);

  const selectedEntry = selectedId ? store.characters.find(e => e.id === selectedId) : null;

  function openDossier(e) { setSelectedId(e.id); setView('dossier'); }
  function closeDossier() { setView('list'); setSelectedId(null); }
  function saveChar(data) {
    if (editing && editing.id) { Yc.updateEntry('characters', editing.id, data); Yc.logActivity('Characters', 'edited', data.name); }
    else { Yc.addEntry('characters', data); Yc.logActivity('Characters', 'added', data.name); }
    setEditing(null);
  }
  function confirmDelete() { if (!deleting) return; Yc.deleteEntry(deleting.collection, deleting.entry.id); Yc.logActivity('Characters', 'removed', deleting.entry.name); setDeleting(null); }

  if (view === 'dossier' && selectedEntry) {
    return (
      <Section>
        <CharacterDossier entry={selectedEntry} onBack={closeDossier} onEdit={() => setEditing(selectedEntry)} />
        {editing && <CharacterForm entry={editing} onClose={() => setEditing(null)} onSave={saveChar} />}
      </Section>
    );
  }

  return (
    <Section>
      <DocHead kicker="Index · People of the World" title="Characters &" titleEm="NPCs" deck="Named characters, faction leaders, and notable persons. Every entry is a classified field record." code="CHAR-001" codeMeta={{ characters: store.characters.length, archetypes: store.npcArchetypes.length }} />
      <div className="spread" style={{ marginBottom:22 }}>
        <span></span>
        <button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add character</button>
      </div>
      <ArchetypePanel archetypes={store.npcArchetypes} onEdit={() => { setArchetypeDraft([...store.npcArchetypes]); setEditingArchetypes(true); }} />
      {store.characters.length === 0
        ? <EmptyState dark title="No characters recorded yet." body="Every named character in Eravan gets a full classified dossier." action={<button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add the first character</button>} />
        : <div className="creature-grid">{store.characters.map(e => <CharacterCard key={e.id} entry={e} onClick={() => openDossier(e)} onEdit={() => setEditing(e)} onDelete={() => setDeleting({ collection:'characters', entry:e })} />)}</div>}
      {editing && <CharacterForm entry={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={saveChar} />}
      {editingArchetypes && (
        <Modal open onClose={() => setEditingArchetypes(false)}>
          <div className="modal-head"><h2>Edit archetypes</h2><div className="doc-code">CHAR-001</div></div>
          {archetypeDraft.map((a, i) => (
            <div key={a.id} className="field-row" style={{ marginBottom:10 }}>
              <Field label={`Name ${i+1}`}><TextInput value={a.name} onChange={(v) => { const next=[...archetypeDraft]; next[i]={...a,name:v}; setArchetypeDraft(next); }} /></Field>
              <Field label="Description"><TextInput value={a.description} onChange={(v) => { const next=[...archetypeDraft]; next[i]={...a,description:v}; setArchetypeDraft(next); }} /></Field>
            </div>
          ))}
          <div className="modal-actions"><span></span><div className="right"><button className="btn on-paper ghost" onClick={() => setEditingArchetypes(false)}>Cancel</button><button className="btn on-paper primary" onClick={() => { Yc.setStore({ npcArchetypes: archetypeDraft }); setEditingArchetypes(false); }}>Save</button></div></div>
        </Modal>
      )}
      {deleting && <Modal open onClose={() => setDeleting(null)}><ConfirmDialog title={`Remove ${deleting.entry.name}?`} body="This permanently deletes this character record." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} /></Modal>}
    </Section>
  );
}

window.CharactersSection = CharactersSection;
