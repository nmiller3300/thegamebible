/* Game Bible — sections/brain.jsx
 * The Brain — the founding law. Read-only display; editing gated by
 * a CONFIRM-typing protected action.
 */
const Yb = window.YSTC;

const BRAIN_SCHEMA = {
  whatThisGameIs:    '',
  coreConcept:       '',
  lifePaths:         [],            // [{label, description}]
  worldEmpire:       '',
  worldAncient:      '',
  toneTable:         [],            // [{influence, take}]
  magicIntro:        '',
  magicRules:        '',
  magicGameplay:     '',
  classHierarchy:    [],            // [string]
  systemsTable:      [],            // [{system, description}]
  nonNegotiables:    [],            // [string]
};

function brainContent(store) {
  return store.theBrain.content || BRAIN_SCHEMA;
}

function BrainSection({ navigate }) {
  const store = Yb.useStore();
  const c = brainContent(store);
  const [editorOpen, setEditorOpen] = useState(false);
  const [protectedOpen, setProtectedOpen] = useState(false);

  function openProtected() {
    setProtectedOpen(true);
  }
  function passProtection() {
    setProtectedOpen(false);
    setEditorOpen(true);
  }

  const empty = !store.theBrain.content;

  return (
    <Section>
      <DocHead
        kicker="Canon · Founding document"
        title="The"
        titleEm="Brain"
        deck="The founding law of the project. Every section references it. Editing is protected."
        code="BRAIN-001"
        codeMeta={{
          status: empty ? 'empty' : 'sealed',
          'last sealed by': store.theBrain.updatedBy || '—',
          'last sealed': store.theBrain.updatedAt ? Yb.formatStamp(store.theBrain.updatedAt) : '—',
        }}
      />

      <div className="spread" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 10 }}>
          <StatusPill status={empty ? 'pending' : 'confirmed'} />
          <span className="muted-dark mono" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
            · Protected · CONFIRM-gated edits only
          </span>
        </div>
        <button className="btn primary" onClick={openProtected}>
          <Icon name="lock" size={14} /> Update document
        </button>
      </div>

      <article className="brain-doc">
        <div className="stamp">Sealed · Project Canon</div>
        <h1>The <em>Brain</em></h1>
        <div className="doc-meta">
          {store.projectSettings.projectName} · founding document · v{empty ? '0' : '1'}.0
          {store.theBrain.updatedAt ? ' · sealed ' + Yb.formatStamp(store.theBrain.updatedAt) : ''}
        </div>

        <BrainBlock title="What This Game Is" body={c.whatThisGameIs}
          empty="Open the protected editor and paste in the confirmed founding paragraph here." />

        <BrainBlock title="Core Concept — Your Story, Your Crown" body={c.coreConcept}
          empty="A short paragraph stating the core promise to the player." />
        <h3>Life paths</h3>
        {(c.lifePaths || []).length === 0 ? (
          <div className="placeholder">
            <b>Editable list — add as many life paths as the design requires</b>
            Politics · Crafting · Trade · Land · Combat · Stalls · anything else. Each line gets a label and a one-sentence description.
          </div>
        ) : (
          <ul>
            {c.lifePaths.map((p, i) => (
              <li key={i}><b>{p.label}</b>{p.description ? ' — ' + p.description : ''}</li>
            ))}
          </ul>
        )}

        <h2>The World</h2>
        <h3>The Empire</h3>
        <BrainBlock body={c.worldEmpire}
          empty="Describe the dominant empire — fracturing, held together by tradition, fear, political marriages." />
        <h3>The Ancient World</h3>
        <BrainBlock body={c.worldAncient}
          empty="The Tolkien layer. Ruins, dead languages, weight under the surface." />

        <h2>Tone &amp; Inspiration</h2>
        {(c.toneTable || []).length === 0 ? (
          <div className="placeholder">
            <b>Two-column reference table</b>
            Columns: <em>Influence</em> and <em>What We Take From It</em>. Add rows in the protected editor.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Influence</th><th>What We Take From It</th></tr></thead>
              <tbody>
                {c.toneTable.map((r, i) => (
                  <tr key={i}><td className="k">{r.influence}</td><td>{r.take}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2>Magic System — The Blood of Power</h2>
        <BrainBlock body={c.magicIntro}
          empty="One paragraph: magic equals status. If you have it, you are nobility." />
        <h3>The Rules</h3>
        <BrainBlock body={c.magicRules}
          empty="The Ascended, the Veilborn, the bloodline marriages, the legal status of peasant manifestation." />
        <h3>Why This Matters for Gameplay</h3>
        <BrainBlock body={c.magicGameplay}
          empty="Magic is a social and political weapon before it is a combat tool." />

        <h2>Society &amp; Class</h2>
        <h3>Class hierarchy</h3>
        {(c.classHierarchy || []).length === 0 ? (
          <div className="placeholder">
            <b>Ordered list — lowest to highest</b>
            Peasants \u2192 Tradespeople \u2192 Merchants \u2192 Minor Nobles \u2192 Lords \u2192 King. Edit through the protected editor.
          </div>
        ) : (
          <ol>{c.classHierarchy.map((s, i) => <li key={i}>{s}</li>)}</ol>
        )}

        <h2>Systems Overview</h2>
        {(c.systemsTable || []).length === 0 ? (
          <div className="placeholder">
            <b>Structured table</b>
            Columns: <em>System</em> and <em>Description</em>. Reputation, Economy, Politics, Crafting, Time &amp; Seasons, NPC Memory.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>System</th><th>Description</th></tr></thead>
              <tbody>
                {c.systemsTable.map((r, i) => (
                  <tr key={i}><td className="k">{r.system}</td><td>{r.description}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2>Non-Negotiables</h2>
        {(c.nonNegotiables || []).length === 0 ? (
          <div className="placeholder">
            <b>Numbered list — pillars that override everything else</b>
            The seven pillars from the source brief. Paste in through the protected editor.
          </div>
        ) : (
          <ol>{c.nonNegotiables.map((s, i) => <li key={i}>{s}</li>)}</ol>
        )}
      </article>

      <ConfirmDialog
        open={protectedOpen}
        title="Open the protected editor?"
        body="The Brain is the canon. Replacing it should never be casual. Type CONFIRM to open the editor."
        confirmLabel="Open editor"
        danger={false}
        requireType="CONFIRM"
        onCancel={() => setProtectedOpen(false)}
        onConfirm={passProtection}
      />

      <BrainEditor open={editorOpen} value={c} onClose={() => setEditorOpen(false)} />
    </Section>
  );
}

function BrainBlock({ title, body, empty }) {
  return (
    <>
      {title ? <h3>{title}</h3> : null}
      {body
        ? body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
        : <div className="placeholder"><b>Pending content</b>{empty}</div>}
    </>
  );
}

function BrainEditor({ open, value, onClose }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (open) setDraft(value || BRAIN_SCHEMA); }, [open, value]);

  function set(k, v) { setDraft((d) => ({ ...d, [k]: v })); }
  function setList(k, list) { setDraft((d) => ({ ...d, [k]: list })); }

  function save() {
    Yb.saveBrain(draft);
    Yb.logActivity('The Brain', 'sealed', 'an updated version of the founding document');
    onClose();
  }

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width="wide">
      <div className="modal-head">
        <div>
          <h2>Edit — The Brain</h2>
          <div className="tiny-label" style={{ marginTop: 6 }}>Sealing replaces the entire document</div>
        </div>
        <div className="doc-code">BRAIN · PROTECTED</div>
      </div>

      <Field label="What This Game Is">
        <TextArea value={draft.whatThisGameIs} onChange={(v) => set('whatThisGameIs', v)} rows={4}
          placeholder="Open world fantasy sandbox RPG. The promise: you can do anything…" />
      </Field>

      <Field label="Core Concept — Your Story, Your Crown">
        <TextArea value={draft.coreConcept} onChange={(v) => set('coreConcept', v)} rows={3} />
      </Field>

      <RepeaterPairs
        label="Life paths"
        items={draft.lifePaths}
        keys={['label','description']}
        labels={['Label','Description']}
        onChange={(l) => setList('lifePaths', l)}
      />

      <div className="field-row">
        <Field label="The Empire">
          <TextArea value={draft.worldEmpire} onChange={(v) => set('worldEmpire', v)} rows={4} />
        </Field>
        <Field label="The Ancient World">
          <TextArea value={draft.worldAncient} onChange={(v) => set('worldAncient', v)} rows={4} />
        </Field>
      </div>

      <RepeaterPairs
        label="Tone · Influence table"
        items={draft.toneTable}
        keys={['influence','take']}
        labels={['Influence','What we take from it']}
        onChange={(l) => setList('toneTable', l)}
      />

      <Field label="Magic — introduction">
        <TextArea value={draft.magicIntro} onChange={(v) => set('magicIntro', v)} rows={3} />
      </Field>
      <div className="field-row">
        <Field label="Magic — the rules">
          <TextArea value={draft.magicRules} onChange={(v) => set('magicRules', v)} rows={5} />
        </Field>
        <Field label="Magic — why it matters for gameplay">
          <TextArea value={draft.magicGameplay} onChange={(v) => set('magicGameplay', v)} rows={5} />
        </Field>
      </div>

      <RepeaterText
        label="Class hierarchy — lowest to highest"
        items={draft.classHierarchy}
        placeholder="Peasant"
        onChange={(l) => setList('classHierarchy', l)}
      />

      <RepeaterPairs
        label="Systems table"
        items={draft.systemsTable}
        keys={['system','description']}
        labels={['System','Description']}
        onChange={(l) => setList('systemsTable', l)}
      />

      <RepeaterText
        label="Non-negotiables — numbered pillars"
        items={draft.nonNegotiables}
        placeholder="Player freedom is sacred"
        onChange={(l) => setList('nonNegotiables', l)}
      />

      <div className="modal-actions">
        <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
        <div className="right">
          <button className="btn on-paper primary" onClick={save}>Seal new version</button>
        </div>
      </div>
    </Modal>
  );
}

function RepeaterText({ label, items = [], placeholder, onChange }) {
  function set(i, v) {
    const next = items.slice(); next[i] = v; onChange(next);
  }
  function add() { onChange([...(items || []), '']); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }
  return (
    <div className="field">
      <label>{label}</label>
      <div className="stack-sm">
        {(items || []).map((v, i) => (
          <div key={i} className="row" style={{ gap: 8 }}>
            <div className="tiny-label" style={{ minWidth: 24 }}>{String(i+1).padStart(2,'0')}</div>
            <input type="text" value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} style={{ flex: 1 }} />
            <button className="btn on-paper small danger" onClick={() => remove(i)} type="button">Remove</button>
          </div>
        ))}
        <button className="btn on-paper small" onClick={add} type="button"><Icon name="plus" size={11}/> Add row</button>
      </div>
    </div>
  );
}

function RepeaterPairs({ label, items = [], keys, labels, onChange }) {
  function setRow(i, k, v) {
    const next = items.slice(); next[i] = { ...(next[i] || {}), [k]: v }; onChange(next);
  }
  function add() { onChange([...(items || []), Object.fromEntries(keys.map(k => [k, '']))]); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }
  return (
    <div className="field">
      <label>{label}</label>
      <div className="stack-sm">
        {(items || []).map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
            <input type="text" placeholder={labels[0]} value={row[keys[0]] || ''} onChange={(e) => setRow(i, keys[0], e.target.value)} />
            <input type="text" placeholder={labels[1]} value={row[keys[1]] || ''} onChange={(e) => setRow(i, keys[1], e.target.value)} />
            <button className="btn on-paper small danger" onClick={() => remove(i)} type="button">Remove</button>
          </div>
        ))}
        <button className="btn on-paper small" onClick={add} type="button"><Icon name="plus" size={11}/> Add row</button>
      </div>
    </div>
  );
}

window.BrainSection = BrainSection;
window.BrainEditor = BrainEditor;
window.RepeaterText = RepeaterText;
window.RepeaterPairs = RepeaterPairs;
