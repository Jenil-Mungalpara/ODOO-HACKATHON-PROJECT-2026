import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import InlineAlert from '../components/InlineAlert';
import { MdArrowBack, MdAdd, MdBuild, MdSpeed, MdLocalShipping, MdAttachMoney } from 'react-icons/md';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRole } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ service_type: 'Oil Change', service_date: new Date().toISOString().slice(0, 10), odometer_at_service: '', description: '', cost: '', status: 'Open' });

  const load = async () => {
    try {
      const [vRes, mRes] = await Promise.all([
        API.get(`/vehicles/${id}`),
        API.get(`/maintenance?vehicle=${id}`)
      ]);
      setVehicle(vRes.data.data);
      setServiceLogs(mRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const handleAddService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/maintenance', {
        vehicle: id,
        ...form,
        cost: Number(form.cost) || 0,
        odometer_at_service: Number(form.odometer_at_service) || 0
      });
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating service log.');
    }
  };

  const handleCompleteService = async (serviceId) => {
    try {
      await API.post(`/maintenance/${serviceId}/complete`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const serviceColumns = [
    { key: 'service_type', label: 'Type' },
    { key: 'service_date', label: 'Date', type: 'date' },
    { key: 'odometer_at_service', label: 'Odometer', type: 'number' },
    { key: 'cost', label: 'Cost (₹)', type: 'number' },
    { key: 'description', label: 'Notes', render: (v) => v?.substring(0, 50) || '—' },
    { key: 'status', label: 'Status', type: 'badge' },
    ...(isRole('Fleet Manager') ? [{
      key: 'actions', label: '', render: (_, row) => row.status === 'Open' ? (
        <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); handleCompleteService(row._id); }}>Complete</button>
      ) : null
    }] : [])
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!vehicle) return <div className="empty-state"><p>Vehicle not found.</p></div>;

  const totalMaintCost = serviceLogs.reduce((s, l) => s + (l.cost || 0), 0);
  const openServices = serviceLogs.filter(l => l.status === 'Open').length;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/vehicles')}><MdArrowBack size={22} /></button>
          <div>
            <h1>{vehicle.name_model}</h1>
            <p className="text-muted text-sm">{vehicle.license_plate} · {vehicle.type}</p>
          </div>
        </div>
        {isRole('Fleet Manager') && (
          <button className="btn btn-primary" onClick={() => { setError(''); setForm({ service_type: 'Oil Change', service_date: new Date().toISOString().slice(0, 10), odometer_at_service: vehicle.odometer_km || '', description: '', cost: '', status: 'Open' }); setModal(true); }}>
            <MdAdd /> Add Service
          </button>
        )}
      </div>

      {/* Vehicle Status Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <StatusBadge status={vehicle.status} />
            <span className="text-sm text-muted">Last updated: {new Date(vehicle.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {openServices > 0 && (
        <InlineAlert type="warning" message={`${openServices} open service record(s) — vehicle may be In Shop.`} />
      )}

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPICard title="Odometer" value={`${vehicle.odometer_km?.toLocaleString()} km`} icon={<MdSpeed />} color="blue" />
        <KPICard title="Max Capacity" value={`${vehicle.max_capacity_kg?.toLocaleString()} kg`} icon={<MdLocalShipping />} color="green" />
        <KPICard title="Acquisition Cost" value={`₹${vehicle.acquisition_cost?.toLocaleString()}`} icon={<MdAttachMoney />} color="orange" />
        <KPICard title="Total Maintenance" value={`₹${totalMaintCost.toLocaleString()}`} icon={<MdBuild />} sub={`${serviceLogs.length} service records`} color="blue" />
      </div>

      {/* Service History */}
      <div className="card">
        <div className="card-header">Service History</div>
        <DataTable columns={serviceColumns} data={serviceLogs} emptyMessage="No service records for this vehicle." />
      </div>

      {/* Add Service Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Service Record"
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" form="serviceForm">Create</button></>}>
        {error && <div className="auth-error">{error}</div>}
        <form id="serviceForm" onSubmit={handleAddService}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select className="form-select" value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}>
                {['Oil Change', 'Tire Replacement', 'Engine Repair', 'Brake Service', 'General Inspection', 'Battery Replacement', 'Transmission', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.service_date} onChange={e => setForm({...form, service_date: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Odometer (km)</label>
              <input type="number" className="form-input" value={form.odometer_at_service} onChange={e => setForm({...form, odometer_at_service: e.target.value})} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Cost (₹)</label>
              <input type="number" className="form-input" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the service..." />
          </div>
        </form>
      </Modal>
    </div>
  );
}
