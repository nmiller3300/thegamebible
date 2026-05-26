/* Game Bible — sections/dashboard.jsx — Intelligence Hub */
const Yd = window.YSTC;

function Dashboard({ navigate }) {
  const store = Yd.useStore();
  const recent = store.activity.slice(0, 15);
  const openThreads = store.forumThreads.filter(t => t.status === 'open' && !store.forumReplies.some(r => r.threadId === t.id));

  const sections = [
    { code:'BEST-001', name:'Bestiary',            key:'bestiary',   count: store.bestiaryEntries.length + store.bestiarySpecies.length,  unit:'entries',   icon:'shield' },
    { code:'CHAR-001', name:'Characters & NPCs',   key:'characters', count: store.characters.length,      unit:'characters', icon:'user' },
    { code:'FACT-001', name:'Factions & Politics', key:'factions',   count: store.factions.length,        unit:'factions',   icon:'flag' },
    { code:'MAGIC-001',name:'Magic System',        key:'magic',      count: store.magicEntries.length,    unit:'blocks',     icon:'star' },
    { code:'WORLD-001',name:'World & Geography',   key:'world',      count: store.worldRegions.length,    unit:'regions',    icon:'globe' },
    { code:'LORE-001', name:'Lore & History',      key:'lore',       count: store.loreEras.length + store.loreEvents.length, unit:'records', icon:'book' },
    { code:'ECON-001', name:'Economy & Trade',     key:'economy',    count: store.economyEntries.length,  unit:'entries',    icon:'coins' },
    { code:'WAR-001',  name:'Military & Warfare',  key:'military',   count: store.militaryStructure.length, unit:'ranks',   icon:'sword' },
    { code:'SOC-001',  name:'Society & Reputation',key:'society',    count: store.socialClasses.length,   unit:'classes',    icon:'scale' },
    { code:'RELIC-001',name:'Artifacts & Relics',  key:'artifacts',  count: store.artifacts.length,       unit:'entries',    icon:'gem' },
    { code:'DEV-001',  name:'Dev Log',             key:'devlog',     count: store.devLog.length,          unit:'entries',    icon:'list' },
    { code:'FORUM-001',name:'The Forum',           key:'forum',      count: store.forumThreads.length,    unit:'threads',    icon:'chat' },
  ];

  const totalEntries = store.bestiaryEntries.length + store.characters.length + store.factions.length + store.artifacts.length;

  return (
    <Section>
      <div className="dash-head">
        <div>
          <div className="dossier-kicker"><span className="dossier-kicker-bar"></span>Studio · Intelligence Hub</div>
          <h1 className="dossier-h1" style={{ fontSize:'clamp(38px, 4.5vw, 56px)' }}>
            Today at <em>{store.projectSettings.projectName}</em>
          </h1>
          <p style={{ color:'var(--ash)', fontStyle:'italic', marginTop:10, fontSize:16 }}>
            A working surface for two creators. Everything from here is the world.
          </p>
        </div>
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-n">{totalEntries}</div>
            <div className="dash-stat-l">Total entries</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-n">{store.forumThreads.filter(t=>t.status==='open').length}</div>
            <div className="dash-stat-l">Open threads</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-n" style={{ color: store.projectSettings.mapStatus==='uploaded' ? 'var(--moss)' : 'var(--imperial-soft)' }}>
              {store.projectSettings.mapStatus === 'uploaded' ? '✓' : '○'}
            </div>
            <div className="dash-stat-l">Map status</div>
          </div>
        </div>
      </div>

      <div className="dash-layout">
        {/* Left — activity + threads */}
        <div className="dash-left">
          <div className="paper-card" style={{ marginBottom:22 }}>
            <div className="dash-card-head">
              <div className="eyebrow">Recent dispatches</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', color:'var(--ink-mute)', textTransform:'uppercase' }}>Last 15</div>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding:'24px 0', textAlign:'center', color:'var(--ink-mute)', fontStyle:'italic', fontSize:15 }}>
                Nothing has happened yet. Every action logged here, in real time.
              </div>
            ) : (
              <div className="activity-list">
                {recent.map(a => (
                  <div key={a.id} className="activity-row">
                    <span className="when">{Yd.relativeStamp(a.when || a.happenedAt)}</span>
                    <span className="what"><b>{a.who}</b> {a.action} <em>{a.what}</em></span>
                    <span className="tag">{a.section}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {openThreads.length > 0 && (
            <div className="paper-card">
              <div className="dash-card-head">
                <div className="eyebrow" style={{ color:'var(--imperial)' }}>Awaiting reply</div>
                <button className="btn on-paper small" onClick={() => navigate('forum')}>Open forum</button>
              </div>
              {openThreads.slice(0,3).map(t => (
                <div key={t.id} className="dash-thread-row" onClick={() => navigate('forum/' + t.id)}>
                  <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17, color:'var(--ink)', marginBottom:4 }}>{t.title}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'0.1em', color:'var(--ink-mute)', textTransform:'uppercase' }}>
                    {t.author_display_name || t.authorDisplayName} · {Yd.relativeStamp(t.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — map status + section grid */}
        <div className="dash-right">
          {store.projectSettings.mapStatus !== 'uploaded' && (
            <div className="dash-map-status">
              <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--imperial)', marginBottom:10 }}>Field operation · Pending</div>
              <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, color:'var(--paper)', marginBottom:6 }}>Awaiting White's map</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', color:'var(--ash)' }}>World & Geography opens when the map is uploaded.</div>
            </div>
          )}
        </div>
      </div>

      <div className="section-mark" style={{ margin:'32px 0 22px' }}>Section Status</div>
      <div className="section-grid">
        {sections.map(s => (
          <div key={s.code} className="tile" onClick={() => navigate(s.key)}>
            <div className="code">{s.code}</div>
            <div className="name">{s.name}</div>
            <div className="count">
              <b>{s.count}</b> {s.unit}
            </div>
            <div className="state" style={{ color: s.count > 0 ? 'var(--moss)' : 'var(--ink-mute)' }}>
              {s.count > 0 ? '● Active' : '○ Empty'}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

window.Dashboard = Dashboard;
