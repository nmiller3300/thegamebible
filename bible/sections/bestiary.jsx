/* Game Bible — sections/bestiary.jsx
 * Full dossier view per creature, matching Crowned Stag Dossier aesthetic.
 */
const Ybe = window.YSTC;

const CREATURE_TYPES = ['Beast','Undead','Construct','Unknown','Human','Magical','Other'];
const INTELLIGENCE   = ['Animal','Semi-intelligent','Fully intelligent','Unknown'];
const THREAT         = ['Harmless','Low','Medium','High','Legendary','Unknown'];
const THREAT_COLOR   = { Harmless:'var(--moss)', Low:'var(--moss)', Medium:'oklch(0.65 0.14 75)', High:'var(--imperial-soft)', Legendary:'oklch(0.55 0.18 30)', Unknown:'var(--ash)' };

const PIPELINE_STEPS = [
  { id:'p1', num:'01', label:'Concept plates',  desc:'Reference images uploaded and approved.' },
  { id:'p2', num:'02', label:'Meshy intake',     desc:'Image-to-3D submitted. Base mesh generated.' },
  { id:'p3', num:'03', label:'Retopo & rig',     desc:'Mesh cleanup, skeleton, weight painting.' },
  { id:'p4', num:'04', label:'Texturing',        desc:'Albedo, roughness, normal map, AO baked.' },
  { id:'p5', num:'05', label:'LODs',             desc:'Four LOD variants built for the engine.' },
  { id:'p6', num:'06', label:'Engine review',    desc:'In-engine animation states and final sign-off.' },
];

function getMeta(e) { return (e && e.metadata) ? (typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata) : {}; }

// ── Creature card for list view ───────────────────────────────────────────
function CreatureCard({ entry, onClick, onEdit, onDelete }) {
  const meta = getMeta(entry);
  const mainImg = meta.imgMain || entry.imageUrl || '';
  const threatColor = THREAT_COLOR[entry.threatLevel] || 'var(--ash)';

  return (
    <div className="creature-card" onClick={onClick} title="Open dossier">
      <div className="creature-card-image">
        {mainImg
          ? <img src={mainImg} alt={entry.name} style={{ objectFit:'contain', background:'var(--paper-2)', padding:'8px' }} />
          : (
            <div className="creature-card-placeholder">
              <Icon name="shield" size={28} stroke={1.2} />
              <div>Concept plate pending</div>
            </div>
          )}
        <div className="creature-card-threat" style={{ background: threatColor + '22', color: threatColor, borderColor: threatColor + '55' }}>
          {entry.threatLevel || '—'}
        </div>
      </div>
      <div className="creature-card-body">
        <div className="creature-card-category">{entry.category || 'Uncategorised'}</div>
        <h3 className="creature-card-name">{entry.name || 'Unnamed'}</h3>
        <div className="creature-card-meta">
          <span>{entry.entryType || entry.type || '—'}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{entry.intelligence || '—'}</span>
        </div>
        {entry.appearance && (
          <p className="creature-card-excerpt">{entry.appearance.slice(0, 100)}{entry.appearance.length > 100 ? '…' : ''}</p>
        )}
      </div>
      <div className="creature-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={10}/></button>
        <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={10}/></button>
      </div>
    </div>
  );
}

