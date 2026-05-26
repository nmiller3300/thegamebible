/* Game Bible — ui.jsx
 * Shared UI primitives shared by every section. Attached to window
 * because each <script type="text/babel"> is its own scope.
 */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Iconography ──────────────────────────────────────────────────────────
function Icon({ name, size = 16, stroke = 1.5, ...rest }) {
  const paths = {
    crown: (
      <path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9H3z M3 19h18" />
    ),
    sigil: (
      <g>
        <circle cx="12" cy="12" r="9.2" />
        <path d="M12 3v18 M3 12h18" />
        <path d="M12 3a9 9 0 0 0 0 18 M12 3a9 9 0 0 1 0 18" />
      </g>
    ),
    plus: <path d="M12 5v14 M5 12h14" />,
    pencil: <path d="M4 20h4l10-10-4-4L4 16v4z M14 6l4 4" />,
    trash: <path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13" />,
    check: <path d="M5 12l4 4L19 6" />,
    x: <path d="M6 6l12 12 M6 18L18 6" />,
    chevron: <path d="M9 6l6 6-6 6" />,
    book: <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z M4 17a3 3 0 0 1 3-3h12" />,
    sword: <path d="M4 20l4-4 M8 16l8-8 4-4-1 5-4 4-8 8z" />,
    flag: <path d="M5 21V3 M5 4l12 2v9L5 13" />,
    spark: <path d="M12 2v6 M12 16v6 M2 12h6 M16 12h6 M5 5l4 4 M15 15l4 4 M5 19l4-4 M15 9l4-4" />,
    globe: <g><circle cx="12" cy="12" r="9"/><path d="M3 12h18 M12 3c3 4 3 14 0 18 M12 3c-3 4-3 14 0 18"/></g>,
    scroll: <path d="M5 6c0-2 1-3 3-3h11v15c0 2-1 3-3 3H7c-1 0-2-1-2-3V6z M9 6h10 M9 11h10 M9 16h6" />,
    coin: <g><circle cx="12" cy="12" r="9"/><path d="M12 7v10 M9 10h6 M9 14h6"/></g>,
    helmet: <path d="M4 14a8 8 0 0 1 16 0v4H4v-4z M4 18h16 M9 14v-4 M15 14v-4" />,
    scales: <path d="M12 4v18 M5 22h14 M6 4l-3 7h6L6 4z M18 4l-3 7h6l-3-7z M12 4h-4 M12 4h4" />,
    grail: <path d="M7 4h10l-1 6a4 4 0 0 1-8 0L7 4z M12 14v6 M9 20h6" />,
    log: <path d="M4 6h16 M4 12h16 M4 18h10" />,
    chat: <path d="M4 5h16v11H8l-4 4V5z" />,
    cog: <g><circle cx="12" cy="12" r="3"/><path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1"/></g>,
    home: <path d="M3 12l9-8 9 8v9h-6v-6h-6v6H3v-9z" />,
    eye: <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>,
    lock: <g><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g>,
    out: <path d="M15 4h5v16h-5 M10 8l-4 4 4 4 M6 12h12" />,
    image: <g><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></g>,
    drag: <path d="M8 6h.01 M16 6h.01 M8 12h.01 M16 12h.01 M8 18h.01 M16 18h.01" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths[name] || null}
    </svg>
  );
}

