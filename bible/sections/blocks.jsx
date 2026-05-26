/* Game Bible — sections/blocks.jsx
 * Shared building blocks for content-block based sections.
 * - ProseBlock: a labeled paper card containing one body of text with
 *   inline-edit, confirmed/pending toggle, attribution.
 * - TableBlock: a labeled paper card containing a small editable table.
 * - FreeBlock: a card from a freeform collection (title + body + status).
 * - FreeBlockEditor: modal for adding/editing freeform blocks.
 */
const Yblk = window.YSTC;

function ProseBlock({ title, body, isConfirmed, onChange, emptyHint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body || '');
  useEffect(() => { setDraft(body || ''); }, [body, editing]);

  function save() {
    onChange({ content: draft });
    setEditing(false);
  }

  return (
    <article className={'paper-card' + (!isConfirmed && !body ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">Content block</div>
          <h3>{title}</h3>
        </div>
        <StatusPill status={isConfirmed ? 'confirmed' : 'pending'} />
      </div>
      {editing ? (
        <>
          <TextArea value={draft} onChange={setDraft} rows={6} />
          <div className="modal-actions" style={{ marginTop: 14 }}>
            <StatusToggle value={isConfirmed ? 'confirmed' : 'pending'} onChange={(s) => onChange({ isConfirmed: s === 'confirmed' })} />
            <div className="right">
              <button className="btn on-paper ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn on-paper primary" onClick={save}>Save</button>
            </div>
          </div>
        </>
      ) : (
        <>
          {body
            ? body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
            : <p className="muted italic">{emptyHint || 'No content yet. Click Edit to begin.'}</p>}
          <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
            <StatusToggle value={isConfirmed ? 'confirmed' : 'pending'} onChange={(s) => onChange({ isConfirmed: s === 'confirmed' })} />
            <button className="btn on-paper small" onClick={() => setEditing(true)}><Icon name="pencil" size={11}/> Edit</button>
          </div>
        </>
      )}
    </article>
  );
}

function TableBlock({ title, columns, rows = [], onChange, isConfirmed, onStatusChange, emptyHint }) {
  // rows: array of {id, ...colKeyValues}
  function setCell(rowId, key, value) {
    onChange(rows.map((r) => r.id === rowId ? { ...r, [key]: value } : r));
  }
  function addRow() {
    const blank = { id: Yblk.uid() };
    columns.forEach((c) => { blank[c.key] = ''; });
    onChange([...rows, blank]);
  }
  function removeRow(rowId) {
    onChange(rows.filter((r) => r.id !== rowId));
  }
  return (
    <article className={'paper-card' + (!isConfirmed && rows.length === 0 ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">Editable table</div>
          <h3>{title}</h3>
        </div>
        <StatusPill status={isConfirmed ? 'confirmed' : 'pending'} />
      </div>
      {rows.length === 0 ? (
        <p className="muted italic">{emptyHint || 'No rows yet. Add the first one.'}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      <input className="cell-input" type="text" value={r[c.key] || ''} onChange={(e) => setCell(r.id, c.key, e.target.value)} placeholder={c.placeholder} />
                    </td>
                  ))}
                  <td>
                    <button className="btn small on-paper danger" onClick={() => removeRow(r.id)} title="Remove row">
                      <Icon name="trash" size={10}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
        {onStatusChange ? (
          <StatusToggle value={isConfirmed ? 'confirmed' : 'pending'} onChange={(s) => onStatusChange(s === 'confirmed')} />
        ) : <span></span>}
        <button className="btn on-paper small" onClick={addRow}><Icon name="plus" size={11}/> Add row</button>
      </div>
    </article>
  );
}

function FreeBlock({ block, onEdit, onDelete }) {
  return (
    <article className={'paper-card' + (block.status === 'pending' ? ' tbd' : '')}>
      <div className="card-head">
        <div>
          <div className="eyebrow muted">Content block</div>
          <h3>{block.title}</h3>
        </div>
        <StatusPill status={block.status || 'pending'} />
      </div>
      {block.body
        ? block.body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)
        : <p className="muted italic">No body yet.</p>}
      <div className="spread" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--rule)' }}>
        <Attrib entry={block} />
        <div className="row">
          <button className="btn small on-paper" onClick={onEdit}><Icon name="pencil" size={11}/> Edit</button>
          <button className="btn small on-paper danger" onClick={onDelete}><Icon name="trash" size={11}/> Delete</button>
        </div>
      </div>
    </article>
  );
}

function FreeBlockEditor({ open, entry, onClose, onSave, hint }) {
  const [d, setD] = useState({});
  useEffect(() => { setD({ title:'', body:'', status:'pending', ...(entry || {}) }); }, [entry, open]);
  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-head">
        <div><h2>{entry ? 'Edit block' : 'Add a content block'}</h2><div className="tiny-label" style={{ marginTop:6 }}>{hint || 'Title + body + status'}</div></div>
        <div className="doc-code">BLOCK</div>
      </div>
      <Field label="Title"><TextInput value={d.title} onChange={(v) => setD({ ...d, title: v })} /></Field>
      <Field label="Body"><TextArea value={d.body} onChange={(v) => setD({ ...d, body: v })} rows={7} /></Field>
      <div className="modal-actions">
        <ConfirmedToggle value={d.status === 'confirmed'} onChange={(b) => setD({ ...d, status: b ? 'confirmed' : 'pending' })} />
        <div className="right">
          <button className="btn on-paper ghost" onClick={onClose}>Cancel</button>
          <button className="btn on-paper primary" disabled={!d.title?.trim()} onClick={() => onSave(d)}>{entry ? 'Save changes' : 'Add block'}</button>
        </div>
      </div>
    </Modal>
  );
}

window.ProseBlock = ProseBlock;
window.TableBlock = TableBlock;
window.FreeBlock = FreeBlock;
window.FreeBlockEditor = FreeBlockEditor;
