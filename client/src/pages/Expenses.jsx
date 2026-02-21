import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MdAdd, MdFileDownload, MdCheckCircle, MdDone } from 'react-icons/md';
import {
  EXPENSES_TITLE, EXPENSES_ADD_BTN, BTN_CANCEL,
  formatDate, formatCurrency
} from '../utils/copy';

export default function Expenses() {
  const { isRole } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ trip: '', distance_covered_km: '', fuel_liters: '', fuel_cost: '', misc_cost: '', description: '', expense_date: new Date().toISOString().slice(0,10) });

  const canManage = isRole('Financial Analyst') || isRole('Admin');

  const load = () => {
    Promise.all([API.get('/expenses'), API.get('/trips/completed')])
      .then(([eRes, tRes]) => { setExpenses(eRes.data.data); setCompletedTrips(tRes.data.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter ? expenses.filter(e => e.status === filter) : expenses;

  const openCreate = () => {
    setForm({ trip: '', distance_covered_km: '', fuel_liters: '', fuel_cost: '', misc_cost: '', description: '', expense_date: new Date().toISOString().slice(0,10) });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/expenses', {
        ...form,
        distance_covered_km: Number(form.distance_covered_km) || 0,
        fuel_liters: Number(form.fuel_liters) || 0,
        fuel_cost: Number(form.fuel_cost) || 0,
        misc_cost: Number(form.misc_cost) || 0
      });
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    const labels = { Approved: 'Approve this expense?', Recorded: 'Mark this expense as Recorded?' };
    if (!confirm(labels[newStatus] || `Change status to ${newStatus}?`)) return;
    try {
      await API.put(`/expenses/${id}`, { status: newStatus });
      load();
      // Also update the detail modal if open
      if (detailModal && detailModal._id === id) {
        setDetailModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const exportCSV = () => {
    if (expenses.length === 0) return alert('No data to export.');
    const headers = ['Trip Code', 'Vehicle', 'Driver', 'Distance (km)', 'Fuel (L)', 'Fuel Cost', 'Misc Cost', 'Total', 'Date', 'Status'];
    const plainDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';
    const rows = expenses.map(e => [
      e.trip?.trip_code || '', e.vehicle?.name_model || '', e.driver?.name || '',
      e.distance_covered_km || 0,
      e.fuel_liters || 0, e.fuel_cost || 0, e.misc_cost || 0, (e.fuel_cost || 0) + (e.misc_cost || 0),
      plainDate(e.expense_date), e.status || ''
    ]);
    const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.map(quote), ...rows.map(r => r.map(quote))].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fleetflow_expenses.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const statusActions = (row) => {
    if (!canManage) return null;
    return (
      <div className="flex gap-8" onClick={e => e.stopPropagation()}>
        {row.status === 'Pending' && (
          <button className="btn btn-sm btn-success" onClick={() => updateStatus(row._id, 'Approved')} title="Approve expense">
            <MdCheckCircle /> Approve
          </button>
        )}
        {row.status === 'Approved' && (
          <button className="btn btn-sm btn-primary" onClick={() => updateStatus(row._id, 'Recorded')} title="Mark as recorded">
            <MdDone /> Record
          </button>
        )}
      </div>
    );
  };

  const columns = [
    { key: 'trip', label: 'Trip', render: (t) => t?.trip_code || '—' },
    { key: 'vehicle', label: 'Vehicle', render: (v) => v?.name_model || '—' },
    { key: 'driver', label: 'Driver', render: (d) => d?.name || '—' },
    { key: 'distance_covered_km', label: 'Distance (km)', type: 'number' },
    { key: 'fuel_liters', label: 'Fuel (liters)', type: 'number' },
    { key: 'fuel_cost', label: 'Fuel cost', render: (v) => formatCurrency(v) },
    { key: 'misc_cost', label: 'Misc cost', render: (v) => formatCurrency(v) },
    { key: 'total_cost', label: 'Total', render: (_, row) => formatCurrency((row.fuel_cost || 0) + (row.misc_cost || 0)) },
    { key: 'expense_date', label: 'Expense date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge' },
    ...(canManage ? [{ key: 'actions', label: '', render: (_, row) => statusActions(row) }] : []),
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>{EXPENSES_TITLE}</h1>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={exportCSV} title="Export CSV / PDF"><MdFileDownload /> Export CSV</button>
          {canManage && <button className="btn btn-primary" onClick={openCreate}><MdAdd /> {EXPENSES_ADD_BTN}</button>}
        </div>
      </div>

      {/* Status Filters */}
      <div className="filters-bar">
        {['', 'Pending', 'Approved', 'Recorded'].map(s => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      {/* Summary */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-value">{formatCurrency(expenses.reduce((s, e) => s + (e.fuel_cost || 0) + (e.misc_cost || 0), 0))}</div>
          <div className="kpi-label">Total Expenses</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{formatCurrency(expenses.reduce((s, e) => s + (e.fuel_cost || 0), 0))}</div>
          <div className="kpi-label">Total Fuel Cost</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value" style={{ color: '#e37400' }}>{expenses.filter(e => e.status === 'Pending').length}</div>
          <div className="kpi-label">Pending Approval</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{expenses.length}</div>
          <div className="kpi-label">Total Records</div>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} onRowClick={(row) => setDetailModal(row)} emptyMessage="No expenses recorded yet." />
      </div>

      {/* Detail Popup */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Expense — ${detailModal?.trip?.trip_code || 'N/A'}`}>
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="kpi-card"><div className="kpi-value">{formatCurrency((detailModal.fuel_cost || 0) + (detailModal.misc_cost || 0))}</div><div className="kpi-label">Total Cost</div></div>
              <div className="kpi-card"><div className="kpi-value"><StatusBadge status={detailModal.status} /></div><div className="kpi-label">Status</div></div>
              <div className="kpi-card"><div className="kpi-value">{formatCurrency(detailModal.fuel_cost)}</div><div className="kpi-label">Fuel Cost</div></div>
              <div className="kpi-card"><div className="kpi-value">{formatCurrency(detailModal.misc_cost)}</div><div className="kpi-label">Misc Cost</div></div>
            </div>
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <p className="text-sm"><strong>Trip:</strong> {detailModal.trip?.trip_code || '—'}</p>
              <p className="text-sm"><strong>Vehicle:</strong> {detailModal.vehicle?.name_model || '—'}</p>
              <p className="text-sm"><strong>Driver:</strong> {detailModal.driver?.name || '—'}</p>
              <p className="text-sm"><strong>Distance:</strong> {detailModal.distance_covered_km || 0} km</p>
              <p className="text-sm"><strong>Fuel:</strong> {detailModal.fuel_liters || 0} liters</p>
              <p className="text-sm"><strong>Date:</strong> {formatDate(detailModal.expense_date)}</p>
              {detailModal.description && <p className="text-sm"><strong>Notes:</strong> {detailModal.description}</p>}
            </div>
            {/* Status Update Actions */}
            {canManage && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
                {detailModal.status === 'Pending' && (
                  <button className="btn btn-success btn-sm" onClick={() => { updateStatus(detailModal._id, 'Approved'); }}>
                    <MdCheckCircle /> Approve
                  </button>
                )}
                {detailModal.status === 'Approved' && (
                  <button className="btn btn-primary btn-sm" onClick={() => { updateStatus(detailModal._id, 'Recorded'); }}>
                    <MdDone /> Mark as Recorded
                  </button>
                )}
                {detailModal.status === 'Recorded' && (
                  <span className="text-sm text-muted" style={{ padding: '6px 0' }}>✅ This expense has been fully recorded.</span>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={EXPENSES_ADD_BTN}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>{BTN_CANCEL}</button><button className="btn btn-primary" form="expenseForm">Confirm</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <form id="expenseForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Trip</label>
            <select className="form-select" value={form.trip} onChange={e => setForm({...form, trip: e.target.value})} required>
              <option value="">Select Completed trip</option>
              {completedTrips.map(t => (
                <option key={t._id} value={t._id}>{t.trip_code} — {t.pickup_location} → {t.delivery_location}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Distance covered (km)</label>
              <input type="number" className="form-input" placeholder="Optional" value={form.distance_covered_km} onChange={e => setForm({...form, distance_covered_km: e.target.value})} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel (liters)</label>
              <input type="number" className="form-input" placeholder="0" value={form.fuel_liters} onChange={e => setForm({...form, fuel_liters: e.target.value})} min="0" step="0.1" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fuel cost</label>
              <input type="number" className="form-input" placeholder="0" value={form.fuel_cost} onChange={e => setForm({...form, fuel_cost: e.target.value})} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Misc cost</label>
              <input type="number" className="form-input" placeholder="0" value={form.misc_cost} onChange={e => setForm({...form, misc_cost: e.target.value})} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Expense date</label>
              <input type="date" className="form-input" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional notes…" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