// ── DocCode (the "BEST-001" stamp) ───────────────────────────────────────
function DocCode({ code, ...meta }) {
  const entries = Object.entries(meta).filter(([, v]) => v != null && v !== '');
  return (
    <div className="doc-code">
      <div><span>doc</span>{code}</div>
      {entries.map(([k, v]) => <div key={k}><span>{k}</span>{v}</div>)}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────
function DocHead({ kicker, title, titleEm, deck, code, codeMeta = {}, children }) {
  return (
    <div className="doc-head">
      <div>
        <div className="kicker"><span className="bar"></span>{kicker}</div>
        <h1>{title}{titleEm ? <> <em>{titleEm}</em></> : null}</h1>
        {deck ? <div className="deck">{deck}</div> : null}
        {children}
      </div>
      {code ? <DocCode code={code} {...codeMeta} /> : null}
    </div>
  );
}

function SectionMark({ children }) {
  return <div className="section-mark">{children}</div>;
}

// ── Status pill ──────────────────────────────────────────────────────────
function StatusPill({ status }) {
  if (status === 'confirmed') return <span className="status-pill confirmed">Confirmed</span>;
  if (status === 'pending') return <span className="status-pill pending">Pending · TBD</span>;
  if (status === 'open') return <span className="status-pill pending">Open</span>;
  if (status === 'resolved') return <span className="status-pill confirmed">Resolved</span>;
  return <span className="status-pill dim">{status}</span>;
}

// ── Attribution stamp ────────────────────────────────────────────────────
function Attrib({ entry, action = 'updated' }) {
  if (!entry) return null;
  const who = action === 'created' ? entry.createdBy : entry.updatedBy;
  const when = action === 'created' ? entry.createdAt : entry.updatedAt;
  return (
    <span className="attrib">
      <span>{action}</span>
      <b>{who || '—'}</b>
      <span className="sep">·</span>
      <span>{window.YSTC.formatStamp(when)}</span>
    </span>
  );
}

// ── Modal scrim ──────────────────────────────────────────────────────────
function Modal({ open, onClose, children, width = 'normal' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  const cls = 'modal' + (width === 'wide' ? ' wide' : width === 'compact' ? ' compact' : '');
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cls} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

// ── Confirm dialog ───────────────────────────────────────────────────────
function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', danger = true, onCancel, onConfirm, requireType }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  if (!open) return null;
  const blocked = !!requireType && typed.trim().toUpperCase() !== String(requireType).toUpperCase();
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm" role="alertdialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{body}</p>
        {requireType ? (
          <div className="field">
            <label>Type <b style={{letterSpacing:'0.18em'}}>{requireType}</b> to confirm</label>
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </div>
        ) : null}
        <div className="actions">
          <button className="btn on-paper ghost" onClick={onCancel}>Cancel</button>
          <button
            className={'btn on-paper ' + (danger ? 'danger' : 'primary')}
            disabled={blocked}
            onClick={() => { onConfirm(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form primitives ──────────────────────────────────────────────────────
function Field({ label, hint, children, dark, span }) {
  return (
    <div className={'field' + (dark ? ' dark' : '')} style={span ? { gridColumn: 'span ' + span } : undefined}>
      <label>{label}</label>
      {children}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
function TextInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} {...rest} />;
}
function TextArea({ value, onChange, placeholder, rows = 4, ...rest }) {
  return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} {...rest} />;
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}
function ConfirmedToggle({ value, onChange }) {
  return (
    <label className="toggle-row" style={{ alignSelf: 'center' }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      Mark as confirmed
    </label>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
function EmptyState({ icon = 'scroll', title, body, action, dark }) {
  return (
    <div className={'empty-state' + (dark ? ' dark' : '')}>
      <div className="glyph"><Icon name={icon} size={20} /></div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action || null}
    </div>
  );
}

// ── Image placeholder slot (designed empty state for image fields) ───────
function ImageSlot({ label = 'Image placeholder', height = 200 }) {
  return (
    <div
      style={{
        height,
        background: 'oklch(0.93 0.018 80 / 0.55)',
        border: '1.5px dashed var(--paper-3)',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-mute)',
        gap: 8,
        textAlign: 'center',
        padding: 12,
      }}
    >
      <Icon name="image" size={26} stroke={1.4} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Plate · placeholder</div>
      <div style={{ fontStyle: 'italic', fontSize: 14 }}>{label}</div>
    </div>
  );
}

// ── Section frame ────────────────────────────────────────────────────────
function Section({ children }) {
  return <div className="section">{children}</div>;
}

// ── TBD banner ───────────────────────────────────────────────────────────
function TbdBanner({ message, onDismiss }) {
  return (
    <div className="tbd-banner">
      <span className="lbl">Note</span>
      <span>{message}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

// ── Confirmed vs Pending toggle on a card ────────────────────────────────
function StatusToggle({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <button
        className={'btn small on-paper ' + (value === 'confirmed' ? 'primary' : 'ghost')}
        onClick={() => onChange('confirmed')}
      >Confirmed</button>
      <button
        className={'btn small on-paper ' + (value === 'pending' ? 'primary' : 'ghost')}
        onClick={() => onChange('pending')}
      >Pending</button>
    </div>
  );
}

// expose
Object.assign(window, {
  Icon, DocCode, DocHead, SectionMark, StatusPill, Attrib,
  Modal, ConfirmDialog,
  Field, TextInput, TextArea, Select, ConfirmedToggle,
  EmptyState, ImageSlot, Section, TbdBanner, StatusToggle,
});
