/* Game Bible — sections/calendar.jsx — Seasonal Calendar */
const Ycal = window.YSTC;

const SEASONS = [
  { id:'spring', name:'Spring',  latin:'Ver',      color:'oklch(0.62 0.12 145)', icon:'🌱' },
  { id:'summer', name:'Summer',  latin:'Aestas',   color:'oklch(0.65 0.14 75)',  icon:'☀️' },
  { id:'autumn', name:'Autumn',  latin:'Autumnus', color:'oklch(0.62 0.14 45)',  icon:'🍂' },
  { id:'winter', name:'Winter',  latin:'Hiems',    color:'oklch(0.60 0.06 220)', icon:'❄️' },
];
const CATEGORIES = ['Nature & Environment','Political Events','Creature Behaviour','Society & Culture','Player Opportunities','Dangers'];

function CalendarSection() {
  const store = Ycal.useStore();
  const [activeSeason, setActiveSeason] = useState('spring');
  const [activeCategory, setActiveCategory] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const entries = store.calendarEntries || [];
  const season = SEASONS.find(s => s.id === activeSeason);
  const seasonEntries = entries.filter(e => e.season === activeSeason);
  const filtered = activeCategory === 'all' ? seasonEntries : seasonEntries.filter(e => e.category === activeCategory);

  function save(data) {
    if (editing && editing.id) { Ycal.updateEntry('calendarEntries', editing.id, data); Ycal.logActivity('Calendar', 'edited', data.title); }
    else { Ycal.addEntry('calendarEntries', { ...data, season: activeSeason }); Ycal.logActivity('Calendar', 'added', data.title); }
    setEditing(null);
  }
  function confirmDelete() { if(!deleting)return; Ycal.deleteEntry('calendarEntries', deleting.id); setDeleting(null); }

  return (
    <Section>
      <div className="dossier-title-block" style={{ paddingTop:0 }}>
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>World Detail · Time and Season</div>
          <h1 className="dossier-h1">Seasonal <em>Calendar</em></h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:14, fontSize:17, maxWidth:'55ch' }}>
            Eravan changes with the seasons. Creatures migrate, factions move, festivals shift the political mood, and the world tells a different story depending on when the player arrives.
          </p>
        </div>
        <div className="dossier-ids">
          <div><span>doc</span>CAL-001</div>
          <div><span>entries</span>{entries.length}</div>
        </div>
      </div>

      {/* Season selector — the four seasons as large tabs */}
      <div className="season-selector">
        {SEASONS.map(s => {
          const count = entries.filter(e => e.season === s.id).length;
          return (
            <button key={s.id} className={'season-tab' + (activeSeason===s.id?' active':'')}
              style={{ '--sc': s.color }}
              onClick={() => { setActiveSeason(s.id); setActiveCategory('all'); }}
            >
              <div className="season-tab-name">{s.name}</div>
              <div className="season-tab-latin">{s.latin}</div>
              {count > 0 && <div className="season-tab-count">{count}</div>}
            </button>
          );
        })}
      </div>

      {/* Active season header */}
      <div className="season-header" style={{ borderColor: season.color + '44' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color: season.color, marginBottom:8 }}>
          {season.name} · {season.latin}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="creature-filter-bar" style={{ margin:0, flex:1 }}>
            <button className={'filter-chip' + (activeCategory==='all'?' active':'')} onClick={() => setActiveCategory('all')}>All <span>{seasonEntries.length}</span></button>
            {CATEGORIES.filter(c => seasonEntries.some(e => e.category === c)).map(c => (
              <button key={c} className={'filter-chip' + (activeCategory===c?' active':'')} onClick={() => setActiveCategory(c)}>
                {c} <span>{seasonEntries.filter(e=>e.category===c).length}</span>
              </button>
            ))}
          </div>
          <button className="btn primary small" style={{ marginLeft:16, flexShrink:0 }} onClick={() => setEditing({})}><Icon name="plus" size={11}/> Add entry</button>
        </div>
      </div>

      {/* Entries grid */}
      {filtered.length === 0 ? (
        <EmptyState dark
          title={`Nothing recorded for ${season.name} yet.`}
          body={`What changes in ${season.name}? Which creatures appear or disappear? What does the empire do? What opportunities open up for the player?`}
          action={<button className="btn primary" onClick={() => setEditing({})}><Icon name="plus" size={13}/> Add a {season.name} entry</button>}
        />
      ) : (
        <div className="calendar-grid">
          {filtered.map(e => (
            <div key={e.id} className="calendar-entry paper-card" style={{ '--sc': season.color }}>
              <div className="card-head">
                <div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color: season.color, marginBottom:5 }}>{e.category || '—'}</div>
                  <h3 style={{ fontFamily:'var(--serif)', fontWeight:600, fontSize:17, margin:0, lineHeight:1.2, color:'var(--ink)' }}>{e.title}</h3>
                </div>
                <div className="row" style={{ gap:6, flexShrink:0 }}>
                  <button className="btn small on-paper" onClick={() => setEditing(e)}><Icon name="pencil" size={10}/></button>
                  <button className="btn small on-paper danger" onClick={() => setDeleting(e)}><Icon name="trash" size={10}/></button>
                </div>
              </div>
              {e.content && <p style={{ margin:0, color:'var(--ink-2)', fontSize:15, lineHeight:1.65 }}>{e.content}</p>}
              {e.playerHook && (
                <div style={{ marginTop:12, padding:'10px 14px', background:'var(--paper-2)', borderRadius:2, borderLeft:'2px solid '+season.color }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color: season.color, marginBottom:4 }}>Player hook</div>
                  <p style={{ margin:0, color:'var(--ink-2)', fontSize:14 }}>{e.playerHook}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Year at a glance — overview strip */}
      {entries.length > 0 && (
        <>
          <div className="section-mark" style={{ marginTop:40 }}>Year at a glance</div>
          <div className="season-overview">
            {SEASONS.map(s => {
              const se = entries.filter(e => e.season === s.id);
              return (
                <div key={s.id} className="season-overview-col" style={{ '--sc': s.color }}>
                  <div className="season-overview-head">{s.name}</div>
                  {se.length === 0
                    ? <div style={{ fontStyle:'italic', color:'var(--ash)', fontSize:13 }}>Nothing recorded</div>
                    : se.map(e => (
                        <div key={e.id} className="season-overview-item">
                          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color: s.color, marginBottom:2 }}>{e.category?.split(' ')[0]}</div>
                          <div style={{ fontSize:13, color:'var(--paper)', lineHeight:1.4 }}>{e.title}</div>
                        </div>
                      ))
                  }
                </div>
              );
            })}
          </div>
        </>
      )}

      {editing && <CalendarEntryForm entry={editing.id?editing:null} season={activeSeason} onClose={() => setEditing(null)} onSave={save} />}
      {deleting && <ConfirmDialog title="Remove this entry?" body="This permanently deletes it." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </Section>
  );
}

