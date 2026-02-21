import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MdAdd, MdCheck } from 'react-icons/md';
import {
  MAINTENANCE_TITLE, MAINTENANCE_ADD_BTN, MAINTENANCE_OPEN_HINT,
  MAINTENANCE_COMPLETE_CONFIRM, BTN_CANCEL, formatDate, formatCurrency
} from '../utils/copy';

export default function Maintenance() {
  const { isRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ vehicle: '', service_type: 'Oil Change', service_date: new Date().toISOString().slice(0, 10), odometer_at_service: '', description: '', cost: '', status: 'Open' });

  const load = () => {
    Promise.all([API.get('/maintenance'), API.get('/vehicles')])
      .then(([mRes, vRes]) => { setLogs(mRes.data.data); setVehicles(vRes.data.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter ? logs.filter(l => l.status === filter) : logs;

  const openCreate = () => {
    setForm({ vehicle: vehicles[0]?._id || '', service_type: 'Oil Change', service_date: new Date().toISOString().slice(0, 10), odometer_at_service: '', description: '', cost: '', status: 'Open' });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/maintenance', { ...form, cost: Number(form.cost) || 0, odometer_at_service: Number(form.odometer_at_service) || 0 });
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm(MAINTENANCE_COMPLETE_CONFIRM)) return;
    try { await API.post(`/maintenance/${id}/complete`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key: 'vehicle', label: 'Vehicle', render: (v) => v ? `${v.name_model} (${v.license_plate})` : '—' },
    { key: 'service_type', label: 'Service type' },
    { key: 'service_date', label: 'Service date', type: 'date' },
    { key: 'odometer_at_service', label: 'Odometer at service', type: 'number' },
    { key: 'cost', label: 'Cost', render: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'description', label: 'Description', render: (v) => v?.substring(0, 40) || '—' },
    ...(isRole('Fleet Manager') ? [{
      key: 'actions', label: '', render: (_, row) => row.status === 'Open' ? (
        <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); handleComplete(row._id); }}><MdCheck /> Complete</button>
      ) : null
    }] : [])
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>{MAINTENANCE_TITLE}</h1>
        {isRole('Fleet Manager') && <button className="btn btn-primary" onClick={openCreate}><MdAdd /> {MAINTENANCE_ADD_BTN}</button>}
      </div>

      <div className="filters-bar">
        {['', 'Open', 'Completed'].map(s => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} onRowClick={(row) => setDetailModal(row)} emptyMessage="No maintenance records yet." />
      </div>

      {/* Detail Popup */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Service — ${detailModal?.service_type || ''}`}>
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="kpi-card"><div className="kpi-value">{formatCurrency(detailModal.cost)}</div><div className="kpi-label">Cost</div></div>
              <div className="kpi-card"><div className="kpi-value"><StatusBadge status={detailModal.status} /></div><div className="kpi-label">Status</div></div>
              <div className="kpi-card"><div className="kpi-value">{detailModal.odometer_at_service?.toLocaleString() || 0}<span className="text-sm text-muted"> km</span></div><div className="kpi-label">Odometer at Service</div></div>
              <div className="kpi-card"><div className="kpi-value">{formatDate(detailModal.service_date)}</div><div className="kpi-label">Service Date</div></div>
            </div>
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <p className="text-sm"><strong>Vehicle:</strong> {detailModal.vehicle?.name_model || '—'} ({detailModal.vehicle?.license_plate || '—'})</p>
              <p className="text-sm"><strong>Service Type:</strong> {detailModal.service_type}</p>
              <p className="text-sm"><strong>Description:</strong> {detailModal.description || 'No description provided.'}</p>
            </div>
            {detailModal.status === 'Open' && isRole('Fleet Manager') && (
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-success btn-sm" onClick={() => { setDetailModal(null); handleComplete(detailModal._id); }}><MdCheck /> Mark as Completed</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={MAINTENANCE_ADD_BTN}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>{BTN_CANCEL}</button><button className="btn btn-primary" form="maintForm">Confirm</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-hint" style={{ marginBottom: 12, padding: '8px 12px', background: '#fff3cd', borderRadius: 6, fontSize: '0.8125rem' }}>{MAINTENANCE_OPEN_HINT}</div>
        <form id="maintForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Vehicle</label>
            <select className="form-select" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} required>
              <option value="">Select vehicle</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.name_model} ({v.license_plate})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service type</label>
              <select className="form-select" value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}>
                {['Oil Change', 'Tire Replacement', 'Engine Repair', 'General Service'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Service date</label>
              <input type="date" className="form-input" value={form.service_date} onChange={e => setForm({...form, service_date: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Odometer at service</label>
              <input type="number" className="form-input" placeholder="0" value={form.odometer_at_service} onChange={e => setForm({...form, odometer_at_service: e.target.value})} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Cost</label>
              <input type="number" className="form-input" placeholder="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional details" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
