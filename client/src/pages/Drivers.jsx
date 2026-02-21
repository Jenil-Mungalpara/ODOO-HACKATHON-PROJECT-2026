import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MdAdd, MdEdit, MdBlock, MdCheckCircle, MdGavel } from 'react-icons/md';
import {
  DRIVERS_TITLE, DRIVERS_ADD_BTN, DRIVER_FORM_TITLE,
  DRIVER_NAME_LABEL, DRIVER_NAME_PH, DRIVER_LICENSE_LABEL, DRIVER_LICENSE_PH,
  DRIVER_EXPIRY_LABEL, DRIVER_CONTACT_LABEL, DRIVER_CONTACT_PH,
  SAFETY_SCORE_LABEL, SAFETY_GAUGE_TOOLTIP, DRIVER_LICENSE_HINT, DRIVER_STATUS_HINT,
  SUSPEND_TITLE, SUSPEND_BODY, BAN_TITLE, BAN_BODY,
  BTN_CANCEL, formatDate, TOOLTIP_SAFETY_SCORE
} from '../utils/copy';

const emptyDriver = { name: '', license_number: '', license_expiry_date: '', contact: '', status: 'On Duty', safety_score_pct: 100, incidents: 0 };

export default function Drivers() {
  const { isRole } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDriver);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    API.get('/drivers').then(r => setDrivers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter ? drivers.filter(d => d.status === filter) : drivers;

  const openCreate = () => { setEditing(null); setForm(emptyDriver); setError(''); setModal(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name, license_number: d.license_number,
      license_expiry_date: d.license_expiry_date?.slice(0, 10) || '',
      contact: d.contact || '', status: d.status,
      safety_score_pct: d.safety_score_pct, incidents: d.incidents
    });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, safety_score_pct: Number(form.safety_score_pct), incidents: Number(form.incidents) };
      if (editing) {
        await API.put(`/drivers/${editing._id}`, data);
      } else {
        await API.post('/drivers', data);
      }
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm(`${SUSPEND_TITLE}\n\n${SUSPEND_BODY}`)) return;
    try { await API.post(`/drivers/${id}/suspend`); load(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleBan = async (id) => {
    if (!confirm(`${BAN_TITLE}\n\n${BAN_BODY}`)) return;
    try { await API.post(`/drivers/${id}/ban`); load(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleReinstate = async (id) => {
    try { await API.post(`/drivers/${id}/reinstate`); load(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  const columns = [
    { key: 'name', label: DRIVER_NAME_LABEL },
    { key: 'license_number', label: DRIVER_LICENSE_LABEL },
    { key: 'license_expiry_date', label: DRIVER_EXPIRY_LABEL, render: (val) => {
      const expired = isExpired(val);
      return <span style={{ color: expired ? 'var(--danger)' : undefined, fontWeight: expired ? 600 : undefined }}>
        {formatDate(val)}{expired ? ' ⚠️ EXPIRED' : ''}
      </span>;
    }},
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'safety_score_pct', label: SAFETY_SCORE_LABEL, render: (val) => {
      const color = val >= 85 ? 'var(--success)' : val >= 70 ? 'var(--warning)' : 'var(--danger)';
      return <strong style={{ color }} title={SAFETY_GAUGE_TOOLTIP}>{val}%</strong>;
    }},
    { key: 'completion_rate', label: 'Completion', render: (val, row) => {
      const rate = row.total_trips_assigned > 0 ? Math.round((row.trips_completed / row.total_trips_assigned) * 100) : 100;
      return `${rate}% (${row.trips_completed}/${row.total_trips_assigned})`;
    }},
    { key: 'incidents', label: 'Incidents', type: 'number' },
    ...(isRole('Safety Officer') ? [{
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-8">
          <button className="btn-icon" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(row); }}><MdEdit /></button>
          {row.status !== 'Suspended' && row.status !== 'Banned' && (
            <button className="btn-icon" title="Suspend" onClick={(e) => { e.stopPropagation(); handleSuspend(row._id); }}><MdBlock /></button>
          )}
          {row.status === 'Suspended' && (
            <>
              <button className="btn-icon" title="Reinstate" onClick={(e) => { e.stopPropagation(); handleReinstate(row._id); }}><MdCheckCircle /></button>
              <button className="btn-icon" title="Ban" onClick={(e) => { e.stopPropagation(); handleBan(row._id); }}><MdGavel /></button>
            </>
          )}
        </div>
      )
    }] : [])
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>{DRIVERS_TITLE}</h1>
        {isRole('Safety Officer') && <button className="btn btn-primary" onClick={openCreate}><MdAdd /> {DRIVERS_ADD_BTN}</button>}
      </div>

      <div className="filters-bar">
        {['', 'On Duty', 'Off Duty', 'Suspended', 'Banned'].map(s => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} onRowClick={(d) => setDetailModal(d)} emptyMessage="No drivers yet. Add your first driver." />
      </div>

      {/* Safety Profile Detail */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name || ''}>
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="kpi-card"><div className="kpi-value">{detailModal.safety_score_pct}%</div><div className="kpi-label">{SAFETY_SCORE_LABEL}</div></div>
              <div className="kpi-card"><div className="kpi-value">{detailModal.incidents}</div><div className="kpi-label">Incidents</div></div>
              <div className="kpi-card"><div className="kpi-value">{detailModal.trips_completed}/{detailModal.total_trips_assigned}</div><div className="kpi-label">Trips Completed</div></div>
              <div className="kpi-card"><div className="kpi-value">{detailModal.warnings || 0}</div><div className="kpi-label">Warnings</div></div>
            </div>
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <p className="text-sm"><strong>License:</strong> {detailModal.license_number}</p>
              <p className="text-sm"><strong>Expiry:</strong> {formatDate(detailModal.license_expiry_date)} {isExpired(detailModal.license_expiry_date) ? '⚠️ EXPIRED' : ''}</p>
              <p className="text-sm text-muted" style={{ marginTop: 4 }}>{DRIVER_LICENSE_HINT}</p>
              <p className="text-sm"><strong>Contact:</strong> {detailModal.contact || '—'}</p>
              <p className="text-sm"><strong>Status:</strong> <span style={{ marginLeft: 4 }}><StatusBadge status={detailModal.status} /></span></p>
              <p className="text-sm text-muted" style={{ marginTop: 4 }}>{DRIVER_STATUS_HINT}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Driver' : DRIVER_FORM_TITLE}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>{BTN_CANCEL}</button><button className="btn btn-primary" form="driverForm">{editing ? 'Update' : 'Confirm'}</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <form id="driverForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{DRIVER_NAME_LABEL}</label>
            <input className="form-input" placeholder={DRIVER_NAME_PH} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{DRIVER_LICENSE_LABEL}</label>
              <input className="form-input" placeholder={DRIVER_LICENSE_PH} value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">{DRIVER_EXPIRY_LABEL}</label>
              <input type="date" className="form-input" value={form.license_expiry_date} onChange={e => setForm({...form, license_expiry_date: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{DRIVER_CONTACT_LABEL}</label>
              <input className="form-input" placeholder={DRIVER_CONTACT_PH} value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>On Duty</option><option>Off Duty</option><option>Suspended</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{SAFETY_SCORE_LABEL} (%)</label>
              <input type="number" className="form-input" value={form.safety_score_pct} onChange={e => setForm({...form, safety_score_pct: e.target.value})} min="0" max="100" title={TOOLTIP_SAFETY_SCORE} />
            </div>
            <div className="form-group">
              <label className="form-label">Incidents</label>
              <input type="number" className="form-input" value={form.incidents} onChange={e => setForm({...form, incidents: e.target.value})} min="0" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
