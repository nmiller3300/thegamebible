/* Game Bible — app.jsx
 * Root router with Supabase loading state.
 */
function App() {
  const store = window.YSTC.useStore();
  const me = window.YSTC.currentUser();
  const [route, navigate] = window.useHashRoute();

  // Show login if not authenticated
  if (!me) return <LoginScreen />;

  // Show loading overlay while initial data fetch runs
  if (!store._loaded) {
    return (
      <div style={{
        position:'fixed', inset:0, background:'var(--bg)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
        fontFamily:'var(--mono)', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--ash)',
        fontSize:12
      }}>
        <div style={{ color:'var(--imperial)', fontSize:28, marginBottom:8 }}>⚔</div>
        <div>Loading the world of {store.projectSettings.worldName}</div>
        <div style={{ opacity:0.5, fontSize:10 }}>Syncing from Supabase…</div>
      </div>
    );
  }

  const base = route.split('/')[0];

  let view;
  switch (base) {
    case 'dashboard':  view = <Dashboard navigate={navigate} />; break;
    case 'brain':      view = <BrainSection navigate={navigate} />; break;
    case 'bestiary':   view = <BestiarySection />; break;
    case 'characters': view = <CharactersSection />; break;
    case 'factions':   view = <FactionsSection />; break;
    case 'magic':      view = <MagicSection />; break;
    case 'world':      view = <WorldSection />; break;
    case 'lore':       view = <LoreSection />; break;
    case 'economy':    view = <EconomySection />; break;
    case 'military':   view = <MilitarySection />; break;
    case 'society':    view = <SocietySection />; break;
    case 'rumours':    view = <RumoursSection />; break;
    case 'calendar':   view = <CalendarSection />; break;
    case 'artifacts':  view = <ArtifactsSection />; break;
    case 'devlog':     view = <DevlogSection />; break;
    case 'forum':      view = <ForumSection route={route} navigate={navigate} />; break;
    case 'settings':   view = <SettingsSection navigate={navigate} />; break;
    default:           view = <Dashboard navigate={navigate} />; break;
  }

  return (
    <>
      <Topbar route={route} navigate={navigate} />
      <div className="app-layout" style={{ gridTemplateRows: 'auto' }}>
        <Sidebar route={base} navigate={navigate} />
        <main>{view}</main>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
