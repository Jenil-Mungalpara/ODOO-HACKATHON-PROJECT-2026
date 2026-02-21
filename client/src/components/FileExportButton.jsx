import { MdFileDownload } from 'react-icons/md';

export default function FileExportButton({ label = 'Export', format = 'csv', data, columns, filename = 'export', onExportPDF }) {
  const exportCSV = () => {
    if (!data || data.length === 0) return alert('No data to export.');
    const headers = columns.map(c => c.label);
    const rows = data.map(row => columns.map(c => {
      const val = c.accessor ? c.accessor(row) : row[c.key];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : (val ?? '');
    }));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClick = () => {
    if (format === 'pdf' && onExportPDF) {
      onExportPDF();
    } else {
      exportCSV();
    }
  };

  return (
    <button className="btn btn-outline" onClick={handleClick}>
      <MdFileDownload /> {label} ({format.toUpperCase()})
    </button>
  );
}
