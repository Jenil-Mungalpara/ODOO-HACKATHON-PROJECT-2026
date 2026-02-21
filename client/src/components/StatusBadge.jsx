export default function StatusBadge({ status }) {
  const cls = status?.toLowerCase().replace(/\s+/g, '-') || 'draft';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}
