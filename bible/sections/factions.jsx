/* Game Bible — sections/factions.jsx */
const Yf = window.YSTC;

const FACTION_TYPES = ['Kingdom','Empire','City-State','Tribe','Cult','Guild','Noble House','Other'];
const MILITARY_STRENGTH = ['Weak','Moderate','Strong','Dominant'];

const TAB_FILTERS = {
  major:   { label: 'Kingdoms & Major Factions', types: ['Kingdom','Empire','City-State','Tribe','Other'] },
  houses:  { label: 'Noble Houses',              types: ['Noble House'] },
  guilds:  { label: 'Guilds & Organizations',    types: ['Guild','Cult'] },
};

function FactionsSection() {
  const store = Yf.useStore();
  const [tab, setTab] = useState('major');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [tensionEditing, setTensionEditing] = useState(null);
  const [tensionDeleting, setTensionDeleting] = useState(null);
  const [bannerOn, setBannerOn] = useState(true);

  function saveFaction(data) {
    if (editing) {
      Yf.updateEntry('factions', editing.id, data);
      Yf.logActivity('Factions', 'edited', data.name);
    } else {
      const saved = Yf.addEntry('factions', data);
      Yf.logActivity('Factions', 'added', saved.name);
    }
    setEditing(null);
  }
  function saveTension(data) {
    if (tensionEditing) {
      Yf.updateEntry('factionTensions', tensionEditing.id, data);
      Yf.logActivity('Factions', 'edited tension', data.title);
    } else {
      const saved = Yf.addEntry('factionTensions', data);
      Yf.logActivity('Factions', 'added tension', saved.title);
    }
    setTensionEditing(null);
  }

  const showBanner = bannerOn && store.factions.length === 0 && store.factionTensions.length === 0;

  let entries = tab === 'tensions'
    ? store.factionTensions
    : store.factions.filter((f) => TAB_FILTERS[tab].types.includes(f.factionType));

  return (
    <Section>
      <DocHead
        kicker="Index · Power and politics"
        title="Factions &"
        titleEm="Politics"
        deck="One dominant empire, slowly fracturing. Every faction in this index exists inside that reality. What's true on any given line can change as the project develops."
        code="FACT-001"
        codeMeta={{ factions: store.factions.length, tensions: store.factionTensions.length }}
      />

      {showBanner && (
        <TbdBanner
          message="All names in this section are currently pending development decisions. This banner dismisses automatically once entries are present."
          onDismiss={() => setBannerOn(false)}
        />
      )}

      <div className="spread" style={{ marginBottom: 18 }}>
        <nav className="tabs" role="tablist" style={{ flex: 1 }}>
          {Object.entries(TAB_FILTERS).map(([k, v], i) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
              <span className="num">{String(i+1).padStart(2,'0')}</span>{v.label}
            </button>
          ))}
          <button role="tab" aria-selected={tab === 'tensions'} onClick={() => setTab('tensions')}>
            <span className="num">04</span>Current Political Tensions
          </button>
        </nav>
        <div className="row">
          {tab === 'tensions'
            ? <button className="btn primary" onClick={() => setTensionEditing({})}><Icon name="plus" size={13}/> Add tension</button>
            : <button className="btn primary" onClick={() => setEditing({ factionType: TAB_FILTERS[tab].types[0] })}>
                <Icon name="plus" size={13}/> Add {tab === 'houses' ? 'noble house' : tab === 'guilds' ? 'guild' : 'faction'}
              </button>}
        </div>
      </div>

      {tab === 'tensions'
        ? entries.length === 0
            ? <EmptyState icon="flag" title="No political tensions recorded." body="Tensions are short briefs on what is currently boiling: who is pushing on whom, what could tip, who would be blamed." action={<button className="btn on-paper primary" onClick={() => setTensionEditing({})}><Icon name="plus" size={12}/> Record a tension</button>} />
            : (
              <div className="stack">
                {entries.map((t) => (
                  <article key={t.id} className={'paper-card' + (t.status === 'pending' ? ' tbd' : '')}>
                    <div className="card-head">
                      <div>
                        <div className="eyebrow muted">Tension · between parties</div>
                        <h3>{t.title}</h3>
                      </div>
                      <StatusPill status={t.status || 'confirmed'} />
                    </div>
                    <div className="meta-row">
                      <div className="k">Parties</div><div className="v">{t.parties || '\u2014'}</div>
                    </div>
                    {t.summary && <Field2 label="Summary" body={t.summary} />}
                    <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
                      <Attrib entry={t} />
                      <div className="row">
                        <button className="btn small on-paper" onClick={() => setTensionEditing(t)}><Icon name="pencil" size={11}/> Edit</button>
                        <button className="btn small on-paper danger" onClick={() => setTensionDeleting(t)}><Icon name="trash" size={11}/> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
        : entries.length === 0
            ? <EmptyState icon="flag" title={`No ${tab === 'houses' ? 'noble houses' : tab === 'guilds' ? 'guilds or organizations' : 'kingdoms or factions'} yet.`} body="Each entry supports leader, capital, region, military strength, allies, enemies, economy, reputation, and a hidden agenda visible only inside this document." action={<button className="btn on-paper primary" onClick={() => setEditing({ factionType: TAB_FILTERS[tab].types[0] })}><Icon name="plus" size={12}/> Add the first entry</button>} />
            : (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                {entries.map((f) => <FactionCard key={f.id} f={f} onEdit={() => setEditing(f)} onDelete={() => setDeleting(f)} />)}
              </div>
            )
      }

      {editing !== null && (
        <FactionForm open={true} entry={editing.id ? editing : null} initial={editing} onClose={() => setEditing(null)} onSave={saveFaction} />
      )}
      {tensionEditing !== null && (
        <TensionForm open={true} entry={tensionEditing.id ? tensionEditing : null} onClose={() => setTensionEditing(null)} onSave={saveTension} />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this faction?"
        body={deleting ? `\u201C${deleting.name}\u201D will be removed.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { Yf.deleteEntry('factions', deleting.id); Yf.logActivity('Factions', 'removed', deleting.name); setDeleting(null); }}
      />
      <ConfirmDialog
        open={!!tensionDeleting}
        title="Delete this tension?"
        body={tensionDeleting ? `\u201C${tensionDeleting.title}\u201D will be removed.` : ''}
        onCancel={() => setTensionDeleting(null)}
        onConfirm={() => { Yf.deleteEntry('factionTensions', tensionDeleting.id); Yf.logActivity('Factions', 'removed tension', tensionDeleting.title); setTensionDeleting(null); }}
      />
    </Section>
  );
}

function FactionCard({ f, onEdit, onDelete }) {
  return (
    <article className={'paper-card' + (f.status === 'pending' ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">{f.factionType || 'Faction'}{f.region ? ' \u00b7 ' + f.region : ''}</div>
          <h3>{f.name || 'Unnamed faction'}</h3>
        </div>
        <StatusPill status={f.status || 'confirmed'} />
      </div>
      <div className="meta-row">
        <div className="k">Leader</div>   <div className={'v ' + (f.leader ? '' : 'empty')}>{f.leader || '\u2014'}</div>
        <div className="k">Capital</div>  <div className={'v ' + (f.capital ? '' : 'empty')}>{f.capital || '\u2014'}</div>
        <div className="k">Military</div> <div className={'v ' + (f.militaryStrength ? '' : 'empty')}>{f.militaryStrength || '\u2014'}</div>
        <div className="k">Reputation</div><div className={'v ' + (f.reputation ? '' : 'empty')}>{f.reputation || '\u2014'}</div>
      </div>
      {f.allies   && <Field2 label="Allies" body={f.allies} />}
      {f.enemies  && <Field2 label="Enemies" body={f.enemies} />}
      {f.economy  && <Field2 label="Economy" body={f.economy} />}
      {f.hiddenAgenda && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'oklch(0.45 0.135 27 / 0.07)', borderLeft: '2px solid var(--imperial)' }}>
          <div className="tiny-label" style={{ color: 'var(--imperial)' }}>Hidden agenda \u00b7 internal</div>
          <p style={{ fontSize: 14.5, margin: '4px 0 0', color: 'var(--ink)' }}>{f.hiddenAgenda}</p>
        </div>
      )}
      {f.notes && <Field2 label="Notes" body={f.notes} />}
      <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
        <Attrib entry={f} />
        <div className="row">
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={11}/> Delete</button>
        </div>
      </div>
    </article>
  );
}

function FactionForm({ open, entry, initial, onClose, onSave }) {
  const [d, setD] = useState({});
  useEffect(() => {
    setD({
      name:'', factionType: (initial && initial.factionType) || 'Kingdom', leader:'', capital:'', region:'',
      militaryStrength:'', allies:'', enemies:'', economy:'', reputation:'', hiddenAgenda:'',
      notes:'', status:'confirmed', ...(entry || {}),
    });
  }, [entry, open]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={open} onClose={onClose} width="wide">
      <div className="modal-head">
        <div><h2>{entry ? 'Edit faction' : 'Add a faction'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Factions \u00b7 entry</div></div>
        <div className="doc-code">FACT-001 · ENTRY</div>
      </div>
      <div className="field-row">
        <Field label="Name"><TextInput value={d.name} onChange={(v) => set('name', v)} placeholder="House of Velmar" /></Field>
        <Field label="Type"><Select value={d.factionType} onChange={(v) => set('factionType', v)} options={FACTION_TYPES} /></Field>
      </div>
      <div className="field-row three">
        <Field label="Leader"><TextInput value={d.leader} onChange={(v) => set('leader', v)} /></Field>
        <Field label="Capital city"><TextInput value={d.capital} onChange={(v) => set('capital', v)} /></Field>
        <Field label="Region"><TextInput value={d.region} onChange={(v) => set('region', v)} /></Field>
      </div>
      <div className="field-row">
        <Field label="Military strength"><Select value={d.militaryStrength} onChange={(v) => set('militaryStrength', v)} options={['', ...MILITARY_STRENGTH]} placeholder="\u2014" /></Field>
        <Field label="Reputation"><TextInput value={d.reputation} onChange={(v) => set('reputation', v)} placeholder="Feared in the heartlands, distrusted on the coast" /></Field>
      </div>
      <Field label="Allies"><TextArea value={d.allies} onChange={(v) => set('allies', v)} rows={2} /></Field>
      <Field label="Enemies"><TextArea value={d.enemies} onChange={(v) => set('enemies', v)} rows={2} /></Field>
      <Field label="Economy"><TextArea value={d.economy} onChange={(v) => set('economy', v)} rows={2} /></Field>
      <Field label="Hidden agenda" hint="Internal-only. What the faction actually wants."><TextArea value={d.hiddenAgenda} onChange={(v) => set('hiddenAgenda', v)} rows={3} /></Field>
      <Field label="Notes"><TextArea value={d.notes} onChange={(v) => set('notes', v)} rows={2} /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.name?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Add faction'}</button>
        </div>
      </div>
    </Modal>
  );
}

function TensionForm({ open, entry, onClose, onSave }) {
  const [d, setD] = useState({});
  useEffect(() => { setD({ title:'', parties:'', summary:'', status:'confirmed', ...(entry || {}) }); }, [entry, open]);
  function set(k, v) { setD((p) => ({ ...p, [k]: v })); }
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit tension' : 'Record a tension'}</h2><div className="tiny-label" style={{ marginTop:6 }}>Active political pressure</div></div>
        <div className="doc-code">FACT-001 · TENSION</div>
      </div>
      <Field label="Headline"><TextInput value={d.title} onChange={(v) => set('title', v)} placeholder="The salt road levy" /></Field>
      <Field label="Parties"><TextInput value={d.parties} onChange={(v) => set('parties', v)} placeholder="House Velmar \u00b7 Coastal Free Cities" /></Field>
      <Field label="Summary"><TextArea value={d.summary} onChange={(v) => set('summary', v)} rows={5} placeholder="What is happening, who pushes, where it can tip." /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => set('status', b ? 'confirmed' : 'pending')} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.title?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Record tension'}</button>
        </div>
      </div>
    </Modal>
  );
}

window.FactionsSection = FactionsSection;