// ── Full dossier view ─────────────────────────────────────────────────────
function CreatureDossier({ entry, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');
  const meta = getMeta(entry);

  function updateMeta(patch) {
    const newMeta = { ...meta, ...patch };
    Ybe.updateEntry('bestiaryEntries', entry.id, { metadata: newMeta });
    Ybe.logActivity('Bestiary', 'updated', entry.name);
  }

  function togglePipeline(stepId) {
    const pipeline = meta.pipeline || {};
    const current = pipeline[stepId] || 'pending';
    const next = current === 'pending' ? 'done' : 'pending';
    updateMeta({ pipeline: { ...pipeline, [stepId]: next } });
  }

  function updateRestrictions(text) {
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    updateMeta({ restrictions: lines });
  }

  const pipeline = meta.pipeline || {};
  const doneCount = PIPELINE_STEPS.filter(s => pipeline[s.id] === 'done').length;
  const restrictions = meta.restrictions || [];

  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'lore',     label:'Lore' },
    { id:'magic',    label:'Magic' },
    { id:'pipeline', label:'3D Pipeline' },
  ];

  return (
    <div className="dossier-shell">

      {/* Dossier top bar */}
      <div className="dossier-topbar">
        <button className="dossier-back" onClick={onBack}>
          <Icon name="chevronLeft" size={14}/> Bestiary
        </button>
        <span className="dossier-crumbs">
          {entry.category || 'Unknown'} <span>/</span> {entry.name}
        </span>
        <div style={{ flex: 1 }}></div>
        <div className="dossier-meta">
          <div><span>class</span>{entry.entryType || entry.type || '—'}</div>
          <div><span>intelligence</span>{entry.intelligence || '—'}</div>
          <div><span>updated</span>{Ybe.formatStamp(entry.updatedAt).split('·')[0].trim()}</div>
        </div>
        <div className="dossier-status-pill" style={{ '--tc': THREAT_COLOR[entry.threatLevel] || 'var(--ash)' }}>
          Threat · {entry.threatLevel || 'Unknown'}
        </div>
        <button className="btn small" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
      </div>

      {/* Title block */}
      <div className="dossier-title-block">
        <div>
          <div className="dossier-kicker">
            <span className="dossier-kicker-bar"></span>
            Imperial Bestiary · {entry.category || 'Unknown'}
          </div>
          <h1 className="dossier-h1">{entry.name}</h1>
          {meta.latinName && <div className="dossier-latin">— {meta.latinName} —</div>}
        </div>
        <div className="dossier-ids">
          <div><span>habitat</span>{entry.habitat || '—'}</div>
          <div><span>threat</span>{entry.threatLevel || '—'}</div>
          <div><span>intelligence</span>{entry.intelligence || '—'}</div>
          <div><span>status</span>{entry.status || 'pending'}</div>
        </div>
      </div>

      {/* Hero — main plate + spec */}
      <div className="dossier-hero">
        <div className="dossier-stage">
          <div className="dossier-stage-label">
            <span>Plate I · Primary reference · Neutral pose</span>
            <span style={{ opacity: 0.5 }}>Ref · For Modeling</span>
          </div>
          <ImageSlot
            value={meta.imgMain || entry.imageUrl || ''}
            onChange={(url) => updateMeta({ imgMain: url })}
            height={420}
            fit="contain"
            label="Primary reference — side profile, neutral stance, plain background"
          />
          {entry.habitat && (
            <div className="dossier-ruler">
              <span>Habitat:</span> {entry.habitat}
            </div>
          )}
        </div>

        <div className="dossier-spec">
          {[
            ['Type',        entry.entryType || entry.type || '—'],
            ['Intelligence',entry.intelligence || '—'],
            ['Habitat',     entry.habitat || '—'],
            ['Threat',      entry.threatLevel || '—'],
          ].map(([k, v]) => (
            <div key={k} className="dossier-spec-row">
              <span className="dossier-spec-k">{k}</span>
              <span className="dossier-spec-v">{v}</span>
            </div>
          ))}
          {entry.magicConnection && (
            <div className="dossier-verdict">
              {entry.magicConnection}
            </div>
          )}
        </div>
      </div>


      {/* Field study tabs */}
      <div className="dossier-deepdive">
        <div className="section-mark" style={{ marginBottom: 18 }}>Field Study</div>
        <div className="tabs">
          {tabs.map((t, i) => (
            <button key={t.id} role="tab" aria-selected={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              <span className="num">0{i+1}</span>{t.label}
            </button>
          ))}
          {doneCount > 0 && (
            <span style={{ marginLeft:'auto', fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.14em', color:'var(--moss)', alignSelf:'center', paddingRight:18 }}>
              Pipeline {doneCount}/{PIPELINE_STEPS.length}
            </span>
          )}
        </div>

        <div style={{ paddingTop: 32 }}>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 01 · Appearance</div>
                <div className="dossier-drop-text">
                  {entry.appearance
                    ? entry.appearance.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
                    : <p className="muted italic">No appearance description yet. Edit this entry to add one.</p>}
                </div>
              </div>
              {(meta.readTargets || meta.references) && (
                <div className="dossier-aside-col">
                  {meta.readTargets && (
                    <div className="dossier-aside-card">
                      <div className="dossier-aside-label">Read targets</div>
                      <div className="dossier-tag-cloud">
                        {meta.readTargets.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} className="dossier-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lore tab */}
          {activeTab === 'lore' && (
            <div className="dossier-tab-panel">
              <div className="dossier-prose-col">
                <div className="dossier-eyebrow">§ 02 · Lore</div>
                <h3 className="dossier-section-h">{entry.name} in the world</h3>
                {entry.lore
                  ? entry.lore.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
                  : <p className="muted italic">No lore recorded yet.</p>}

                {entry.behaviors && (
                  <>
                    <div className="dossier-eyebrow" style={{ marginTop: 28 }}>Notable behaviors</div>
                    {entry.behaviors.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
                  </>
                )}
              </div>
              {meta.inWorldAppearances && (
                <div className="dossier-aside-col">
                  <div className="dossier-aside-card">
                    <div className="dossier-aside-label">In-world appearances</div>
                    <p style={{ color:'var(--ink-2)', fontSize:15 }}>{meta.inWorldAppearances}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Magic tab */}
          {activeTab === 'magic' && (
            <div className="paper-card">
              <div className="dossier-eyebrow">§ 03 · Connection to Magic</div>
              {entry.magicConnection
                ? <div className="dossier-drop-text">{entry.magicConnection.split(/\n+/).map((p,i) => <p key={i}>{p}</p>)}</div>
                : <p className="muted italic">No magical connection recorded.</p>}
            </div>
          )}

          {/* Pipeline tab */}
          {activeTab === 'pipeline' && (
            <div>
              <div className="dossier-eyebrow">§ 04 · 3D Pipeline · Meshy → Engine</div>
              <h3 className="dossier-section-h" style={{ marginTop: 8 }}>From concept to walking asset</h3>
              <div className="dossier-pipeline">
                {PIPELINE_STEPS.map((step) => {
                  const done = pipeline[step.id] === 'done';
                  return (
                    <div key={step.id} className={'dossier-pipe' + (done ? ' done' : '')} onClick={() => togglePipeline(step.id)}>
                      <div className="dossier-pipe-step">Step {step.num}</div>
                      <h4 className="dossier-pipe-title">{step.label}</h4>
                      <p className="dossier-pipe-desc">{step.desc}</p>
                      <div className="dossier-pipe-check">{done ? '✓' : '○'}</div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Restrictions — always shown below tabs */}
      <div className="dossier-restrictions">
        <div className="dossier-restrictions-inner">
          <h3>What <em>{entry.name}</em> is not</h3>
          <p className="dossier-restrictions-lede">
            Anything below should be rejected at concept review. This creature exists in a serious world. It gets its weight from the lore, not from effects.
          </p>
          {restrictions.length > 0 ? (
            <div className="dossier-restrict-grid">
              {restrictions.map((r, i) => <div key={i} className="dossier-restrict-item">{r}</div>)}
            </div>
          ) : (
            <div style={{ fontStyle:'italic', color:'var(--ash)', fontSize:14 }}>No design restrictions recorded. Edit this entry to add them.</div>
          )}
          <div style={{ marginTop:18 }}>
            <RestrictionsEditor value={restrictions} onChange={(lines) => updateMeta({ restrictions: lines })} />
          </div>
        </div>
      </div>

      {/* Dossier footer */}
      <div className="dossier-footer">
        <span>Imperial Bestiary · {entry.category} · {entry.name}</span>
        <span className="dossier-footer-sigil">— recorded under the seal of the Concept Studio —</span>
        <span><Attrib entry={entry} /></span>
      </div>

    </div>
  );
}

// ── Restrictions inline editor ───────────────────────────────────────────
function RestrictionsEditor({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => { if (open) setDraft(value.join('\n')); }, [open]);
  function save() { onChange(draft.split('\n').map(s=>s.trim()).filter(Boolean)); setOpen(false); }
  if (!open) return <button className="btn small on-paper ghost" onClick={() => setOpen(true)}><Icon name="pencil" size={10}/> Edit restrictions</button>;
  return (
    <div>
      <Field label="One restriction per line">
        <TextArea value={draft} onChange={setDraft} rows={6} placeholder={"No glowing eyes\nNo magical aura\nNo armor or barding"} />
      </Field>
      <div className="row" style={{ gap:8, marginTop:8 }}>
        <button className="btn on-paper ghost small" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn on-paper primary small" onClick={save}>Save</button>
      </div>
    </div>
  );
}

// ── Creature form (add / edit) ────────────────────────────────────────────
function CreatureForm({ entry, onClose, onSave }) {
  const store = Ybe.useStore();
  const meta = getMeta(entry);
  const init = {
    name:'', category: store.bestiaryCategories[0] || 'Wild Fauna',
    entryType:'', habitat:'', intelligence:'', threatLevel:'', status:'pending',
    appearance:'', lore:'', behaviors:'', magicConnection:'',
    imageUrl:'', ...(entry || {}),
  };
  const [d, setD] = useState(init);
  const [metaDraft, setMetaDraft] = useState({ latinName:'', readTargets:'', inWorldAppearances:'', ...meta });
  useEffect(() => { setD({ ...init, ...(entry || {}) }); setMetaDraft({ latinName:'', readTargets:'', inWorldAppearances:'', ...getMeta(entry) }); }, [entry]);

  function set(k, v) { setD(prev => ({ ...prev, [k]: v })); }

  function save() {
    const payload = { ...d, metadata: metaDraft };
    onSave(payload);
  }

  return (
    <Modal open onClose={onClose}>
      <div className="modal-head">
        <div>
          <h2>{entry ? 'Edit creature' : 'Add a creature'}</h2>
          <div className="tiny-label" style={{ marginTop:6 }}>Bestiary · Creature Index</div>
        </div>
        <div className="doc-code">BEST-001 · CREATURE</div>
      </div>

      <div className="field-row">
        <Field label="Name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="The Crowned Stag" /></Field>
        <Field label="Category">
          <Select value={d.category} onChange={(v) => set('category', v)} options={store.bestiaryCategories} />
        </Field>
      </div>

      <div className="field-row three">
        <Field label="Type">
          <Select value={d.entryType || d.type || ''} onChange={(v) => set('entryType', v)} options={['', ...CREATURE_TYPES]} />
        </Field>
        <Field label="Intelligence">
          <Select value={d.intelligence} onChange={(v) => set('intelligence', v)} options={['', ...INTELLIGENCE]} />
        </Field>
        <Field label="Threat level">
          <Select value={d.threatLevel} onChange={(v) => set('threatLevel', v)} options={['', ...THREAT]} />
        </Field>
      </div>

      <Field label="Habitat"><TextInput value={d.habitat} onChange={(v) => set('habitat', v)} placeholder="Forests and open plains of the imperial heartlands" /></Field>
      <Field label="In-world name / Latin equivalent (optional)">
        <TextInput value={metaDraft.latinName} onChange={(v) => setMetaDraft({...metaDraft, latinName:v})} placeholder="Cervus imperialis coronatus" />
      </Field>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v) => set('appearance', v)} rows={4} /></Field>
      <Field label="Lore"><TextArea value={d.lore} onChange={(v) => set('lore', v)} rows={4} /></Field>
      <Field label="Notable behaviors"><TextArea value={d.behaviors} onChange={(v) => set('behaviors', v)} rows={3} /></Field>
      <Field label="Connection to magic"><TextArea value={d.magicConnection} onChange={(v) => set('magicConnection', v)} rows={2} placeholder="None / Ascended-linked / Veilborn-affected / unknown" /></Field>
      <Field label="Read targets — comma separated (what should this creature evoke visually)">
        <TextInput value={metaDraft.readTargets} onChange={(v) => setMetaDraft({...metaDraft, readTargets:v})} placeholder="Regal, ancient, intimidating, symbolic" />
      </Field>
      <Field label="In-world appearances (empire symbolism, cultural references)">
        <TextArea value={metaDraft.inWorldAppearances} onChange={(v) => setMetaDraft({...metaDraft, inWorldAppearances:v})} rows={3} />
      </Field>
      <Field label="Concept image">
        <ImageSlot value={d.imageUrl || ''} onChange={(v) => set('imageUrl', v)} height={200} />
      </Field>

      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={save}>{entry ? 'Save changes' : 'Add creature'}</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Species form ──────────────────────────────────────────────────────────
function SpeciesForm({ entry, onClose, onSave }) {
  const [d, setD] = useState({ name:'', description:'', traits:'', socialStatus:'', notes:'', status:'confirmed', ...(entry||{}) });
  useEffect(() => { setD({ name:'', description:'', traits:'', socialStatus:'', notes:'', status:'confirmed', ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p => ({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head">
        <h2>{entry ? 'Edit species' : 'Add a species'}</h2>
        <div className="doc-code">BEST-001 · SPECIES</div>
      </div>
      <Field label="Species name"><TextInput value={d.name} onChange={(v) => set('name',v)} placeholder="Human" /></Field>
      <Field label="Description"><TextArea value={d.description} onChange={(v) => set('description',v)} rows={3} /></Field>
      <Field label="Traits"><TextInput value={d.traits} onChange={(v) => set('traits',v)} /></Field>
      <Field label="Social status in most kingdoms"><TextInput value={d.socialStatus} onChange={(v) => set('socialStatus',v)} /></Field>
      <Field label="Notes"><TextArea value={d.notes} onChange={(v) => set('notes',v)} rows={2} /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status==='confirmed'} onChange={(b) => set('status',b?'confirmed':'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry ? 'Save' : 'Add species'}</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
function BestiarySection() {
  const store = Ybe.useStore();
  const [view, setView] = useState('list'); // 'list' | 'dossier'
  const [listTab, setListTab] = useState('creatures');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [managingCats, setManagingCats] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const selectedEntry = selectedId ? store.bestiaryEntries.find(e => e.id === selectedId) : null;

  function openDossier(entry) { setSelectedId(entry.id); setView('dossier'); }
  function closeDossier()     { setView('list'); setSelectedId(null); }

  function saveCreature(data) {
    if (editing && editing.id) {
      Ybe.updateEntry('bestiaryEntries', editing.id, data);
      Ybe.logActivity('Bestiary', 'edited', data.name);
    } else {
      Ybe.addEntry('bestiaryEntries', data);
      Ybe.logActivity('Bestiary', 'added', data.name);
    }
    setEditing(null);
  }

  function saveSpecies(data) {
    if (editingSpecies && editingSpecies.id) {
      Ybe.updateEntry('bestiarySpecies', editingSpecies.id, data);
    } else {
      Ybe.addEntry('bestiarySpecies', data);
    }
    setEditingSpecies(null);
  }

  function confirmDelete() {
    if (!deleting) return;
    Ybe.deleteEntry(deleting.collection, deleting.entry.id);
    Ybe.logActivity('Bestiary', 'removed', deleting.entry.name);
    setDeleting(null);
  }

  const filtered = store.bestiaryEntries.filter(e => filterCat === 'all' || e.category === filterCat);

  // Dossier view — full page
  if (view === 'dossier' && selectedEntry) {
    return (
      <Section>
        <CreatureDossier
          entry={selectedEntry}
          onBack={closeDossier}
          onEdit={() => setEditing(selectedEntry)}
        />
        {editing && (
          <CreatureForm entry={editing} onClose={() => setEditing(null)} onSave={saveCreature} />
        )}
      </Section>
    );
  }

  // List view
  return (
    <Section>
      <DocHead
        kicker="Index · Fauna and Enemies"
        title="The"
        titleEm="Bestiary"
        deck="Every creature, enemy, and playable species in the world of Eravan. Click any entry to open its full dossier."
        code="BEST-001"
        codeMeta={{ species: store.bestiarySpecies.length, creatures: store.bestiaryEntries.length }}
      />

      <div className="spread" style={{ marginBottom: 18 }}>
        <nav className="tabs" role="tablist" style={{ flex: 1 }}>
          <button role="tab" aria-selected={listTab==='creatures'} onClick={() => setListTab('creatures')}>
            <span className="num">01</span>Creature Index
          </button>
          <button role="tab" aria-selected={listTab==='species'} onClick={() => setListTab('species')}>
            <span className="num">02</span>Playable Species
          </button>
        </nav>
        <div className="row">
          {listTab === 'creatures' && (
            <button className="btn ghost small" onClick={() => setManagingCats(true)}>
              <Icon name="drag" size={11}/> Categories
            </button>
          )}
          <button className="btn primary" onClick={() => listTab === 'species' ? setEditingSpecies({}) : setEditing({})}>
            <Icon name="plus" size={13}/> Add {listTab === 'species' ? 'species' : 'creature'}
          </button>
        </div>
      </div>

      {/* Creatures tab */}
      {listTab === 'creatures' && (
        <>
          {/* Category filter */}
          {store.bestiaryEntries.length > 0 && (
            <div className="creature-filter-bar">
              <button className={'filter-chip' + (filterCat==='all' ? ' active' : '')} onClick={() => setFilterCat('all')}>
                All <span>{store.bestiaryEntries.length}</span>
              </button>
              {store.bestiaryCategories.map(cat => {
                const count = store.bestiaryEntries.filter(e => e.category === cat).length;
                if (!count) return null;
                return (
                  <button key={cat} className={'filter-chip' + (filterCat===cat ? ' active' : '')} onClick={() => setFilterCat(cat)}>
                    {cat} <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              dark
              title="No creatures recorded yet."
              body="Every entry becomes a full dossier with image plates, lore, and a 3D pipeline tracker. Add the first one."
              action={<button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add the first creature</button>}
            />
          ) : (
            <div className="creature-grid">
              {filtered.map(entry => (
                <CreatureCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => openDossier(entry)}
                  onEdit={() => setEditing(entry)}
                  onDelete={() => setDeleting({ collection:'bestiaryEntries', entry })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Species tab */}
      {listTab === 'species' && (
        <>
          {store.bestiarySpecies.length === 0 ? (
            <EmptyState dark title="No species recorded yet." body="Add confirmed playable species as they are decided." action={<button className="btn primary" onClick={() => setEditingSpecies({})}><Icon name="plus" size={13}/> Add species</button>} />
          ) : (
            <div className="stack">
              {store.bestiarySpecies.map(s => (
                <div key={s.id} className="paper-card">
                  <div className="card-head">
                    <h3>{s.name}</h3>
                    <div className="row" style={{ gap:8 }}>
                      <button className="btn small on-paper" onClick={() => setEditingSpecies(s)}><Icon name="pencil" size={11}/> Edit</button>
                      <button className="btn small on-paper danger" onClick={() => setDeleting({ collection:'bestiarySpecies', entry:s })}><Icon name="trash" size={11}/></button>
                    </div>
                  </div>
                  {s.description && <p>{s.description}</p>}
                  <div className="paper-card tight" style={{ background:'var(--paper-2)', boxShadow:'none', marginTop:12 }}>
                    <div className="meta-row">
                      <div><div className="k">Traits</div><div className="v">{s.traits || '—'}</div></div>
                      <div><div className="k">Social standing</div><div className="v">{s.socialStatus || '—'}</div></div>
                    </div>
                  </div>
                  <Attrib entry={s} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Category manager */}
      {managingCats && (
        <Modal open onClose={() => setManagingCats(false)}>
          <div className="modal-head"><h2>Manage categories</h2><div className="doc-code">BEST-001</div></div>
          <RepeaterText label="Categories" items={store.bestiaryCategories} placeholder="Wild Fauna" onChange={(list) => { Ybe.setStore({ bestiaryCategories: list }); }} />
          <div className="modal-actions"><span></span><button className="btn on-paper primary" onClick={() => setManagingCats(false)}>Done</button></div>
        </Modal>
      )}

      {/* Forms */}
      {editing && <CreatureForm entry={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={saveCreature} />}
      {editingSpecies && <SpeciesForm entry={editingSpecies.id ? editingSpecies : null} onClose={() => setEditingSpecies(null)} onSave={saveSpecies} />}

      {/* Delete confirm */}
      {deleting && (
        <Modal open onClose={() => setDeleting(null)}>
          <ConfirmDialog
            title={`Remove ${deleting.entry.name}?`}
            body="This will permanently delete this entry and all associated data."
            onConfirm={confirmDelete}
            onCancel={() => setDeleting(null)}
          />
        </Modal>
      )}
    </Section>
  );
}

window.BestiarySection = BestiarySection;
