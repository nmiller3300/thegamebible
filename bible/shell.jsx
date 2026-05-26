/* Game Bible — shell.jsx
 * Topbar + sidebar + hash-based router.
 */
const Y_ = window.YSTC;

const NAV = [
  { group: 'Studio',  items: [
    { key: 'dashboard', label: 'Dashboard',           code: 'DASH-001',  icon: 'home' },
  ]},
  { group: 'Canon',  items: [
    { key: 'brain',     label: 'The Brain',           code: 'BRAIN-001', icon: 'crown' },
  ]},
  { group: 'Index',  items: [
    { key: 'bestiary',  label: 'Bestiary',            code: 'BEST-001',  icon: 'book' },
    { key: 'characters',label: 'Characters & NPCs',   code: 'CHAR-001',  icon: 'eye' },
    { key: 'factions',  label: 'Factions & Politics', code: 'FACT-001',  icon: 'flag' },
    { key: 'artifacts', label: 'Artifacts & Relics',  code: 'RELIC-001', icon: 'grail' },
  ]},
  { group: 'Systems', items: [
    { key: 'magic',     label: 'Magic System',        code: 'MAGIC-001', icon: 'spark' },
    { key: 'world',     label: 'World & Geography',   code: 'WORLD-001', icon: 'globe' },
    { key: 'lore',      label: 'Lore & History',      code: 'LORE-001',  icon: 'scroll' },
    { key: 'economy',   label: 'Economy & Trade',     code: 'ECON-001',  icon: 'coin' },
    { key: 'military',  label: 'Military & Warfare',  code: 'WAR-001',   icon: 'sword' },
    { key: 'society',   label: 'Society & Reputation',code: 'SOC-001',   icon: 'scales' },
  ]},
  { group: 'Studio Tools', items: [
    { key: 'devlog',    label: 'Dev Log',             code: 'DEV-001',   icon: 'log' },
    { key: 'forum',     label: 'The Forum',           code: 'FORUM-001', icon: 'chat' },
    { key: 'settings',  label: 'Settings',            code: 'SET-001',   icon: 'cog' },
  ]},
];

function useHashRoute() {
  const [route, setRoute] = useState(() => (location.hash || '#/dashboard').replace(/^#\/?/, '') || 'dashboard');
  useEffect(() => {
    const onChange = () => setRoute((location.hash || '#/dashboard').replace(/^#\/?/, '') || 'dashboard');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  function navigate(key) {
    if (key.startsWith('#')) key = key.slice(1);
    location.hash = '#/' + key;
  }
  return [route, navigate];
}
window.useHashRoute = useHashRoute;

function Topbar({ route, navigate }) {
  const store = Y_.useStore();
  const me = Y_.currentUser();

  return (
    <div className="topbar">
      <span className="seal">
        <Icon name="sigil" size={20} />
        <b>Game Bible</b>
      </span>
      <span className="crumbs">
        <span className="project-name">{store.projectSettings.projectName}</span>
        <span>/</span>
        <span className="world-name">{store.projectSettings.worldName || 'Eravan'}</span>
      </span>
      <span className="spacer"></span>
      {me ? (
        <span className="who">
          <span className="dot"></span>
          <span className="name">{me.displayName}</span>
          <span className="role">· {me.role}</span>
        </span>
      ) : null}
      <button className="icon-btn" onClick={() => navigate('settings')} title="Settings">
        <Icon name="cog" size={14} /> Settings
      </button>
      <button className="icon-btn danger" onClick={() => Y_.logoutUser()} title="Log out">
        <Icon name="out" size={14} /> Log out
      </button>
    </div>
  );
}

function Sidebar({ route, navigate }) {
  return (
    <nav className="sidebar" aria-label="Sections">
      {NAV.map((group) => (
        <div key={group.group}>
          <div className="nav-group-label">{group.group}</div>
          {group.items.map((item) => (
            <div
              key={item.key}
              className={'nav-item' + (route === item.key ? ' active' : '')}
              onClick={() => navigate(item.key)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(item.key); }}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
              <span className="code">{item.code.split('-')[1]}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }}></div>
      <div style={{ padding: '20px 20px 14px', borderTop: '1px solid var(--rule-dark)', marginTop: 18 }}>
        <div className="tiny-label dark" style={{ marginBottom: 6 }}>Studio</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ash)', opacity: 0.6 }}>
          Live · Supabase · thegamebible.netlify.app
        </div>
      </div>
    </nav>
  );
}

window.Topbar = Topbar;
window.Sidebar = Sidebar;
window.NAV = NAV;
