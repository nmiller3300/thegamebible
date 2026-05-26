/* Game Bible — sections/dashboard.jsx
 * Landing page after login: activity, open threads, section status grid.
 */
const Yd = window.YSTC;

function Dashboard({ navigate }) {
  const store = Yd.useStore();
  const recent = store.activity.slice(0, 15);

  const openThreadsNoReplies = store.forumThreads
    .filter((t) => t.status === 'open' && !store.forumReplies.some((r) => r.threadId === t.id));

  const sectionCounts = useMemo(() => ({
    'BEST-001': { name: 'Bestiary',           count: store.bestiaryEntries.length + store.bestiarySpecies.length, key: 'bestiary',  unit: 'entries' },
    'CHAR-001': { name: 'Characters & NPCs',  count: store.characters.length,                                     key: 'characters',unit: 'entries' },
    'FACT-001': { name: 'Factions & Politics',count: store.factions.length,                                       key: 'factions',  unit: 'entries' },
    'MAGIC-001':{ name: 'Magic System',       count: store.magicEntries.length,                                   key: 'magic',     unit: 'blocks'  },
    'WORLD-001':{ name: 'World & Geography',  count: store.worldRegions.length,                                   key: 'world',     unit: 'regions' },
    'LORE-001': { name: 'Lore & History',     count: store.loreEras.length + store.loreEvents.length,             key: 'lore',      unit: 'eras+events' },
    'ECON-001': { name: 'Economy & Trade',    count: store.economyEntries.length,                                 key: 'economy',   unit: 'blocks'  },
    'WAR-001':  { name: 'Military & Warfare', count: store.militaryStructure.length,                              key: 'military',  unit: 'ranks'   },
    'SOC-001':  { name: 'Society & Reputation',count: store.socialClasses.length,                                 key: 'society',   unit: 'classes' },
    'RELIC-001':{ name: 'Artifacts & Relics', count: store.artifacts.length,                                      key: 'artifacts', unit: 'entries' },
    'DEV-001':  { name: 'Dev Log',            count: store.devLog.length,                                         key: 'devlog',    unit: 'entries' },
    'FORUM-001':{ name: 'The Forum',          count: store.forumThreads.length,                                   key: 'forum',     unit: 'threads' },
  }), [store]);

  return (
    <Section>
      <DocHead
        kicker="Studio · Landing"
        title="Today at"
        titleEm={store.projectSettings.projectName}
        deck="A working surface for both creators. Everything from here on is the world."
        code="DASH-001"
        codeMeta={{
          status: 'Open',
          map: store.projectSettings.mapStatus,
          'last activity': recent[0] ? Yd.relativeStamp(recent[0].when) : 'none yet',
        }}
      />

      <div className="dashboard-grid">
        {/* Activity feed */}
        <div className="paper-card spacious">
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Recent activity</div>
              <h3>What’s been changing</h3>
            </div>
            <div className="tiny-label">last 15</div>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon="log"
              title="Nothing has happened yet."
              body="Every action across every section is logged here, attributed to the user, in real time. Once you add your first entry the feed wakes up."
            />
          ) : (
            <div className="activity-list">
              {recent.map((a) => (
                <div className="activity-row" key={a.id}>
                  <span className="when">{Yd.relativeStamp(a.when)}</span>
                  <span className="what">
                    <b>{a.who}</b> {a.action} <em>{a.what}</em>
                  </span>
                  <span className="tag">{a.section}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open threads + map status */}
        <div className="stack">
          <div className="paper-card spacious">
            <div className="card-head">
              <div>
                <div className="eyebrow muted">Open · awaiting reply</div>
                <h3>The forum, unread</h3>
              </div>
              <button className="btn on-paper small" onClick={() => navigate('forum')}>Open forum</button>
            </div>
            {openThreadsNoReplies.length === 0 ? (
              <EmptyState
                icon="chat"
                title="No threads need attention."
                body="Threads opened by either user with zero replies surface here so nothing falls through the cracks."
              />
            ) : (
              openThreadsNoReplies.map((t) => (
                <div key={t.id} className="reply" style={{ cursor: 'pointer' }} onClick={() => { location.hash = '#/forum/' + t.id; }}>
                  <div className="head">
                    <span className="author">{t.title}</span>
                    <span className="when">{Yd.relativeStamp(t.createdAt)}</span>
                  </div>
                  <div className="body" style={{ fontSize: 14 }}>{t.content.slice(0, 140)}{t.content.length > 140 ? '…' : ''}</div>
                  <div style={{ marginTop: 8 }}><span className="tag-badge">{t.sectionTag}</span></div>
                </div>
              ))
            )}
          </div>

          <div className="paper-card">
            <div className="card-head">
              <div>
                <div className="eyebrow muted">Map status</div>
                <h3>{store.projectSettings.mapStatus === 'uploaded' ? 'Map uploaded' : 'Awaiting White’s map'}</h3>
              </div>
              <StatusPill status={store.projectSettings.mapStatus === 'uploaded' ? 'confirmed' : 'pending'} />
            </div>
            <p style={{ fontSize: 15 }}>
              Toggle this from <a onClick={(e) => { e.preventDefault(); navigate('settings'); }} href="#" style={{ color: 'var(--imperial)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>Settings</a> once the physical map exists.
              Until then, World &amp; Geography opens with a placeholder frame.
            </p>
          </div>
        </div>
      </div>

      <SectionMark>Section status</SectionMark>
      <div className="section-grid">
        {Object.entries(sectionCounts).map(([code, info]) => (
          <div key={code} className="tile" onClick={() => navigate(info.key)}>
            <div className="code">{code}</div>
            <div className="name">{info.name}</div>
            <div className="count"><b>{info.count}</b> {info.unit}</div>
            <div className="state">
              {info.count === 0 ? 'pending entries' : 'in development'}
            </div>
          </div>
        ))}
      </div>

      <SectionMark>Quick access</SectionMark>
      <div className="row wrap" style={{ gap: 8 }}>
        {Object.entries(sectionCounts).map(([code, info]) => (
          <button key={code} className="btn small ghost" onClick={() => navigate(info.key)}>
            {info.name}
          </button>
        ))}
      </div>
    </Section>
  );
}

window.Dashboard = Dashboard;
