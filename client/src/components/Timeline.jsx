export default function Timeline({ stages = [], currentStatus = '' }) {
  const statusIndex = stages.findIndex(s => s.key === currentStatus);

  return (
    <div className="timeline">
      {stages.map((stage, i) => {
        const isCompleted = i < statusIndex || (i === statusIndex && stage.key === 'Completed');
        const isActive = i === statusIndex && stage.key !== 'Completed';
        const isCancelled = stage.key === 'Cancelled';

        return (
          <div key={i} className={`timeline-item ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
            <div
              className="timeline-dot"
              style={isCancelled && currentStatus === 'Cancelled' ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : undefined}
            />
            <div className="timeline-label" style={isCancelled && currentStatus === 'Cancelled' ? { color: 'var(--danger)' } : undefined}>
              {stage.label}
            </div>
            {stage.date && (
              <div className="timeline-date">
                {new Date(stage.date).toLocaleString()}
              </div>
            )}
            {!stage.date && <div className="timeline-date">Pending</div>}
          </div>
        );
      })}
    </div>
  );
}
