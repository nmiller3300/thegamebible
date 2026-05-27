/* Game Bible — sections/settings.jsx */
const Yset = window.YSTC;

function SettingsSection({ navigate }) {
  const store = Yset.useStore();
  const me = Yset.currentUser();
  const [projectName, setProjectName] = useState(store.projectSettings.projectName);
  const [worldName, setWorldName] = useState(store.projectSettings.worldName || 'Eravan');
  const [displayName, setDisplayName] = useState(me ? me.displayName : '');
  const [savedNote, setSavedNote] = useState('');
  const [confirmBrainOpen, setConfirmBrainOpen] = useState(false);

  function saveProject() {
    Yset.setStore({
      projectSettings: {
        ...store.projectSettings,
        projectName: projectName.trim() || 'THE PROJECT',
        worldName: worldName.trim() || 'Eravan',
        updatedBy: Yset.currentDisplayName(),
        updatedAt: Yset.nowISO(),
      },
    });
    Yset.logActivity('Settings', 'updated', 'project name to "' + (projectName.trim() || 'THE PROJECT') + '"');
    flash('Project name saved');
  }
  function saveDisplayName() {
    if (!me) return;
    Yset.updateProfile(me.id, { displayName: displayName.trim() || me.email.split('@')[0] });
    Yset.logActivity('Settings', 'updated', 'display name');
    flash('Display name saved');
  }
  function toggleMap() {
    const next = store.projectSettings.mapStatus === 'uploaded' ? 'pending' : 'uploaded';
    Yset.setStore({ projectSettings: { ...store.projectSettings, mapStatus: next } });
    Yset.logActivity('Settings', 'changed', 'map status to ' + next);
  }
  function flash(msg) {
    setSavedNote(msg);
    setTimeout(() => setSavedNote(''), 2400);
  }

  return (
    <Section>
      <DocHead
        kicker="Studio · Configuration"
        title=""
        titleEm="Settings"
        deck="Project-wide controls and protected actions."
        code="SET-001"
      />

      <div className="grid12">
        <article className="paper-card spacious" style={{ gridColumn: 'span 7' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Project identity</div>
              <h3>What the document calls itself</h3>
            </div>
          </div>
          <Field label="Project name" hint="Updates the title across every screen instantly.">
            <TextInput value={projectName} onChange={setProjectName} placeholder="THE PROJECT" />
          </Field>
          <Field label="World name" hint="The continent. The brief confirms Eravan as the default.">
            <TextInput value={worldName} onChange={setWorldName} placeholder="Eravan" />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn on-paper primary" onClick={saveProject}>Save</button>
          </div>
        </article>

        <article className="paper-card spacious" style={{ gridColumn: 'span 5' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Your seat</div>
              <h3>{me ? me.displayName : 'No user'}</h3>
            </div>
          </div>
          {me ? (
            <>
              <Field label="Display name"><TextInput value={displayName} onChange={setDisplayName} /></Field>
              <Field label="Email">
                <TextInput value={me.email} onChange={() => {}} />
              </Field>
              <Field label="Role on the project">
                <TextInput value={me.role} onChange={(v) => Yset.updateProfile(me.id, { role: v })} />
              </Field>
              <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn on-paper primary" onClick={saveDisplayName}>Save display name</button>
              </div>
            </>
          ) : <p className="muted italic">No user signed in.</p>}
        </article>

        <article className="paper-card spacious" style={{ gridColumn: 'span 6' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Map status</div>
              <h3>{store.projectSettings.mapStatus === 'uploaded' ? 'Uploaded' : 'Pending White’s map'}</h3>
            </div>
            <StatusPill status={store.projectSettings.mapStatus === 'uploaded' ? 'confirmed' : 'pending'} />
          </div>
          <p>Toggle this when White's map is ready to upload.</p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn on-paper primary" onClick={toggleMap}>
              {store.projectSettings.mapStatus === 'uploaded' ? 'Mark as pending' : 'Mark as uploaded'}
            </button>
          </div>
        </article>

        <article className="paper-card spacious" style={{ gridColumn: 'span 6' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Protected · canon</div>
              <h3>Update The Brain</h3>
            </div>
            <Icon name="lock" size={16} />
          </div>
          <p>Replacing The Brain replaces the founding document of the project. To prevent accidental overwrite you must type CONFIRM before the editor opens.</p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn on-paper primary" onClick={() => setConfirmBrainOpen(true)}>
              <Icon name="lock" size={12}/> Open protected editor
            </button>
          </div>
        </article>

        <article className="paper-card spacious" style={{ gridColumn: 'span 12' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Bestiary</div>
              <h3>Manage categories</h3>
            </div>
            <button className="btn on-paper small" onClick={() => navigate('bestiary')}>Open bestiary</button>
          </div>
          <p>Categories live in the Bestiary itself for proximity to the entries they group. Use the &ldquo;Manage categories&rdquo; button in the Creature Index tab.</p>
        </article>

        <article className="paper-card spacious" style={{ gridColumn: 'span 12' }}>
          <div className="card-head">
            <div>
              <div className="eyebrow muted">Prototype maintenance</div>
              <h3>Local data</h3>
            </div>
          </div>
          <p>This prototype stores everything in your browser. When the real application is deployed (Supabase + Netlify) every action will write to the database with attribution. Until then, you can reset the prototype state here.</p>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
            <button className="btn on-paper ghost" onClick={() => downloadState()}>Download state · JSON</button>
            <button className="btn on-paper danger" onClick={() => Yset.resetAll()}>Reset prototype</button>
          </div>
        </article>
      </div>

      {savedNote && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '10px 16px', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: 2, zIndex: 60 }}>
          {savedNote}
        </div>
      )}

      <ConfirmDialog
        open={confirmBrainOpen}
        title="Open the Brain editor?"
        body="The Brain is canon. Replacing it should never be casual. Type CONFIRM to open the editor."
        confirmLabel="Open editor"
        danger={false}
        requireType="CONFIRM"
        onCancel={() => setConfirmBrainOpen(false)}
        onConfirm={() => { setConfirmBrainOpen(false); navigate('brain'); }}
      />
    </Section>
  );
}

function downloadState() {
  const data = JSON.stringify(window.YSTC.store(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'game-bible-state.json';
  a.click();
  URL.revokeObjectURL(url);
}

window.SettingsSection = SettingsSection;
