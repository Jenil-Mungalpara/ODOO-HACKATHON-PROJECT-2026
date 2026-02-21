import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import RuleBreakerFeed from '../components/RuleBreakerFeed';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  DASHBOARD_SUBTITLE, QUICK_ACTION_BTN,
  formatCurrency, formatDate
} from '../utils/copy';
import {
  MdDirectionsCar, MdBuild, MdTrendingUp, MdLocalShipping,
  MdPeople, MdAttachMoney, MdArrowForward,
  MdFilterList
} from 'react-icons/md';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { user, isRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const canSeeAlerts = isRole('Admin') || isRole('Fleet Manager') || isRole('Safety Officer');

  useEffect(() => {
    const fetches = [
      API.get('/analytics/dashboard'),
      API.get('/trips?limit=5'),
      API.get('/vehicles'),
    ];
    if (canSeeAlerts) fetches.push(API.get('/alerts'));

    Promise.all(fetches).then(([statsRes, tripsRes, vehiclesRes, alertsRes]) => {
      setStats(statsRes.data.data);
      setRecentTrips(tripsRes.data.data?.slice(0, 5) || []);
      setVehicles(vehiclesRes.data.data || []);
      if (alertsRes) setAlerts(alertsRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // Filtered vehicles for the fleet overview table
  const filteredVehicles = vehicles.filter(v => {
    if (typeFilter && v.type !== typeFilter) return false;
    if (statusFilter) {
      // Map user-friendly labels to actual statuses
      if (statusFilter === 'Ready' && v.status !== 'Available') return false;
      if (statusFilter === 'Busy' && v.status !== 'On Trip') return false;
      if (statusFilter === 'In Shop' && v.status !== 'In Shop') return false;
    }
    return true;
  });

  // KPIs with descriptive subtitles
  const kpis = [
    {
      label: 'Active Fleet',
      value: stats?.fleet?.onTrip || 0,
      icon: <MdDirectionsCar />,
      color: 'blue',
      desc: 'Vehicles currently out on the road'
    },
    {
      label: 'Maintenance Alerts',
      value: stats?.fleet?.inShop || 0,
      icon: <MdBuild />,
      color: 'orange',
      desc: 'Vehicles stuck in the shop for repairs'
    },
    {
      label: 'Utilization Rate',
      value: `${stats?.utilizationRate || 0}%`,
      icon: <MdTrendingUp />,
      color: 'green',
      desc: 'Fleet working vs sitting empty'
    },
    {
      label: 'Pending Cargo',
      value: stats?.trips?.draft || 0,
      icon: <MdLocalShipping />,
      color: 'blue',
      desc: 'Deliveries waiting for a driver'
    },
    {
      label: 'Drivers On Duty',
      value: stats?.drivers?.onDuty || 0,
      icon: <MdPeople />,
      color: 'green',
      desc: `${stats?.drivers?.suspended || 0} suspended`
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: <MdAttachMoney />,
      color: 'green',
      desc: `${formatCurrency(stats?.totalExpenses || 0)} in expenses`
    },
  ];

  // Trip status donut
  const tripStatusData = {
    labels: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        stats?.trips?.draft || 0,
        stats?.trips?.active || 0,
        stats?.trips?.completed || 0,
        (stats?.trips?.total || 0) - (stats?.trips?.draft || 0) - (stats?.trips?.active || 0) - (stats?.trips?.completed || 0)
      ],
      backgroundColor: ['#e8eaed', '#1a73e8', '#0d904f', '#ea4335'],
      borderWidth: 0,
    }]
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { family: 'Inter', size: 11 } } }
    }
  };

  // Driver breakdown for horizontal bar
  const driverTotal = stats?.drivers?.total || 1;
  const dOnDuty = stats?.drivers?.onDuty || 0;
  const dSuspended = stats?.drivers?.suspended || 0;
  const dOffDuty = driverTotal - dOnDuty - dSuspended;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted text-sm">{DASHBOARD_SUBTITLE}</p>
        </div>
      </div>



      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card" aria-label={`${kpi.label} — ${kpi.value}`}>
            <div className={`kpi-icon ${kpi.color}`}>{kpi.icon}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-desc">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Sorting Tools — Vehicle Type & Status Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdFilterList /> Sorting Tools
          <span className="text-muted text-sm" style={{ fontWeight: 400, marginLeft: 4 }}>Filter the fleet overview</span>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label className="text-sm" style={{ fontWeight: 500, marginRight: 8 }}>Vehicle Type</label>
            <div className="filters-bar" style={{ display: 'inline-flex', gap: 6 }}>
              {['', 'Truck', 'Van', 'Bike'].map(t => (
                <button key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm" style={{ fontWeight: 500, marginRight: 8 }}>Status</label>
            <div className="filters-bar" style={{ display: 'inline-flex', gap: 6 }}>
              {['', 'Ready', 'Busy', 'In Shop'].map(s => (
                <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
          {(typeFilter || statusFilter) && (
            <span className="text-sm text-muted">Showing {filteredVehicles.length} of {vehicles.length} vehicles</span>
          )}
        </div>
      </div>

      {/* Fleet Overview Table (filtered) */}
      {(typeFilter || statusFilter) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Fleet Overview — {typeFilter || 'All Types'}, {statusFilter || 'All Statuses'}</div>
          <div className="card-body" style={{ padding: 0 }}>
            {filteredVehicles.length > 0 ? (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Plate</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Odometer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.slice(0, 10).map(v => (
                    <tr key={v._id} onClick={() => navigate(`/vehicles/${v._id}`)} style={{ cursor: 'pointer' }}>
                      <td><strong>{v.name_model}</strong></td>
                      <td className="text-sm">{v.license_plate}</td>
                      <td><StatusBadge status={v.type} /></td>
                      <td className="text-sm">{v.max_capacity_kg?.toLocaleString()} kg</td>
                      <td className="text-sm">{v.odometer_km?.toLocaleString()} km</td>
                      <td><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" style={{ padding: 20 }}><p className="text-muted">No vehicles match the selected filters.</p></div>
            )}
          </div>
        </div>
      )}

      {/* Main 2-col grid */}
      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* Trip Status Donut + Quick Actions row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <div className="card-header">Trip Status</div>
              <div className="card-body">
                <div style={{ height: 220, position: 'relative' }}>
                  <Doughnut data={tripStatusData} options={doughnutOpts} />
                  <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.trips?.total || 0}</div>
                    <div className="text-muted text-sm">Total</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Quick Actions</div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(isRole('Fleet Manager') || isRole('Admin')) && (
                  <button className="btn btn-primary" onClick={() => navigate('/trips')} style={{ justifyContent: 'flex-start' }}>
                    <MdLocalShipping /> {QUICK_ACTION_BTN}
                  </button>
                )}
                {(isRole('Fleet Manager') || isRole('Admin')) && (
                  <button className="btn btn-outline" onClick={() => navigate('/vehicles')} style={{ justifyContent: 'flex-start' }}>
                    <MdDirectionsCar /> Manage Vehicles
                  </button>
                )}
                {(isRole('Fleet Manager') || isRole('Admin') || isRole('Safety Officer')) && (
                  <button className="btn btn-outline" onClick={() => navigate('/drivers')} style={{ justifyContent: 'flex-start' }}>
                    <MdPeople /> Manage Drivers
                  </button>
                )}
                {(isRole('Financial Analyst') || isRole('Admin')) && (
                  <button className="btn btn-outline" onClick={() => navigate('/expenses')} style={{ justifyContent: 'flex-start' }}>
                    <MdAttachMoney /> View Expenses
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => navigate('/analytics')} style={{ justifyContent: 'flex-start' }}>
                  <MdTrendingUp /> View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Recent Trips
              <button className="btn btn-sm btn-outline" onClick={() => navigate('/trips')} style={{ fontSize: '0.75rem' }}>View all <MdArrowForward /></button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentTrips.length > 0 ? (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Route</th>
                      <th>Cargo</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map(t => (
                      <tr key={t._id} onClick={() => navigate('/trips')} style={{ cursor: 'pointer' }}>
                        <td><strong>{t.trip_code}</strong></td>
                        <td className="text-sm">{t.pickup_location} → {t.delivery_location}</td>
                        <td className="text-sm">{t.cargo_weight_kg} kg</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td className="text-sm text-muted">{formatDate(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: 20 }}><p className="text-muted">No trips yet.</p></div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* Fleet Summary */}
          <div className="card">
            <div className="card-header">Fleet Summary</div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="stat-row">
                  <span className="text-sm">Ready</span>
                  <StatusBadge status="Available" />
                  <strong>{stats?.fleet?.available || 0}</strong>
                </div>
                <div className="stat-row">
                  <span className="text-sm">Busy</span>
                  <StatusBadge status="On Trip" />
                  <strong>{stats?.fleet?.onTrip || 0}</strong>
                </div>
                <div className="stat-row">
                  <span className="text-sm">In Shop</span>
                  <StatusBadge status="In Shop" />
                  <strong>{stats?.fleet?.inShop || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Availability */}
          <div className="card">
            <div className="card-header">Driver Availability</div>
            <div className="card-body">
              <div className="progress-bar-stacked">
                <div className="progress-seg green" style={{ width: `${(dOnDuty / driverTotal) * 100}%` }} title={`On Duty: ${dOnDuty}`} />
                <div className="progress-seg grey" style={{ width: `${(dOffDuty / driverTotal) * 100}%` }} title={`Off Duty: ${dOffDuty}`} />
                <div className="progress-seg red" style={{ width: `${(dSuspended / driverTotal) * 100}%` }} title={`Suspended/Banned: ${dSuspended}`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <div className="text-sm"><span className="legend-dot green" /> On Duty ({dOnDuty})</div>
                <div className="text-sm"><span className="legend-dot grey" /> Off Duty ({dOffDuty})</div>
                <div className="text-sm"><span className="legend-dot red" /> Susp. ({dSuspended})</div>
              </div>
            </div>
          </div>

          {/* Rule-Breaker Feed — role-gated */}
          {canSeeAlerts ? (
            <RuleBreakerFeed
              alerts={alerts}
              onAlertResolved={(id) => setAlerts(prev => prev.filter(a => a._id !== id))}
            />
          ) : (
            <div className="card">
              <div className="card-header">Fleet Health</div>
              <div className="card-body">
                <div className="stat-row">
                  <span className="text-sm">Completed Trips</span>
                  <strong style={{ color: 'var(--success)' }}>{stats?.trips?.completed || 0}</strong>
                </div>
                <div className="stat-row">
                  <span className="text-sm">Active Trips</span>
                  <strong style={{ color: 'var(--primary)' }}>{stats?.trips?.active || 0}</strong>
                </div>
                <div className="stat-row">
                  <span className="text-sm">Maintenance Cost</span>
                  <strong>{formatCurrency(stats?.totalMaintenanceCost || 0)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
