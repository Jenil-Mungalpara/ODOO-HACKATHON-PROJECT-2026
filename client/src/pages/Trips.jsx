import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MdAdd, MdPlayArrow, MdCheck, MdCancel, MdArrowForward, MdArrowBack } from 'react-icons/md';
import {
  TRIPS_TITLE, TRIPS_NEW_BTN, TRIPS_EMPTY, TRIP_WIZARD_TITLE,
  WIZARD_STEP_1, WIZARD_STEP_2, WIZARD_STEP_3,
  WIZARD_STEP_1_HINT, WIZARD_STEP_2_HINT, WIZARD_STEP_3_HINT,
  DISPATCH_CONFIRM, TIMELINE_TITLE, TRIP_LOCKED, BTN_CANCEL,
  formatDate, formatCurrency, TOOLTIP_DISPATCH
} from '../utils/copy';

export default function Trips() {
  const { isRole } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ pickup_location: '', delivery_location: '', cargo_weight_kg: '', distance_km: '', revenue: '', expected_start_date: '', expected_delivery_date: '' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [eligibleDrivers, setEligibleDrivers] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    API.get('/trips').then(r => setTrips(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter ? trips.filter(t => t.status === filter) : trips;

  const openWizard = () => {
    setStep(1);
    setForm({ pickup_location: '', delivery_location: '', cargo_weight_kg: '', distance_km: '', revenue: '', estimated_fuel_cost: '', expected_start_date: '', expected_delivery_date: '' });
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setError('');
    setWizardOpen(true);
  };

  const goStep2 = async () => {
    if (!form.pickup_location || !form.delivery_location || !form.cargo_weight_kg) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.expected_delivery_date && form.expected_start_date && new Date(form.expected_delivery_date) < new Date(form.expected_start_date)) {
      setError('Delivery date must be same or after start date.');
      return;
    }
    setError('');
    try {
      const [vRes, dRes] = await Promise.all([API.get('/vehicles/available'), API.get('/drivers/eligible')]);
      setAvailableVehicles(vRes.data.data);
      setEligibleDrivers(dRes.data.data);
      setStep(2);
    } catch (err) {
      setError('Failed to load available vehicles/drivers.');
    }
  };

  const goStep3 = () => {
    if (!selectedVehicle || !selectedDriver) {
      setError('Please select both a vehicle and a driver.');
      return;
    }
    // Overweight check
    if (Number(form.cargo_weight_kg) > selectedVehicle.max_capacity_kg) {
      setError(`Overweight: selected vehicle capacity is ${selectedVehicle.max_capacity_kg} kg. Reduce cargo or choose a larger vehicle.`);
      return;
    }
    setError('');
    setStep(3);
  };

  const handleCreate = async (asDraft = true) => {
    setError('');
    try {
      await API.post('/trips', {
        ...form,
        cargo_weight_kg: Number(form.cargo_weight_kg),
        distance_km: Number(form.distance_km) || 0,
        revenue: Number(form.revenue) || 0,
        estimated_fuel_cost: Number(form.estimated_fuel_cost) || 0,
        assigned_vehicle: selectedVehicle?._id || null,
        assigned_driver: selectedDriver?._id || null,
        status: asDraft ? 'Draft' : 'Dispatched'
      });
      setWizardOpen(false);
      load();
    } catch (err) {
      const msgs = err.response?.data?.errors || [err.response?.data?.message || 'Error creating trip.'];
      setError(Array.isArray(msgs) ? msgs.join('\n') : msgs);
    }
  };

  const handleDispatch = async (id) => {
    if (!confirm(DISPATCH_CONFIRM)) return;
    try { await API.post(`/trips/${id}/dispatch`); load(); }
    catch (err) {
      const msgs = err.response?.data?.errors;
      alert(msgs ? msgs.join('\n') : err.response?.data?.message || 'Error');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Change status to Completed?')) return;
    try { await API.post(`/trips/${id}/complete`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Change status to Cancelled?')) return;
    try { await API.post(`/trips/${id}/cancel`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key: 'trip_code', label: 'Trip Code' },
    { key: 'pickup_location', label: 'Pickup location' },
    { key: 'delivery_location', label: 'Delivery location' },
    { key: 'cargo_weight_kg', label: 'Cargo weight (kg)', type: 'number' },
    { key: 'assigned_vehicle', label: 'Vehicle', render: (v) => v?.name_model || '—' },
    { key: 'assigned_driver', label: 'Driver', render: (d) => d?.name || '—' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'revenue', label: 'Estimated revenue', render: (v) => formatCurrency(v) },
    ...(isRole('Dispatcher') ? [{
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-8" onClick={e => e.stopPropagation()}>
          {row.status === 'Draft' && <button className="btn btn-sm btn-primary" title={TOOLTIP_DISPATCH} onClick={() => handleDispatch(row._id)}><MdPlayArrow /> {DISPATCH_CONFIRM}</button>}
          {row.status === 'Dispatched' && <button className="btn btn-sm btn-success" onClick={() => handleComplete(row._id)}><MdCheck /> Complete</button>}
          {row.status !== 'Completed' && row.status !== 'Cancelled' && <button className="btn btn-sm btn-secondary" onClick={() => handleCancel(row._id)}><MdCancel /></button>}
        </div>
      )
    }] : [])
  ];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>{TRIPS_TITLE}</h1>
        {isRole('Dispatcher') && <button className="btn btn-primary" onClick={openWizard}><MdAdd /> {TRIPS_NEW_BTN}</button>}
      </div>

      <div className="filters-bar">
        {['', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map(s => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={filtered} onRowClick={(t) => setDetailModal(t)} emptyMessage={TRIPS_EMPTY} />
      </div>

      {/* Trip Detail with Timeline */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Trip ${detailModal?.trip_code}`} large>
        {detailModal && (
          <div>
            {detailModal.status === 'Completed' && (
              <div style={{ background: '#e8f0fe', borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: '0.8125rem', color: '#1a73e8' }}>
                🔒 {TRIP_LOCKED}
              </div>
            )}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div><span className="text-muted text-sm">Pickup location</span><div>{detailModal.pickup_location}</div></div>
              <div><span className="text-muted text-sm">Delivery location</span><div>{detailModal.delivery_location}</div></div>
            </div>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div><span className="text-muted text-sm">Cargo weight (kg)</span><div>{detailModal.cargo_weight_kg} kg</div></div>
              <div><span className="text-muted text-sm">Distance (km)</span><div>{detailModal.distance_km} km</div></div>
            </div>
            <div className="form-row" style={{ marginBottom: 24 }}>
              <div><span className="text-muted text-sm">Vehicle</span><div>{detailModal.assigned_vehicle?.name_model || '—'}</div></div>
              <div><span className="text-muted text-sm">Driver</span><div>{detailModal.assigned_driver?.name || '—'}</div></div>
            </div>
            <h4 style={{ marginBottom: 12 }}>{TIMELINE_TITLE}</h4>
            <div className="timeline">
              <div className={`timeline-item ${['Draft', 'Dispatched', 'Completed'].includes(detailModal.status) ? 'completed' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">Draft</div>
                <div className="timeline-date">{formatDate(detailModal.createdAt)}</div>
              </div>
              <div className={`timeline-item ${['Dispatched', 'Completed'].includes(detailModal.status) ? 'completed' : detailModal.status === 'Draft' ? 'active' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">Dispatched</div>
                <div className="timeline-date">{detailModal.actual_start_date ? formatDate(detailModal.actual_start_date) : 'Pending'}</div>
              </div>
              <div className={`timeline-item ${detailModal.status === 'Completed' ? 'completed' : detailModal.status === 'Dispatched' ? 'active' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-label">Completed</div>
                <div className="timeline-date">{detailModal.actual_delivery_date ? formatDate(detailModal.actual_delivery_date) : 'Pending'}</div>
              </div>
              {detailModal.status === 'Cancelled' && (
                <div className="timeline-item completed">
                  <div className="timeline-dot" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} />
                  <div className="timeline-label" style={{ color: 'var(--danger)' }}>Cancelled</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Trip Creation Wizard */}
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title={TRIP_WIZARD_TITLE} large>
        <div className="wizard-steps">
          <div className={`wizard-step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
            <div className="wizard-step-number">{step > 1 ? '✓' : '1'}</div>
            <div className="wizard-step-label">{WIZARD_STEP_1}</div>
          </div>
          <div className={`wizard-connector ${step > 1 ? 'completed' : ''}`} />
          <div className={`wizard-step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
            <div className="wizard-step-number">{step > 2 ? '✓' : '2'}</div>
            <div className="wizard-step-label">{WIZARD_STEP_2}</div>
          </div>
          <div className={`wizard-connector ${step > 2 ? 'completed' : ''}`} />
          <div className={`wizard-step ${step === 3 ? 'active' : ''}`}>
            <div className="wizard-step-number">3</div>
            <div className="wizard-step-label">{WIZARD_STEP_3}</div>
          </div>
        </div>

        {error && <div className="auth-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>}

        {step === 1 && (
          <div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{WIZARD_STEP_1_HINT}</p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup location *</label>
                <input className="form-input" value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} placeholder="e.g., Warehouse A, Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery location *</label>
                <input className="form-input" value={form.delivery_location} onChange={e => setForm({...form, delivery_location: e.target.value})} placeholder="e.g., Store 23, Surat" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cargo weight (kg) *</label>
                <input type="number" className="form-input" placeholder="0" value={form.cargo_weight_kg} onChange={e => setForm({...form, cargo_weight_kg: e.target.value})} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Distance (km)</label>
                <input type="number" className="form-input" placeholder="Optional" value={form.distance_km} onChange={e => setForm({...form, distance_km: e.target.value})} min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expected start date</label>
                <input type="datetime-local" className="form-input" value={form.expected_start_date} onChange={e => setForm({...form, expected_start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected delivery date</label>
                <input type="datetime-local" className="form-input" value={form.expected_delivery_date} onChange={e => setForm({...form, expected_delivery_date: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estimated revenue</label>
                <input type="number" className="form-input" placeholder="Optional" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated fuel cost</label>
                <input type="number" className="form-input" placeholder="Optional" value={form.estimated_fuel_cost} onChange={e => setForm({...form, estimated_fuel_cost: e.target.value})} min="0" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={goStep2}>Next <MdArrowForward /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{WIZARD_STEP_2_HINT}</p>
            <h4 style={{ marginBottom: 12 }}>Select Vehicle <span className="text-muted text-sm">(Only Available vehicles shown)</span></h4>
            {availableVehicles.length === 0 ? (
              <div className="empty-state" style={{ padding: 16 }}><p>No available vehicles.</p></div>
            ) : (
              <div className="selection-grid" style={{ marginBottom: 24 }}>
                {availableVehicles.map(v => (
                  <div key={v._id} className={`selection-card ${selectedVehicle?._id === v._id ? 'selected' : ''}`} onClick={() => setSelectedVehicle(v)}>
                    <div className="sc-name">{v.name_model}</div>
                    <div className="sc-detail">{v.license_plate} · {v.type} · Max {v.max_capacity_kg.toLocaleString()} kg</div>
                    {Number(form.cargo_weight_kg) > v.max_capacity_kg && (
                      <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4 }}>⚠ Cargo exceeds capacity!</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <h4 style={{ marginBottom: 12 }}>Select Driver <span className="text-muted text-sm">(Only On Duty with valid license)</span></h4>
            {eligibleDrivers.length === 0 ? (
              <div className="empty-state" style={{ padding: 16 }}><p>No eligible drivers.</p></div>
            ) : (
              <div className="selection-grid">
                {eligibleDrivers.map(d => (
                  <div key={d._id} className={`selection-card ${selectedDriver?._id === d._id ? 'selected' : ''}`} onClick={() => setSelectedDriver(d)}>
                    <div className="sc-name">{d.name}</div>
                    <div className="sc-detail">Safety: {d.safety_score_pct}% · {d.trips_completed} trips</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setError(''); }}><MdArrowBack /> Back</button>
              <button className="btn btn-primary" onClick={goStep3}>Next <MdArrowForward /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{WIZARD_STEP_3_HINT}</p>
            <h4 style={{ marginBottom: 16 }}>Confirm Trip Details</h4>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">
                <div className="form-row" style={{ marginBottom: 8 }}>
                  <div><span className="text-muted text-sm">Pickup</span><div>{form.pickup_location}</div></div>
                  <div><span className="text-muted text-sm">Delivery</span><div>{form.delivery_location}</div></div>
                </div>
                <div className="form-row" style={{ marginBottom: 8 }}>
                  <div><span className="text-muted text-sm">Cargo</span><div>{form.cargo_weight_kg} kg</div></div>
                  <div><span className="text-muted text-sm">Revenue</span><div>{formatCurrency(form.revenue || 0)}</div></div>
                </div>
                <div className="form-row">
                  <div><span className="text-muted text-sm">Vehicle</span><div><strong>{selectedVehicle?.name_model}</strong> ({selectedVehicle?.license_plate})</div></div>
                  <div><span className="text-muted text-sm">Driver</span><div><strong>{selectedDriver?.name}</strong></div></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => { setStep(2); setError(''); }}><MdArrowBack /> Back</button>
              <div className="flex gap-8">
                <button className="btn btn-outline" onClick={() => handleCreate(true)}>Save as Draft</button>
                <button className="btn btn-primary" onClick={() => handleCreate(false)} title={TOOLTIP_DISPATCH}>{DISPATCH_CONFIRM} <MdPlayArrow /></button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
