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
