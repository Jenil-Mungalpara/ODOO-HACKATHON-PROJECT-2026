import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, SEARCH_PLACEHOLDER, EMPTY_STATE_TITLE, EMPTY_STATE_HELP } from '../utils/copy';

export default function DataTable({ columns, data, onRowClick, emptyMessage, searchable = true }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [query, setQuery] = useState('');

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Client-side text search across all visible string fields
  const searched = query
    ? (data || []).filter(row =>
        columns.some(col => {
          const raw = row[col.key];
          const text = typeof raw === 'object' && raw !== null
            ? Object.values(raw).join(' ')
            : String(raw ?? '');
          return text.toLowerCase().includes(query.toLowerCase());
        })
      )
    : (data || []);

  const sorted = [...searched].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol] ?? '';
    const bVal = b[sortCol] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p style={{ fontWeight: 500 }}>{emptyMessage || EMPTY_STATE_TITLE}</p>
        <p className="text-muted text-sm">{EMPTY_STATE_HELP}</p>
      </div>
    );
  }

  return (
    <div>
      {searchable && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <input
            className="form-input"
            placeholder={SEARCH_PLACEHOLDER}
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ maxWidth: 340 }}
            aria-label="Search table"
          />
        </div>
      )}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer' }}>
                  {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No matching results.</td></tr>
            ) : sorted.map((row, i) => (
              <tr key={row._id || i} onClick={() => onRowClick?.(row)} aria-label={`Open details for ${row.name || row.name_model || row.trip_code || ''}`}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) :
                     col.type === 'badge' ? <StatusBadge status={row[col.key]} /> :
                     col.type === 'date' ? formatDate(row[col.key]) :
                     col.type === 'number' ? (row[col.key]?.toLocaleString() ?? '—') :
                     row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
