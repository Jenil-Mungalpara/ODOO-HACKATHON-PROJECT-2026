export default function SafetyGauge({ value = 0, size = 100, label = 'Safety Score' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 85 ? '#0d904f' : value >= 70 ? '#e37400' : '#ea4335';

  return (
    <div className="safety-gauge" style={{ width: size, textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f3f4" strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Center text */}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="1.4em" fontWeight="700" fill={color}>
          {value}%
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="0.6em" fill="#5f6368">
          {label}
        </text>
      </svg>
    </div>
  );
}
