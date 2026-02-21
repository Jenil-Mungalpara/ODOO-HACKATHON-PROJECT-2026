import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import {
  VEHICLES_TITLE, VEHICLES_ADD_BTN, VEHICLES_EMPTY, VEHICLE_FORM_TITLE,
  VEHICLE_NAME_LABEL, VEHICLE_NAME_PH, VEHICLE_PLATE_LABEL, VEHICLE_PLATE_PH,
  VEHICLE_TYPE_LABEL, VEHICLE_LOAD_LABEL, VEHICLE_ODOMETER_LABEL, VEHICLE_COST_LABEL,
  VEHICLE_STATUS_LABEL, VEHICLE_ODOMETER_HINT, TOOLTIP_MAX_LOAD, TOOLTIP_ODOMETER,
  BTN_CANCEL, formatCurrency
} from '../utils/copy';

const emptyVehicle = { name_model: '', license_plate: '', type: 'Truck', max_capacity_kg: '', odometer_km: '', status: 'Available', acquisition_cost: '' };

export default function Vehicles() {
  const { isRole } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    API.get('/vehicles').then(r => setVehicles(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter ? vehicles.filter(v => v.status === filter) : vehicles;

  const openCreate = () => { setEditing(null); setForm(emptyVehicle); setError(''); setModal(true); };
  const openEdit = (v) => { setEditing(v); setForm({ name_model: v.name_model, license_plate: v.license_plate, type: v.type, max_capacity_kg: v.max_capacity_kg, odometer_km: v.odometer_km, status: v.status, acquisition_cost: v.acquisition_cost }); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, max_capacity_kg: Number(form.max_capacity_kg), odometer_km: Number(form.odometer_km), acquisition_cost: Number(form.acquisition_cost) };
      if (editing) {
        await API.put(`/vehicles/${editing._id}`, data);
      } else {
        await API.post('/vehicles', data);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await API.delete(`/vehicles/${id}`); load(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key: 'name_model', label: VEHICLE_NAME_LABEL },
    { key: 'license_plate', label: VEHICLE_PLATE_LABEL },
    { key: 'type', label: VEHICLE_TYPE_LABEL, type: 'badge' },
    { key: 'max_capacity_kg', label: VEHICLE_LOAD_LABEL, type: 'number' },
    { key: 'odometer_km', label: VEHICLE_ODOMETER_LABEL, type: 'number' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'acquisition_cost', label: VEHICLE_COST_LABEL, render: (v) => formatCurrency(v) },
    { key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-8">
          <button className="btn-icon" title="View Details" onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row._id}`); }}><MdVisibility /></button>
          {isRole('Fleet Manager') && <button className="btn-icon" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(row); }}><MdEdit /></button>}
          {isRole('Fleet Manager') && <button className="btn-icon" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }}><MdDelete /></button>}
        </div>
      )
    }
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>{VEHICLES_TITLE}</h1>
        {isRole('Fleet Manager') && <button className="btn btn-primary" onClick={openCreate}><MdAdd /> {VEHICLES_ADD_BTN}</button>}
      </div>

      <div className="filters-bar">
        {['', 'Available', 'On Trip', 'In Shop', 'Retired'].map(s => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} onRowClick={(row) => setDetailModal(row)} emptyMessage={VEHICLES_EMPTY} />
      </div>

      {/* Detail Popup */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name_model || ''}>
        {detailModal && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="kpi-card"><div className="kpi-value">{detailModal.max_capacity_kg?.toLocaleString()}<span className="text-sm text-muted"> kg</span></div><div className="kpi-label">{VEHICLE_LOAD_LABEL}</div></div>
              <div className="kpi-card"><div className="kpi-value">{detailModal.odometer_km?.toLocaleString()}<span className="text-sm text-muted"> km</span></div><div className="kpi-label">{VEHICLE_ODOMETER_LABEL}</div></div>
              <div className="kpi-card"><div className="kpi-value">{formatCurrency(detailModal.acquisition_cost)}</div><div className="kpi-label">{VEHICLE_COST_LABEL}</div></div>
              <div className="kpi-card"><div className="kpi-value"><StatusBadge status={detailModal.status} /></div><div className="kpi-label">Status</div></div>
            </div>
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-light)' }}>
              <p className="text-sm"><strong>License Plate:</strong> {detailModal.license_plate}</p>
              <p className="text-sm"><strong>Type:</strong> {detailModal.type}</p>
              <p className="text-sm text-muted" style={{ marginTop: 8 }}>{VEHICLE_ODOMETER_HINT}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => { setDetailModal(null); navigate(`/vehicles/${detailModal._id}`); }}><MdVisibility /> Full Details</button>
              {isRole('Fleet Manager') && <button className="btn btn-outline btn-sm" onClick={() => { setDetailModal(null); openEdit(detailModal); }}><MdEdit /> Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Vehicle' : VEHICLE_FORM_TITLE}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>{BTN_CANCEL}</button><button className="btn btn-primary" form="vehicleForm">{editing ? 'Update' : 'Confirm'}</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <form id="vehicleForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{VEHICLE_NAME_LABEL}</label>
            <input className="form-input" placeholder={VEHICLE_NAME_PH} value={form.name_model} onChange={e => setForm({...form, name_model: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{VEHICLE_PLATE_LABEL}</label>
              <input className="form-input" placeholder={VEHICLE_PLATE_PH} value={form.license_plate} onChange={e => setForm({...form, license_plate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">{VEHICLE_TYPE_LABEL}</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>Truck</option><option>Van</option><option>Bike</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{VEHICLE_LOAD_LABEL}</label>
              <input type="number" className="form-input" placeholder="0" value={form.max_capacity_kg} onChange={e => setForm({...form, max_capacity_kg: e.target.value})} required min="0" title={TOOLTIP_MAX_LOAD} />
            </div>
            <div className="form-group">
              <label className="form-label">{VEHICLE_ODOMETER_LABEL}</label>
              <input type="number" className="form-input" placeholder="0" value={form.odometer_km} onChange={e => setForm({...form, odometer_km: e.target.value})} min="0" title={TOOLTIP_ODOMETER} />
              <div className="form-hint">{VEHICLE_ODOMETER_HINT}</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{VEHICLE_STATUS_LABEL}</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{VEHICLE_COST_LABEL}</label>
              <input type="number" className="form-input" placeholder="0" value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} min="0" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
