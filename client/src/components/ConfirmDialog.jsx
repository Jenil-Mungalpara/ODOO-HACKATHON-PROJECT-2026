import { MdWarning } from 'react-icons/md';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', confirmLabel = 'Confirm', variant = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
            {variant === 'danger' ? <MdWarning style={{ color: 'var(--danger)' }} /> : '❓'}
          </div>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p className="text-muted">{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
