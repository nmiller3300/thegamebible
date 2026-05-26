/* Game Bible — sections/characters.jsx */
const Yc = window.YSTC;

const CHAR_ROLES = ['Merchant','Guard','Noble','Peasant','Mage','Soldier','Clergy','Smith','Innkeeper','Bandit','Spy','Other'];
const MAGIC_STATUS = ['None','Ascended','Veilborn','Unknown'];

function CharactersSection() {
  const store = Yc.useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editingArchetype, setEditingArchetype] = useState(null);
  const [archModalOpen, setArchModalOpen] = useState(false);

  function saveChar(data) {
    if (editing) {
      Yc.updateEntry('characters', editing.id, data);
      Yc.logActivity('Characters', 'edited', data.name);
    } else {
      const saved = Yc.addEntry('characters', data);
      Yc.logActivity('Characters', 'added', saved.name);
    }
    setEditing(null);
  }

  return (
    <Section>
      <DocHead
        kicker="Index · People of the world"
        title="Characters &"
        titleEm="NPCs"
        deck="Named NPCs, faction leaders, notable persons. Every entry can carry a reputation modifier and a quest hook for design and tracking."
        code="CHAR-001"
        codeMeta={{ characters: store.characters.length, archetypes: store.npcArchetypes.length }}
      />

      <SectionMark>Archetype reference</SectionMark>
      <div className="spread" style={{ marginBottom: 14 }}>
        <span className="muted-dark italic" style={{ fontSize: 15 }}>Recurring NPC patterns the team draws from. Editable.</span>
        <button className="btn ghost small" onClick={() => setArchModalOpen(true)}>
          <Icon name="pencil" size={11}/> Edit archetypes
        </button>
      </div>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 28 }}>
        {store.npcArchetypes.map((a) => (
          <div key={a.id} className="paper-card tight">
            <h4 style={{ fontStyle: 'italic', fontWeight: 500 }}>{a.name}</h4>
            <p style={{ fontSize: 14, color: 'var(--ink-mute)', margin: 0 }}>{a.description}</p>
          </div>
        ))}
      </div>

      <div className="spread" style={{ marginBottom: 18 }}>
        <SectionMark>Character entries</SectionMark>
        <button className="btn primary" onClick={() => setEditing({})}>
          <Icon name="plus" size={13}/> Add character
        </button>
      </div>

      {store.characters.length === 0 ? (
        <EmptyState
          icon="eye"
          title="No characters recorded yet."
          body="Add the empire's notable persons one at a time. Each card supports motivation, secret, reputation modifier, quest hook, magic status, and an optional image placeholder."
          action={<button className="btn on-paper primary" onClick={() => setEditing({})}><Icon name="plus" size={12}/> Add the first character</button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
          {store.characters.map((c) => <CharacterCard key={c.id} c={c} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />)}
        </div>
      )}

      {editing !== null && (
        <CharacterForm
          open={true}
          entry={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={saveChar}
        />
      )}

      <ArchetypesModal
        open={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this character?"
        body={deleting ? `\u201C${deleting.name}\u201D will be removed.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          Yc.deleteEntry('characters', deleting.id);
          Yc.logActivity('Characters', 'removed', deleting.name);
          setDeleting(null);
        }}
      />
    </Section>
  );
}

function CharacterCard({ c, onEdit, onDelete }) {
  return (
    <article className={'paper-card' + (c.status === 'pending' ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">{c.role || 'Person'}{c.location ? ' · ' + c.location : ''}</div>
          <h3>{c.name || 'Unnamed character'}</h3>
        </div>
        <StatusPill status={c.status || 'confirmed'} />
      </div>
      <div style={{ marginBottom: 14 }}><ImageSlot value={c.imageUrl || ''} onChange={(url) => { Yc.updateEntry('characters', c.id, {imageUrl: url}); }} height={170} /></div>
      <div className="meta-row">
        <div className="k">Faction</div>      <div className={'v ' + (c.factionAlignment ? '' : 'empty')}>{c.factionAlignment || '—'}</div>
        <div className="k">Class standing</div><div className={'v ' + (c.classStanding ? '' : 'empty')}>{c.classStanding || '—'}</div>
        <div className="k">Magic status</div> <div className={'v ' + (c.magicStatus ? '' : 'empty')}>{c.magicStatus || '—'}</div>
        <div className="k">Reputation mod</div><div className={'v ' + (c.reputationModifier ? '' : 'empty')}>{c.reputationModifier || '—'}</div>
      </div>
      {c.appearance && <Field2 label="Appearance" body={c.appearance} />}
      {c.personality && <Field2 label="Personality" body={c.personality} />}
      {c.motivation && <Field2 label="Motivation" body={c.motivation} />}
      {c.secret && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'oklch(0.45 0.135 27 / 0.07)', borderLeft: '2px solid var(--imperial)' }}>
          <div className="tiny-label" style={{ color: 'var(--imperial)' }}>Secret · internal</div>
          <p style={{ fontSize: 14.5, margin: '4px 0 0', color: 'var(--ink)' }}>{c.secret}</p>
        </div>
      )}
      {c.questHook && <Field2 label="Quest hook" body={c.questHook} />}
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

function CharacterForm({ open, entry, onClose, onSave }) {
  const [d, setD] = useState({});
  useEffect(() => {
    setD({
      name:'', role:'', location:'', factionAlignment:'', classStanding:'', magicStatus:'',
      appearance:'', personality:'', motivation:'', secret:'', reputationModifier:'',
      questHook:'', notes:'', imageUrl:'', status:'confirmed', ...(entry || {}),
    });
  }, [entry, open]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={open} onClose={onClose} width="wide">
      <div className="modal-head">
        <div>
          <h2>{entry ? 'Edit character' : 'Add a character'}</h2>
          <div className="tiny-label" style={{ marginTop: 6 }}>Characters · named person</div>
        </div>
        <div className="doc-code">CHAR-001 · ENTRY</div>
      </div>
      <div className="field-row">
        <Field label="Name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="Cassiana Vell" /></Field>
        <Field label="Role"><Select value={d.role} onChange={(v) => set('role', v)} options={['', ...CHAR_ROLES]} placeholder="—" /></Field>
      </div>
      <div className="field-row">
        <Field label="Location"><TextInput value={d.location} onChange={(v) => set('location', v)} /></Field>
        <Field label="Faction alignment"><TextInput value={d.factionAlignment} onChange={(v) => set('factionAlignment', v)} /></Field>
      </div>
      <div className="field-row three">
        <Field label="Class standing"><TextInput value={d.classStanding} onChange={(v) => set('classStanding', v)} placeholder="Minor noble" /></Field>
        <Field label="Magic status"><Select value={d.magicStatus} onChange={(v) => set('magicStatus', v)} options={['', ...MAGIC_STATUS]} placeholder="—" /></Field>
        <Field label="Reputation modifier"><TextInput value={d.reputationModifier} onChange={(v) => set('reputationModifier', v)} placeholder="+2 nobles · −2 peasants" /></Field>
      </div>
      <Field label="Appearance"><TextArea value={d.appearance} onChange={(v) => set('appearance', v)} rows={2} /></Field>
      <Field label="Personality (2 to 3 words)"><TextInput value={d.personality} onChange={(v) => set('personality', v)} placeholder="Cold, patient, hungry" /></Field>
      <Field label="Motivation"><TextArea value={d.motivation} onChange={(v) => set('motivation', v)} rows={2} /></Field>
      <Field label="Secret" hint="Visible only inside this document.">
        <TextArea value={d.secret} onChange={(v) => set('secret', v)} rows={2} />
      </Field>
      <Field label="Quest hook"><TextArea value={d.questHook} onChange={(v) => set('questHook', v)} rows={2} /></Field>
      <Field label="Notes"><TextArea value={d.notes} onChange={(v) => set('notes', v)} rows={2} /></Field>
      <Field label="Image"><ImageSlot value={d.imageUrl || ''} onChange={(v) => set('imageUrl', v)} height={180} /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Add character'}</button>
        </div>
      </div>
    </Modal>
  );
}

function ArchetypesModal({ open, onClose }) {
  const store = Yc.useStore();
  const [list, setList] = useState(store.npcArchetypes);
  useEffect(() => { if (open) setList(store.npcArchetypes); }, [open]);
  function setRow(i, k, v) { const next = list.slice(); next[i] = { ...next[i], [k]: v }; setList(next); }
  function add() { setList([...list, { id: Yc.uid(), name:'', description:'' }]); }
  function remove(i) { setList(list.filter((_, idx) => idx !== i)); }
  function save() {
    Yc.setStore({ npcArchetypes: list.filter((r) => r.name.trim()) });
    Yc.logActivity('Characters', 'updated', 'NPC archetype reference');
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div><h2>Edit NPC archetypes</h2><div className="tiny-label" style={{ marginTop:6 }}>Recurring patterns</div></div>
        <div className="doc-code">CHAR-001 · ARCH</div>
      </div>
      <div className="stack-sm">
        {list.map((a, i) => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
            <input type="text" value={a.name} placeholder="The Desperate Farmer" onChange={(e) => setRow(i, 'name', e.target.value)} />
            <input type="text" value={a.description} placeholder="Description" onChange={(e) => setRow(i, 'description', e.target.value)} />
            <button className="btn on-paper small danger" onClick={() => remove(i)}>Remove</button>
          </div>
        ))}
        <button className="btn on-paper small" onClick={add}><Icon name="plus" size={11}/> Add archetype</button>
      </div>
      <div className="modal-actions">
        <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
        <button className="btn on-paper primary" onClick={save}>Save archetypes</button>
      </div>
    </Modal>
  );
}

window.CharactersSection = CharactersSection;
