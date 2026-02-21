import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveAlert } from '../api/analytics';
import {
  RULE_BREAKER_HEADING, RULE_BREAKER_EMPTY, SEVERITY_LABELS,
  ALERT_RESOLVE_PH
} from '../utils/copy';
import { MdWarning, MdInfo, MdError, MdCheck, MdOpenInNew } from 'react-icons/md';

const iconMap = {
  info: <MdInfo color="#1a73e8" />,
  warning: <MdWarning color="#e37400" />,
  critical: <MdError color="#ea4335" />,
};

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RuleBreakerFeed({ alerts = [], onAlertResolved }) {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(null);

  const handleResolve = async (alert) => {
    const note = prompt(ALERT_RESOLVE_PH);
    if (note === null) return;
    setResolving(alert._id);
    try {
      await resolveAlert(alert._id, note);
      onAlertResolved?.(alert._id);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to resolve alert.');
    } finally {
      setResolving(null);
    }
  };

  const handleViewEntity = (alert) => {
    // Support both persisted alerts (entity_type) and live alerts (entity)
    const type = (alert.entity_type || alert.entity || '').toLowerCase();
    const id = alert.entity_id || alert.entityId;
    if (type === 'vehicle' && id) navigate(`/vehicles/${id}`);
    else if (type === 'driver') navigate('/drivers');
    else if (type === 'trip') navigate('/trips');
    else if (type === 'maintenance') navigate('/maintenance');
    else navigate('/dashboard');
  };

  return (
    <div className="card">
      <div className="card-header">{RULE_BREAKER_HEADING}</div>
      <div className="card-body" style={{ maxHeight: 420, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p className="text-muted">{RULE_BREAKER_EMPTY}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a, i) => {
              const severity = a.severity || 'info';
              const bg = severity === 'critical' ? '#fce8e6' : severity === 'warning' ? '#fef7e0' : '#e8f0fe';
              return (
                <div key={a._id || i} style={{ padding: '10px 14px', borderRadius: 8, background: bg, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {iconMap[severity] || iconMap.info}
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', flex: 1 }}>
                      {SEVERITY_LABELS[severity] || 'Info'} — {a.title || a.type}
                    </span>
                    <span className="text-muted text-sm">{timeAgo(a.createdAt)}</span>
                  </div>
                  <div className="text-sm">{a.message}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    {a._id && !a.resolved && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleResolve(a)}
                        disabled={resolving === a._id}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <MdCheck /> Resolve
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleViewEntity(a)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <MdOpenInNew /> View entity
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
