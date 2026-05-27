/* bible/auth.jsx — Supabase Auth login screen
 * Same UI as prototype, now wired to real Supabase Auth.
 */
const Y = window.YSTC;

function LoginScreen() {
  const store = Y.useStore();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Lore & Creature Designer');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    if (mode === 'register') {
      const r = await Y.registerUser({ email, password, displayName, role });
      if (r.error) setErr(r.error);
    } else {
      const r = await Y.loginUser({ email, password });
      if (r.error) setErr(r.error);
    }
    setLoading(false);
  }

  return (
    <div className="login-shell">
      <div className="panel-left">
        <div>
          <div className="kicker" style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--imperial)'}}>
            <span style={{ display:'inline-block', width:24, height:1, background:'currentColor', verticalAlign:'middle', marginRight:10, marginBottom:3 }}></span>
            Studio Hub · Internal
          </div>
          <h1>The <em>Game</em><br/>Bible.</h1>
          <div className="latin">— Compendium of the world of {store.projectSettings.worldName} —</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <blockquote className="quote">
            Player freedom is sacred. Every life path must have depth. The world reacts to the player.
            <span className="by">— from the Brain, non-negotiable §1–3</span>
          </blockquote>

          <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ash)' }}>
            <div style={{ marginBottom:6 }}><span style={{opacity:0.5, marginRight:10}}>doc</span>HUB-001 · v1.0</div>
            <div style={{ marginBottom:6 }}><span style={{opacity:0.5, marginRight:10}}>auth</span>Supabase · secure</div>
            <div><span style={{opacity:0.5, marginRight:10}}>tone</span>grounded · serious · weighted</div>
          </div>
        </div>
      </div>

      <div className="panel-right">
        <div className="form-card">
          <h2>{mode === 'register' ? 'Take a seat.' : 'Welcome back.'}</h2>
          <div className="deck">
            {mode === 'register'
              ? 'Two creators share this document. Register your seat.'
              : 'Sign in to continue building the world.'}
          </div>

          <div className="toggle">
            <button onClick={() => { setErr(''); setMode('login'); }} aria-pressed={mode==='login'}>Sign in</button>
            <button onClick={() => { setErr(''); setMode('register'); }} aria-pressed={mode==='register'}>Register</button>
          </div>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <Field label="Display name">
                  <TextInput value={displayName} onChange={setDisplayName} placeholder="e.g. White" />
                </Field>
                <Field label="Role on the project">
                  <Select value={role} onChange={setRole}
                    options={['Lore & Creature Designer','World & Map Builder','Both','Other']} />
                </Field>
              </>
            )}
            <Field label="Email">
              <TextInput type="email" value={email} onChange={setEmail} placeholder="you@studio" autoFocus />
            </Field>
            <Field label="Password">
              <TextInput type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            </Field>

            {err ? (
              <div style={{ color:'var(--imperial)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>
                {err}
              </div>
            ) : null}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
              <div className="mono" style={{ fontSize:11, letterSpacing:'0.14em', color:'var(--ink-mute)', textTransform:'uppercase' }}>
                {loading ? 'working…' : mode === 'register' ? 'secure · Supabase Auth' : 'Auth · session'}
              </div>
              <button className="btn on-paper primary" type="submit" disabled={loading}>
                {loading ? '…' : mode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ marginTop:18, fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.14em', color:'var(--ash-2)', textTransform:'uppercase' }}>
          Production · Supabase Auth · shared between all team members
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;

// ── White's onboarding — shown on first login if hasSeenOnboarding is false ──
function OnboardingWelcome({ onDone }) {
  const store = window.YSTC.useStore();
  const [step, setStep] = useState(0);
  const name = window.YSTC.currentDisplayName();
  const isNew = name && name.toLowerCase().includes('white');

  const steps = [
    {
      kicker: 'Welcome to',
      heading: store.projectSettings.projectName || 'THE PROJECT',
      sub: store.projectSettings.worldName ? `World of ${store.projectSettings.worldName}` : 'A world being built',
      body: `This is the Game Bible. Everything that exists in this world lives here — creatures, characters, factions, history, magic, and the rules the world runs on. It is a shared document for both of you. Anything either of you adds, the other sees immediately.`,
      action: 'Keep going',
    },
    {
      kicker: 'What this is',
      heading: 'A living document',
      body: `The Brain holds the non-negotiables — the core philosophy the game won't break. Everything else is being decided as you go. Some entries are confirmed. Others are pending. Nothing here is wasted work.`,
      action: 'Keep going',
    },
    {
      kicker: 'How it works',
      heading: 'Click anything to open it',
      body: `Every creature, character, faction, and artifact opens into its own full document. You can add content, upload images, and leave notes. The sidebar on the left takes you anywhere. The Forum is for back-and-forth between the two of you. The Decision Log is where reasoning gets recorded so it isn't forgotten.`,
      action: 'Start exploring',
    },
  ];

  const current = steps[step];

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ position:'relative', zIndex:1, width:'min(680px, 100%)', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.24em', textTransform:'uppercase', color:'var(--imperial)', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
          <span style={{ display:'inline-block', width:28, height:1, background:'currentColor', verticalAlign:'middle' }}></span>
          {current.kicker}
          <span style={{ display:'inline-block', width:28, height:1, background:'currentColor', verticalAlign:'middle' }}></span>
        </div>
        <h1 style={{ fontFamily:'var(--serif)', fontWeight:500, fontStyle:'italic', fontSize:'clamp(42px, 7vw, 80px)', lineHeight:0.95, letterSpacing:'-0.015em', color:'var(--paper)', margin:'0 0 8px' }}>
          {current.heading}
        </h1>
        {current.sub && (
          <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--ash)', fontSize:18, marginBottom:32 }}>{current.sub}</div>
        )}
        <p style={{ fontFamily:'var(--serif)', fontSize:18, color:'var(--ivory)', lineHeight:1.7, margin:'24px auto 40px', maxWidth:'52ch', opacity:0.9 }}>
          {current.body}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
          {step > 0 && (
            <button className="btn ghost" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          <button className="btn primary" style={{ padding:'12px 32px', fontSize:13 }} onClick={() => {
            if (step < steps.length - 1) setStep(s => s + 1);
            else onDone();
          }}>
            {current.action}
          </button>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i===step ? 20 : 6, height:6, borderRadius:3, background: i===step ? 'var(--imperial)' : 'var(--rule-dark)', transition:'all 0.25s' }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.OnboardingWelcome = OnboardingWelcome;
