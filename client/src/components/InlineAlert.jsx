import { MdInfo, MdWarning, MdError, MdCheckCircle, MdClose } from 'react-icons/md';
import { useState } from 'react';

const ICONS = {
  info: <MdInfo />,
  success: <MdCheckCircle />,
  warning: <MdWarning />,
  error: <MdError />,
};

const COLORS = {
  info: { bg: '#e8f0fe', border: '#1a73e8', text: '#174ea6', icon: '#1a73e8' },
  success: { bg: '#e6f4ea', border: '#0d904f', text: '#137333', icon: '#0d904f' },
  warning: { bg: '#fef7e0', border: '#e37400', text: '#7a4100', icon: '#e37400' },
  error: { bg: '#fce8e6', border: '#ea4335', text: '#a50e0e', icon: '#ea4335' },
};

export default function InlineAlert({ type = 'info', message, children, dismissible = false }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const colors = COLORS[type] || COLORS.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 16px', borderRadius: 8,
      background: colors.bg, borderLeft: `4px solid ${colors.border}`,
      color: colors.text, fontSize: '0.875rem', marginBottom: 16,
    }}>
      <span style={{ color: colors.icon, fontSize: '1.2rem', marginTop: 1, flexShrink: 0 }}>{ICONS[type]}</span>
      <div style={{ flex: 1 }}>{message || children}</div>
      {dismissible && (
        <button onClick={() => setVisible(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.text, padding: 0, fontSize: '1.1rem' }}>
          <MdClose />
        </button>
      )}
    </div>
  );
}
