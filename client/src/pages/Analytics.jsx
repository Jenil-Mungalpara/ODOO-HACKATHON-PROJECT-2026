import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { MdFileDownload, MdTrendingUp, MdLocalGasStation, MdShowChart, MdBuild } from 'react-icons/md';
import {
  ANALYTICS_TITLE, FUEL_EFFICIENCY_LABEL, VEHICLE_ROI_LABEL, ROI_HELPER,
  DEAD_STOCK_LABEL, DOWNLOAD_REPORT, formatCurrency
} from '../utils/copy';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [roi, setRoi] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/analytics/vehicle-roi'),
      API.get('/analytics/fuel-efficiency'),
      API.get('/analytics/utilization'),
      API.get('/analytics/dashboard'),
      API.get('/analytics/monthly-summary')
    ]).then(([roiRes, fuelRes, utilRes, dashRes, monthRes]) => {
      setRoi(roiRes.data.data);
      setFuel(fuelRes.data.data);
      setUtilization(utilRes.data.data);
      setDashboard(dashRes.data.data);
      setMonthlySummary(monthRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FleetFlow - Vehicle ROI Report', 14, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Generated: ' + new Date().toLocaleString(), 14, 30);

      if (!roi || roi.length === 0) {
        doc.setFontSize(12);
        doc.text('No ROI data available yet.', 14, 46);
        doc.save('fleetflow_vehicle_roi.pdf');
        return;
      }

      let y = 42;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const cols = [14, 55, 85, 110, 135, 165];
      doc.text('Vehicle', cols[0], y);
      doc.text('Revenue', cols[1], y);
      doc.text('Maint.', cols[2], y);
      doc.text('Fuel', cols[3], y);
      doc.text('Net', cols[4], y);
      doc.text('ROI %', cols[5], y);
      y += 2;
      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      roi.forEach(r => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(String(r.vehicle || '').substring(0, 20), cols[0], y);
        doc.text('Rs.' + (r.revenue || 0).toLocaleString(), cols[1], y);
        doc.text('Rs.' + (r.maintenance_cost || 0).toLocaleString(), cols[2], y);
        doc.text('Rs.' + (r.fuel_cost || 0).toLocaleString(), cols[3], y);
        doc.text('Rs.' + (r.net_profit || 0).toLocaleString(), cols[4], y);
        doc.text((r.roi_pct || 0) + '%', cols[5], y);
        y += 7;
      });

      y += 6;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const totalRev = roi.reduce((s, r) => s + (r.revenue || 0), 0);
      const totalNet = roi.reduce((s, r) => s + (r.net_profit || 0), 0);
      doc.text('Total Revenue: Rs.' + totalRev.toLocaleString(), 14, y);
      y += 7;
      doc.text('Total Net Profit: Rs.' + totalNet.toLocaleString(), 14, y);

      doc.save('fleetflow_vehicle_roi.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // Computed KPIs
  const totalFuelCost = roi.reduce((s, r) => s + (r.fuel_cost || 0), 0);
  const totalMaintCost = roi.reduce((s, r) => s + (r.maintenance_cost || 0), 0);
  const avgRoi = roi.length > 0 ? (roi.reduce((s, r) => s + (r.roi_pct || 0), 0) / roi.length).toFixed(1) : 0;
  const utilizationRate = dashboard?.utilizationRate || 0;

  // Top 5 costliest vehicles (by total cost = maintenance + fuel)
  const top5Costliest = [...roi]
    .map(r => ({ ...r, total_cost: (r.maintenance_cost || 0) + (r.fuel_cost || 0) }))
    .sort((a, b) => b.total_cost - a.total_cost)
    .slice(0, 5);

  const top5ChartData = {
    labels: top5Costliest.map(r => r.vehicle),
    datasets: [{
      label: 'Total Cost',
      data: top5Costliest.map(r => r.total_cost),
      backgroundColor: ['#ea4335', '#e37400', '#fbbc04', '#1a73e8', '#0d904f'],
      borderRadius: 4,
    }]
  };

  // Fuel Efficiency Trend chart
  const fuelChart = {
    labels: fuel.map(f => f.trip_code),
    datasets: [{
      label: 'km / L',
      data: fuel.map(f => f.km_per_liter),
      borderColor: '#1a73e8',
      backgroundColor: 'rgba(26,115,232,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#1a73e8'
    }]
  };

  // Vehicle ROI chart
  const roiChartData = {
    labels: roi.map(r => r.vehicle),
    datasets: [
      { label: 'Revenue', data: roi.map(r => r.revenue), backgroundColor: 'rgba(26,115,232,0.8)', borderRadius: 4 },
      { label: 'Maintenance', data: roi.map(r => r.maintenance_cost), backgroundColor: 'rgba(234,67,53,0.8)', borderRadius: 4 },
      { label: 'Fuel Cost', data: roi.map(r => r.fuel_cost), backgroundColor: 'rgba(251,188,4,0.8)', borderRadius: 4 },
    ]
  };

  // Fleet Utilization doughnut
  const utilizationChart = {
    labels: ['Available', 'On Trip', 'In Shop'],
    datasets: [{
      data: [
        dashboard?.fleet?.available || 0,
        dashboard?.fleet?.onTrip || 0,
        dashboard?.fleet?.inShop || 0
      ],
      backgroundColor: ['#0d904f', '#1a73e8', '#e37400'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f3f4' } }, x: { grid: { display: false } } }
  };

  const barOnlyOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } } },
    cutout: '65%'
  };

  // Month name helper
  const monthName = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(y, m - 1).toLocaleString('en', { month: 'short' }) + ' ' + y;
  };

  return (
    <div>
      <div className="page-header">
        <h1>{ANALYTICS_TITLE}</h1>
        <button className="btn btn-outline" onClick={exportPDF} title="Download PDF Report"><MdFileDownload /> {DOWNLOAD_REPORT}</button>
      </div>

      <div className="text-muted text-sm" style={{ marginBottom: 16 }}>{ROI_HELPER}</div>

      {/* ─── KPI Summary Cards ─── */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon orange"><MdLocalGasStation /></div>
          <div className="kpi-value">{formatCurrency(totalFuelCost)}</div>
          <div className="kpi-label">Total Fuel Cost</div>
          <div className="kpi-desc">Across all vehicles</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><MdShowChart /></div>
          <div className="kpi-value" style={{ color: avgRoi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {avgRoi > 0 ? '+' : ''}{avgRoi}%
          </div>
          <div className="kpi-label">Fleet ROI</div>
          <div className="kpi-desc">Average return on investment</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><MdTrendingUp /></div>
          <div className="kpi-value">{utilizationRate}%</div>
          <div className="kpi-label">Utilization Rate</div>
          <div className="kpi-desc">Fleet working vs sitting empty</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><MdBuild /></div>
          <div className="kpi-value">{formatCurrency(totalMaintCost)}</div>
          <div className="kpi-label">Maintenance Cost</div>
          <div className="kpi-desc">Total repair & service spend</div>
        </div>
      </div>

      {/* ─── Charts Row: Fuel Efficiency Trend + Top 5 Costliest ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">{FUEL_EFFICIENCY_LABEL}</div>
          <div className="card-body">
            {fuel.length > 0 ? (
              <div className="chart-container">
                <Line data={fuelChart} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No fuel data yet. Record expenses with fuel consumption to see efficiency metrics.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Top 5 Costliest Vehicles</div>
          <div className="card-body">
            {top5Costliest.length > 0 ? (
              <div className="chart-container">
                <Bar data={top5ChartData} options={barOnlyOptions} />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No cost data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Financial Summary of Month ─── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">Financial Summary of Month</div>
        <div className="card-body" style={{ padding: 0 }}>
          {monthlySummary.length > 0 ? (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Fuel Cost</th>
                  <th>Maintenance</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m, i) => (
                  <tr key={i}>
                    <td><strong>{monthName(m.month)}</strong></td>
                    <td>{formatCurrency(m.revenue)}</td>
                    <td>{formatCurrency(m.fuel_cost)}</td>
                    <td>{formatCurrency(m.maintenance_cost)}</td>
                    <td style={{ color: m.net_profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {formatCurrency(m.net_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><p className="text-muted">No financial data recorded yet.</p></div>
          )}
        </div>
      </div>

      {/* ─── Vehicle Revenue vs Costs + Fleet Utilization ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">{VEHICLE_ROI_LABEL}</div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={roiChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Fleet Utilization</div>
          <div className="card-body">
            <div className="chart-container" style={{ height: 260 }}>
              <Doughnut data={utilizationChart} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Per-Vehicle ROI Cards ─── */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {roi.map((r, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value" style={{ color: r.roi_pct >= 0 ? 'var(--success)' : 'var(--danger)' }}>{r.roi_pct}%</div>
            <div className="kpi-label">{r.vehicle} ROI</div>
            <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
              Net: {formatCurrency(r.net_profit)} · {r.license_plate}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Dead Stock ─── */}
      <div className="card">
        <div className="card-header">{DEAD_STOCK_LABEL}</div>
        <div className="card-body">
          {utilization.filter(u => u.isDeadStock).length > 0 ? (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle</th><th>License</th><th>Type</th><th>Total Trips</th><th>Odometer</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {utilization.filter(u => u.isDeadStock).map((u, i) => (
                    <tr key={i}>
                      <td>{u.vehicle}</td><td>{u.license_plate}</td><td>{u.type}</td>
                      <td>{u.totalTrips}</td><td>{u.odometer_km.toLocaleString()} km</td>
                      <td><span className={`badge badge-${u.status.toLowerCase().replace(/\s+/g, '-')}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><p>No dead stock identified. All vehicles are active.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
