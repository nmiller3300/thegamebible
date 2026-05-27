/* Game Bible — sections/rumours.jsx — The Rumour Mill */
const Yr = window.YSTC;

const RUMOUR_SOURCES = ['Imperial Propaganda','Peasant Folklore','Noble Whispers','Veilborn Lore','Merchant Tales','Church / Clergy','Criminal Underground','Ancient Tradition'];
const SPREAD_LEVELS  = ['Whisper — very few know','Rumour — spreads in certain circles','Common knowledge — most have heard it','Imperial narrative — officially distributed'];
const SPREAD_COLOR   = { 'Whisper — very few know':'var(--ash)', 'Rumour — spreads in certain circles':'oklch(0.65 0.14 75)', 'Common knowledge — most have heard it':'var(--imperial-soft)', 'Imperial narrative — officially distributed':'var(--imperial)' };

function RumourCard({ entry, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const spreadColor = SPREAD_COLOR[entry.spread] || 'var(--ash)';
  return (
    <div className={'rumour-card paper-card' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)}>
      <div className="rumour-card-head">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--imperial)', marginBottom:5 }}>
            {entry.source || 'Unknown source'}
          </div>
          <h3 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:20, color:'var(--ink)', margin:0, lineHeight:1.2 }}>
            {entry.rumour || 'Untitled rumour'}
          </h3>
        </div>
        <div className="row" style={{ gap:8, flexShrink:0, alignItems:'flex-start' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.12em', textTransform:'uppercase', color:spreadColor, border:'1px solid '+spreadColor+'55', background:spreadColor+'11', padding:'3px 8px', borderRadius:2, whiteSpace:'nowrap' }}>
            {entry.spread ? entry.spread.split('—')[0].trim() : '—'}
          </div>
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={10}/></button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={10}/></button>
        </div>
      </div>
      {open && (
        <div className="rumour-card-body" onClick={e => e.stopPropagation()}>
          <div className="rumour-row">
            <div className="rumour-col">
              <div className="rumour-col-label">What people say</div>
              <p>{entry.rumour}</p>
            </div>
            <div className="rumour-divider">⟷</div>
            <div className="rumour-col truth">
              <div className="rumour-col-label">What is actually true</div>
              <p>{entry.truth || <span className="muted italic">No truth recorded.</span>}</p>
            </div>
          </div>
          {entry.whoBelieves && (
            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px dashed var(--rule)' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:6 }}>Who believes this</div>
              <p style={{ margin:0, color:'var(--ink-2)', fontSize:15 }}>{entry.whoBelieves}</p>
            </div>
          )}
          {entry.whyItExists && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ink-mute)', marginBottom:6 }}>Why this rumour exists</div>
              <p style={{ margin:0, color:'var(--ink-2)', fontSize:15 }}>{entry.whyItExists}</p>
            </div>
          )}
          <div style={{ marginTop:12, paddingTop:10, borderTop:'1px dashed var(--rule)' }}>
            <Attrib entry={entry} />
          </div>
        </div>
      )}
    </div>
  );
}

