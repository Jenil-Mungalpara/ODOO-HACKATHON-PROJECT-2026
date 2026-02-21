export default function KPICard({ title, value, delta, icon, color = 'blue', sparkline, sub, onClick }) {
  return (
    <div className={`kpi-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      {icon && <div className={`kpi-icon ${color}`}>{icon}</div>}
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{title}</div>
      {delta !== undefined && (
        <div className={`kpi-trend ${delta >= 0 ? 'up' : 'down'}`}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
        </div>
      )}
      {sub && <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
      {sparkline && (
        <div className="kpi-sparkline">
          <svg viewBox="0 0 60 20" width="60" height="20">
            <polyline
              fill="none"
              stroke={color === 'green' ? '#0d904f' : color === 'orange' ? '#e37400' : '#1a73e8'}
              strokeWidth="1.5"
              points={sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 60},${20 - (v / Math.max(...sparkline)) * 18}`).join(' ')}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
