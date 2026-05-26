/* Game Bible — sections/bestiary.jsx
 * Two sub-sections: playable species + creature index.
 * Establishes the View/Edit/Add card-based pattern used by Characters,
 * Factions, and Artifacts.
 */
const Ybe = window.YSTC;

const CREATURE_TYPES = ['Beast','Undead','Construct','Unknown','Human','Magical','Other'];
const INTELLIGENCE = ['Animal','Semi-intelligent','Fully intelligent','Unknown'];
const THREAT = ['Harmless','Low','Medium','High','Legendary','Unknown'];

function BestiarySection() {
  const store = Ybe.useStore();
  const [tab, setTab] = useState('creatures');
  const [editing, setEditing] = useState(null);     // {kind: 'species'|'creature', entry}
  const [deleting, setDeleting] = useState(null);   // {collection, entry}
  const [managingCats, setManagingCats] = useState(false);

  function openAdd(kind)    { setEditing({ kind, entry: null }); }
  function openEdit(kind, entry) { setEditing({ kind, entry }); }
  function saveEntry(data) {
    const { kind, entry } = editing;
    const collection = kind === 'species' ? 'bestiarySpecies' : 'bestiaryEntries';
    if (entry) {
      Ybe.updateEntry(collection, entry.id, data);
      Ybe.logActivity('Bestiary', 'edited', data.name);
    } else {
      const saved = Ybe.addEntry(collection, data);
      Ybe.logActivity('Bestiary', 'added', saved.name);
    }
    setEditing(null);
  }
  function askDelete(kind, entry) {
    setDeleting({ collection: kind === 'species' ? 'bestiarySpecies' : 'bestiaryEntries', entry });
  }
  function confirmDelete() {
    // Clean up any attached 3D file blob before removing the entry
    const e = deleting.entry;
    if (e && e.modelFile && e.modelFile.id) {
      window.YSTC_FILES.deleteBlob(e.modelFile.id).catch(() => {});
    }
    Ybe.deleteEntry(deleting.collection, deleting.entry.id);
    Ybe.logActivity('Bestiary', 'removed', deleting.entry.name);
    setDeleting(null);
  }

  const speciesCount  = store.bestiarySpecies.length;
  const creatureCount = store.bestiaryEntries.length;

  return (
    <Section>
      <DocHead
        kicker="Index · Fauna and Enemies"
        title="The"
        titleEm="Bestiary"
        deck="Every creature, enemy, and playable species in the world of Eravan. Empty on first load — you fill it in entry by entry."
        code="BEST-001"
        codeMeta={{
          species: speciesCount,
          creatures: creatureCount,
          categories: store.bestiaryCategories.length,
        }}
      />

      <div className="spread" style={{ marginBottom: 18 }}>
        <nav className="tabs" role="tablist" style={{ flex: 1 }}>
          <button role="tab" aria-selected={tab==='creatures'} onClick={() => setTab('creatures')}>
            <span className="num">01</span>Creature Index
          </button>
          <button role="tab" aria-selected={tab==='species'} onClick={() => setTab('species')}>
            <span className="num">02</span>Playable Species
          </button>
        </nav>
        <div className="row">
          {tab === 'creatures' && (
            <button className="btn ghost small" onClick={() => setManagingCats(true)}>
              <Icon name="drag" size={11}/> Manage categories
            </button>
          )}
          <button className="btn primary" onClick={() => openAdd(tab === 'species' ? 'species' : 'creature')}>
            <Icon name="plus" size={13}/> {tab === 'species' ? 'Add species' : 'Add creature'}
          </button>
        </div>
      </div>

      {tab === 'species'
        ? <SpeciesGrid store={store} onEdit={(e) => openEdit('species', e)} onDelete={(e) => askDelete('species', e)} onAdd={() => openAdd('species')} />
        : <CreatureIndex store={store} onEdit={(e) => openEdit('creature', e)} onDelete={(e) => askDelete('creature', e)} onAdd={() => openAdd('creature')} />}

      {editing && editing.kind === 'creature' && (
        <CreatureForm
          open={true}
          entry={editing.entry}
          categories={store.bestiaryCategories}
          onClose={() => setEditing(null)}
          onSave={saveEntry}
        />
      )}
      {editing && editing.kind === 'species' && (
        <SpeciesForm
          open={true}
          entry={editing.entry}
          onClose={() => setEditing(null)}
          onSave={saveEntry}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this entry?"
        body={deleting ? `\u201C${deleting.entry.name}\u201D will be removed from the Bestiary. This cannot be undone.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />

      <CategoriesModal
        open={managingCats}
        onClose={() => setManagingCats(false)}
      />
    </Section>
  );
}

// ── Species (sub-section) ────────────────────────────────────────────────
function SpeciesGrid({ store, onEdit, onDelete, onAdd }) {
  const species = store.bestiarySpecies;
  if (species.length === 0) {
    return (
      <>
        <SectionMark>Playable species</SectionMark>
        <EmptyState
          icon="book"
          title="No playable species recorded."
          body="The brief confirms Human as the first playable species. Add it (and any others as confirmed) to populate this index. Each entry supports name, description, traits, social status, and notes."
          action={<button className="btn on-paper primary" onClick={onAdd}><Icon name="plus" size={12}/> Add the first species</button>}
        />
      </>
    );
  }
  return (
    <>
      <SectionMark>Playable species</SectionMark>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {species.map((s) => (
          <article key={s.id} className={'paper-card' + (s.status === 'pending' ? ' tbd' : '')}>
            <div className="card-head">
              <div>
                <div className="eyebrow muted">Playable species</div>
                <h3>{s.name || 'Unnamed species'}</h3>
              </div>
              <StatusPill status={s.status || 'confirmed'} />
            </div>
            {s.description ? <p>{s.description}</p> : <p className="muted italic">No description yet.</p>}
            <div className="meta-row">
              <div className="k">Traits</div>
              <div className={'v ' + (s.traits ? '' : 'empty')}>{s.traits || '—'}</div>
              <div className="k">Social standing</div>
              <div className={'v ' + (s.socialStatus ? '' : 'empty')}>{s.socialStatus || '—'}</div>
            </div>
            {s.notes ? <p style={{ fontSize: 14.5, color: 'var(--ink-mute)', fontStyle: 'italic' }}>{s.notes}</p> : null}
            <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
              <Attrib entry={s} />
              <div className="row">
                <button className="btn small on-paper" onClick={() => onEdit(s)}><Icon name="pencil" size={11}/> Edit</button>
                <button className="btn small on-paper danger" onClick={() => onDelete(s)}><Icon name="trash" size={11}/> Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function SpeciesForm({ open, entry, onClose, onSave }) {
  const [d, setD] = useState({
    name: '', description: '', traits: '', socialStatus: '', notes: '',
    status: 'confirmed', ...(entry || {}),
  });
  useEffect(() => { setD({ name:'', description:'', traits:'', socialStatus:'', notes:'', status:'confirmed', ...(entry || {}) }); }, [entry, open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div>
          <h2>{entry ? 'Edit species' : 'Add a playable species'}</h2>
          <div className="tiny-label" style={{ marginTop: 6 }}>Bestiary · species</div>
        </div>
        <div className="doc-code">BEST-001 · SPECIES</div>
      </div>

      <Field label="Species name">
        <TextInput value={d.name} onChange={(v) => setD({ ...d, name: v })} placeholder="e.g. Human" />
      </Field>
      <Field label="Description">
        <TextArea value={d.description} onChange={(v) => setD({ ...d, description: v })} rows={3}
          placeholder="A short paragraph in the world's voice." />
      </Field>
      <div className="field-row">
        <Field label="Traits">
          <TextInput value={d.traits} onChange={(v) => setD({ ...d, traits: v })} placeholder="Adaptable. Politically dominant." />
        </Field>
        <Field label="Social standing in most kingdoms">
          <TextInput value={d.socialStatus} onChange={(v) => setD({ ...d, socialStatus: v })} placeholder="Access to all social classes." />
        </Field>
      </div>
      <Field label="Notes">
        <TextArea value={d.notes} onChange={(v) => setD({ ...d, notes: v })} rows={2} placeholder="Caveats, internal references, TBD threads." />
      </Field>

      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => setD({ ...d, status: b ? 'confirmed' : 'pending' })} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name.trim()} onClick={() => onSave(d)}>
            {entry ? 'Save changes' : 'Add species'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Creature Index (sub-section) ─────────────────────────────────────────
function CreatureIndex({ store, onEdit, onDelete, onAdd }) {
  const creatures = store.bestiaryEntries;
  const [filterCat, setFilterCat] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    return creatures.filter((c) => {
      if (filterCat !== 'All' && c.category !== filterCat) return false;
      if (query && !(c.name || '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [creatures, filterCat, query]);

  const grouped = useMemo(() => {
    const g = {};
    for (const cat of store.bestiaryCategories) g[cat] = [];
    for (const c of visible) {
      if (!g[c.category]) g[c.category] = [];
      g[c.category].push(c);
    }
    return g;
  }, [visible, store.bestiaryCategories]);

  if (creatures.length === 0) {
    return (
      <>
        <SectionMark>Creature index</SectionMark>
        <EmptyState
          icon="book"
          title="No creatures recorded yet."
          body="The brief confirms a long roster across Wild Fauna, Ancient Creatures, Magic-Affected, Humanoid Enemies, and Legendary. Add them one at a time — each entry supports anatomy, habitat, intelligence, threat, lore, and an optional image placeholder for the concept reference."
          action={<button className="btn on-paper primary" onClick={onAdd}><Icon name="plus" size={12}/> Add the first creature</button>}
        />
      </>
    );
  }

  return (
    <>
      <div className="row wrap" style={{ marginTop: 4, marginBottom: 18, gap: 6 }}>
        <button
          className={'btn small ' + (filterCat === 'All' ? 'primary' : 'ghost')}
          onClick={() => setFilterCat('All')}
        >All <span style={{ opacity: 0.6, marginLeft: 6 }}>{creatures.length}</span></button>
        {store.bestiaryCategories.map((cat) => {
          const n = creatures.filter((c) => c.category === cat).length;
          return (
            <button
              key={cat}
              className={'btn small ' + (filterCat === cat ? 'primary' : 'ghost')}
              onClick={() => setFilterCat(cat)}
            >{cat} <span style={{ opacity: 0.6, marginLeft: 6 }}>{n}</span></button>
          );
        })}
        <span className="spacer" style={{ flex: 1 }}></span>
        <Field label="" >
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'oklch(0.20 0.014 60)', border: '1px solid var(--rule-dark)', color: 'var(--paper)', padding: '7px 10px', borderRadius: 2, fontFamily: 'var(--mono)', fontSize: 12, width: 220 }}
          />
        </Field>
      </div>

      {Object.entries(grouped).map(([cat, list]) => list.length === 0 ? null : (
        <div key={cat}>
          <SectionMark>{cat} <span style={{ color: 'var(--ash)', marginLeft: 8 }}>· {list.length}</span></SectionMark>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
            {list.map((c) => <CreatureCard key={c.id} creature={c} onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />)}
          </div>
        </div>
      ))}
    </>
  );
}

function CreatureCard({ creature, onEdit, onDelete }) {
  const c = creature;
  return (
    <article className={'paper-card' + (c.status === 'pending' ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">{c.category || 'Uncategorised'}</div>
          <h3>{c.name || 'Unnamed creature'}</h3>
        </div>
        <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <StatusPill status={c.status || 'confirmed'} />
          {c.modelFile && <ModelFileBadge meta={c.modelFile} />}
        </div>
      </div>
      {c.imagePlaceholderLabel ? (
        <div style={{ marginBottom: 14 }}>
          <ImageSlot label={c.imagePlaceholderLabel} height={170} />
        </div>
      ) : null}
      <div className="meta-row">
        <div className="k">Type</div>            <div className={'v ' + (c.type ? '' : 'empty')}>{c.type || '—'}</div>
        <div className="k">Habitat</div>         <div className={'v ' + (c.habitat ? '' : 'empty')}>{c.habitat || '—'}</div>
        <div className="k">Intelligence</div>    <div className={'v ' + (c.intelligence ? '' : 'empty')}>{c.intelligence || '—'}</div>
        <div className="k">Threat</div>          <div className={'v ' + (c.threatLevel ? '' : 'empty')}>{c.threatLevel || '—'}</div>
      </div>
      {c.appearance && <Field2 label="Appearance" body={c.appearance} />}
      {c.lore       && <Field2 label="Lore"       body={c.lore} />}
      {c.behaviors  && <Field2 label="Notable behaviors" body={c.behaviors} />}
      {c.magicConnection && <Field2 label="Connection to magic" body={c.magicConnection} />}
      {c.modelFile && <ModelFileDownload meta={c.modelFile} />}
      <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
        <Attrib entry={c} />
        <div className="row">
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={11}/> Delete</button>
        </div>
      </div>
    </article>
  );
}

function Field2({ label, body }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="tiny-label">{label}</div>
      <p style={{ fontSize: 15, margin: '4px 0 0' }}>{body}</p>
    </div>
  );
}
window.Field2 = Field2;

function CreatureForm({ open, entry, categories, onClose, onSave }) {
  const [d, setD] = useState({});
  useEffect(() => {
    setD({
      name: '', category: categories[0] || '', type: '', habitat: '',
      intelligence: '', threatLevel: '', appearance: '', lore: '',
      behaviors: '', magicConnection: '', imageUrl: '',
      status: 'confirmed', ...(entry || {}),
    });
  }, [entry, open, categories]);

  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }

  return (
    <Modal open={open} onClose={onClose} width="wide">
      <div className="modal-head">
        <div>
          <h2>{entry ? 'Edit creature' : 'Add a creature'}</h2>
          <div className="tiny-label" style={{ marginTop: 6 }}>Bestiary · creature index</div>
        </div>
        <div className="doc-code">BEST-001 · CREATURE</div>
      </div>

      <div className="field-row">
        <Field label="Name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="The Crowned Stag" /></Field>
        <Field label="Category"><Select value={d.category} onChange={(v) => set('category', v)} options={categories} /></Field>
      </div>
      <div className="field-row three">
        <Field label="Type"><Select value={d.type} onChange={(v) => set('type', v)} options={['', ...CREATURE_TYPES]} placeholder="—" /></Field>
        <Field label="Intelligence"><Select value={d.intelligence} onChange={(v) => set('intelligence', v)} options={['', ...INTELLIGENCE]} placeholder="—" /></Field>
        <Field label="Threat level"><Select value={d.threatLevel} onChange={(v) => set('threatLevel', v)} options={['', ...THREAT]} placeholder="—" /></Field>
      </div>
      <Field label="Habitat"><TextInput value={d.habitat} onChange={(v) => set('habitat', v)} placeholder="Forests and open plains of the imperial heartlands" /></Field>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v) => set('appearance', v)} rows={3} /></Field>
      <Field label="Lore"><TextArea value={d.lore} onChange={(v) => set('lore', v)} rows={3} /></Field>
      <Field label="Notable behaviors"><TextArea value={d.behaviors} onChange={(v) => set('behaviors', v)} rows={2} /></Field>
      <Field label="Connection to magic"><TextArea value={d.magicConnection} onChange={(v) => set('magicConnection', v)} rows={2}
        placeholder="None / Ascended-linked / Veilborn-affected / unknown" /></Field>
      <Field label="Image">
        <ImageSlot value={d.imageUrl || ''} onChange={(v) => set('imageUrl', v)} height={180} />
      </Field>

      <ModelFileSlot
        meta={d.modelFile}
        onUploaded={(meta) => set('modelFile', meta)}
        onCleared={() => set('modelFile', null)}
      />

      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>
            {entry ? 'Save changes' : 'Add creature'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Categories management modal ──────────────────────────────────────────
function CategoriesModal({ open, onClose }) {
  const store = Ybe.useStore();
  const [list, setList] = useState(store.bestiaryCategories);
  useEffect(() => { if (open) setList(store.bestiaryCategories); }, [open]);

  function set(i, v) { const next = list.slice(); next[i] = v; setList(next); }
  function add() { setList([...list, '']); }
  function remove(i) { setList(list.filter((_, idx) => idx !== i)); }
  function save() {
    const cleaned = list.map((s) => s.trim()).filter(Boolean);
    Ybe.setStore({ bestiaryCategories: cleaned });
    Ybe.logActivity('Bestiary', 'updated', 'creature categories');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="compact">
      <div className="modal-head">
        <div>
          <h2>Manage categories</h2>
          <div className="tiny-label" style={{ marginTop: 6 }}>Bestiary · categories</div>
        </div>
        <div className="doc-code">BEST-001 · CATS</div>
      </div>
      <p className="muted" style={{ marginBottom: 14 }}>Add, rename, or remove categories. Creatures keep their existing category text even if you rename here.</p>
      <RepeaterText label="Categories" items={list} placeholder="Wild Fauna" onChange={setList} />
      <div className="modal-actions">
        <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
        <button className="btn on-paper primary" onClick={save}>Save categories</button>
      </div>
    </Modal>
  );
}

window.BestiarySection = BestiarySection;
window.CreatureCard = CreatureCard;

// ── 3D model file attachment (per-creature) ──────────────────────────────
function ModelFileSlot({ meta, onUploaded, onCleared }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  const FILES = window.YSTC_FILES;

  async function ingest(file) {
    setErr('');
    if (!file) return;
    if (!FILES.isAllowed(file)) {
      setErr('Unsupported file type. Allowed: ' + FILES.EXTENSIONS.join(', ').toUpperCase());
      return;
    }
    setBusy(true);
    try {
      // If replacing, clean up the old blob.
      if (meta && meta.id) await FILES.deleteBlob(meta.id).catch(() => {});
      const newMeta = await FILES.storeFile(file, Ybe.currentDisplayName());
      onUploaded(newMeta);
      Ybe.logActivity('Bestiary', 'attached 3D file', file.name);
    } catch (e) {
      setErr(e.message || 'Could not save the file.');
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    if (meta && meta.id) await FILES.deleteBlob(meta.id).catch(() => {});
    onCleared();
  }

  function onPick(e) {
    const f = e.target.files && e.target.files[0];
    if (f) ingest(f);
    if (inputRef.current) inputRef.current.value = '';
  }
  function onDrop(e) {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) ingest(f);
  }

  if (meta) {
    return (
      <div className="field">
        <label>3D model file</label>
        <div style={{
          display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 14, alignItems: 'center',
          background: 'oklch(0.93 0.018 80 / 0.55)',
          border: '1px solid var(--rule)',
          padding: '12px 14px', borderRadius: 2,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 2,
            background: 'var(--ink)', color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600,
          }}>
            {FILES.extOf(meta.fileName).toUpperCase() || '3D'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink)' }}>
              {meta.fileName}
            </div>
            <div className="attrib" style={{ marginTop: 3 }}>
              <span>uploaded</span><b>{meta.uploadedBy || '—'}</b>
              <span className="sep">·</span>
              <span>{Ybe.formatStamp(meta.uploadedAt)}</span>
              <span className="sep">·</span>
              <span>{FILES.formatSize(meta.size)}</span>
            </div>
          </div>
          <div className="row">
            <button className="btn small on-paper" type="button" onClick={() => inputRef.current && inputRef.current.click()}>
              Replace
            </button>
            <button className="btn small on-paper danger" type="button" onClick={clear}>
              <Icon name="trash" size={11}/> Remove
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" hidden accept={FILES.ACCEPT_ATTR} onChange={onPick} />
        {err && <div style={{ color: 'var(--imperial)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>{err}</div>}
      </div>
    );
  }

  return (
    <div className="field">
      <label>3D model file <span className="muted italic" style={{ textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--serif)', fontStyle: 'italic', marginLeft: 8 }}>— optional, for White's download</span></label>
      <div
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        style={{
          padding: 22,
          background: over ? 'oklch(0.45 0.135 27 / 0.10)' : 'oklch(0.93 0.018 80 / 0.55)',
          border: '1.5px dashed ' + (over ? 'var(--imperial)' : 'var(--paper-3)'),
          borderRadius: 2,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'var(--ink-mute)',
          transition: 'background .12s, border-color .12s',
        }}
      >
        <div style={{ marginBottom: 6 }}><Icon name="drag" size={20} /></div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)' }}>
          {busy ? 'Storing…' : 'Drop a 3D model file or click to browse'}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>
          FBX · GLB · OBJ · BLEND
        </div>
      </div>
      <input ref={inputRef} type="file" hidden accept={FILES.ACCEPT_ATTR} onChange={onPick} />
      {err && <div style={{ color: 'var(--imperial)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>{err}</div>}
    </div>
  );
}

function ModelFileBadge({ meta }) {
  return (
    <span
      className="status-pill"
      title={meta.fileName}
      style={{
        color: 'var(--paper)',
        background: 'var(--ink)',
        borderColor: 'var(--ink)',
      }}
    >
      <Icon name="drag" size={10} />
      {window.YSTC_FILES.extOf(meta.fileName).toUpperCase() || '3D'}
    </span>
  );
}

function ModelFileDownload({ meta }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function dl() {
    setErr(''); setBusy(true);
    try {
      await window.YSTC_FILES.downloadStored(meta);
      Ybe.logActivity('Bestiary', 'downloaded 3D file', meta.fileName);
    } catch (e) {
      setErr(e.message || 'Download failed.');
    } finally { setBusy(false); }
  }
  return (
    <div style={{
      marginTop: 12,
      padding: '12px 14px',
      background: 'oklch(0.86 0.025 78)',
      border: '1px solid var(--rule)',
      borderRadius: 2,
      display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 2,
        background: 'var(--ink)', color: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', fontWeight: 600,
      }}>
        {window.YSTC_FILES.extOf(meta.fileName).toUpperCase() || '3D'}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="tiny-label">3D model · attached</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {meta.fileName}
        </div>
        <div className="attrib" style={{ marginTop: 2 }}>
          <span>{window.YSTC_FILES.formatSize(meta.size)}</span>
          <span className="sep">·</span>
          <b>{meta.uploadedBy}</b>
          <span className="sep">·</span>
          <span>{Ybe.formatStamp(meta.uploadedAt)}</span>
        </div>
        {err && <div style={{ color: 'var(--imperial)', fontFamily: 'var(--mono)', fontSize: 11, marginTop: 4 }}>{err}</div>}
      </div>
      <button className="btn on-paper primary" onClick={dl} disabled={busy}>
        <Icon name="out" size={12} style={{ transform: 'rotate(180deg)' }}/> {busy ? 'Preparing…' : 'Download'}
      </button>
    </div>
  );
}

window.ModelFileSlot = ModelFileSlot;
window.ModelFileBadge = ModelFileBadge;
window.ModelFileDownload = ModelFileDownload;