function RumourForm({ entry, onClose, onSave }) {
  const init = { rumour:'', truth:'', source:'', spread:'', whoBelieves:'', whyItExists:'', relatedEntry:'', status:'confirmed', ...(entry||{}) };
  const [d, setD] = useState(init);
  useEffect(() => { setD({ ...init, ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p=>({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit rumour' : 'Add a rumour'}</h2><div className="tiny-label" style={{ marginTop:6 }}>The Rumour Mill</div></div>
        <div className="doc-code">RUMOUR</div>
      </div>
      <Field label="What people say — the rumour as it circulates">
        <TextArea value={d.rumour} onChange={(v)=>set('rumour',v)} rows={3} placeholder="Killing a Crowned Stag will curse your bloodline for three generations." />
      </Field>
      <Field label="What is actually true">
        <TextArea value={d.truth} onChange={(v)=>set('truth',v)} rows={3} placeholder="There is no curse. The law against killing them is imperial, not supernatural. The myth serves the empire." />
      </Field>
      <div className="field-row">
        <Field label="Source — who spreads this">
          <Select value={d.source} onChange={(v)=>set('source',v)} options={['',...RUMOUR_SOURCES]} />
        </Field>
        <Field label="How widespread">
          <Select value={d.spread} onChange={(v)=>set('spread',v)} options={['',...SPREAD_LEVELS]} />
        </Field>
      </div>
      <Field label="Who believes it"><TextInput value={d.whoBelieves} onChange={(v)=>set('whoBelieves',v)} placeholder="Common farmers, rural villages, anyone without imperial education" /></Field>
      <Field label="Why this rumour exists — what purpose does it serve"><TextArea value={d.whyItExists} onChange={(v)=>set('whyItExists',v)} rows={2} placeholder="It keeps commoners from hunting them without needing constant enforcement." /></Field>
      <Field label="Related entry (creature, faction, character name)"><TextInput value={d.relatedEntry} onChange={(v)=>set('relatedEntry',v)} /></Field>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.rumour?.trim()} onClick={()=>onSave(d)}>{entry ? 'Save' : 'Add rumour'}</button>
        </div>
      </div>
    </Modal>
  );
}

function RumoursSection() {
  const store = Yr.useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterSource, setFilterSource] = useState('all');

  const rumours = store.rumours || [];
  const sources = [...new Set(rumours.map(r => r.source).filter(Boolean))];
  const filtered = filterSource === 'all' ? rumours : rumours.filter(r => r.source === filterSource);

  function save(data) {
    if (editing && editing.id) { Yr.updateEntry('rumours', editing.id, data); Yr.logActivity('Rumour Mill', 'edited', data.rumour?.slice(0,40)); }
    else { Yr.addEntry('rumours', data); Yr.logActivity('Rumour Mill', 'added', data.rumour?.slice(0,40)); }
    setEditing(null);
  }
  function confirmDelete() { if(!deleting)return; Yr.deleteEntry('rumours', deleting.id); setDeleting(null); }

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>World Detail · Folklore & Propaganda</div>
          <h1 className="dossier-h1">The Rumour <em>Mill</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            Every true thing in this world has a version people actually believe. These are those versions — the folklore, the propaganda, the half-truths that shape how the world thinks.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>RUMOUR-001</div>
          <div><span>entries</span>{rumours.length}</div>
        </div>
      </div>

      <div className="spread" style={{ marginBottom:22 }}>
        <div className="creature-filter-bar" style={{ margin:0, flex:1 }}>
          <button className={'filter-chip' + (filterSource==='all'?' active':'')} onClick={() => setFilterSource('all')}>
            All <span>{rumours.length}</span>
          </button>
          {sources.map(s => (
            <button key={s} className={'filter-chip' + (filterSource===s?' active':'')} onClick={() => setFilterSource(s)}>
              {s} <span>{rumours.filter(r=>r.source===s).length}</span>
            </button>
          ))}
        </div>
        <button className="btn primary" style={{ marginLeft:16, flexShrink:0 }} onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add rumour</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState dark
          title={filterSource === 'all' ? 'No rumours recorded yet.' : `No ${filterSource} rumours yet.`}
          body="What do commoners believe that isn't true? What does the empire want people to think? What do the Veilborn whisper to each other?"
          action={<button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add the first rumour</button>}
        />
      ) : (
        <div className="stack">
          {filtered.map(r => (
            <RumourCard key={r.id} entry={r}
              onEdit={(e) => { e.stopPropagation(); setEditing(r); }}
              onDelete={(e) => { e.stopPropagation(); setDeleting(r); }}
            />
          ))}
        </div>
      )}

      {editing && <RumourForm entry={editing.id?editing:null} onClose={() => setEditing(null)} onSave={save} />}
      {deleting && <Modal open onClose={() => setDeleting(null)}><ConfirmDialog title="Remove this rumour?" body="This permanently deletes it." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} /></Modal>}
    </Section>
  );
}

window.RumoursSection = RumoursSection;