function CalendarEntryForm({ entry, season, onClose, onSave }) {
  const s = SEASONS.find(s => s.id === (entry?.season || season));
  const [d, setD] = useState({ title:'', category:'', content:'', playerHook:'', season: season, ...(entry||{}) });
  useEffect(() => { setD({ title:'', category:'', content:'', playerHook:'', season: season, ...(entry||{}) }); }, [entry]);
  function set(k,v) { setD(p=>({...p,[k]:v})); }
  return (
    <Modal open onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit entry' : `Add to ${s?.name || 'season'}`}</h2><div className="tiny-label" style={{ marginTop:6 }}>Seasonal Calendar</div></div>
        <div className="doc-code">CAL-001</div>
      </div>
      <div className="field-row">
        <Field label="Season"><Select value={d.season} onChange={(v)=>set('season',v)} options={SEASONS.map(s=>s.id)} /></Field>
        <Field label="Category"><Select value={d.category} onChange={(v)=>set('category',v)} options={['',...CATEGORIES]} /></Field>
      </div>
      <Field label="Title"><TextInput value={d.title} onChange={(v)=>set('title',v)} placeholder="The Crowned Stag rutting season begins" /></Field>
      <Field label="What happens"><TextArea value={d.content} onChange={(v)=>set('content',v)} rows={4} placeholder="Describe what this means for the world — who is affected, what changes, what the player sees and hears." /></Field>
      <Field label="Player hook — how does this become relevant to them"><TextArea value={d.playerHook} onChange={(v)=>set('playerHook',v)} rows={2} placeholder="Lords pay well for Stag sightings during this season. Hunters are illegal but the coin is real." /></Field>
      <div className="modal-actions">
        <span></span>
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.title?.trim()} onClick={()=>onSave(d)}>{entry ? 'Save' : 'Add entry'}</button>
        </div>
      </div>
    </Modal>
  );
}

window.CalendarSection = CalendarSection;
