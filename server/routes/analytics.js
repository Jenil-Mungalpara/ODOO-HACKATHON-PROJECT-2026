const express = require('express');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [
      totalVehicles,
      availableVehicles,
      inShopVehicles,
      onTripVehicles,
      totalDrivers,
      onDutyDrivers,
      suspendedDrivers,
      totalTrips,
      activeTrips,
      completedTrips,
      draftTrips,
      totalExpenses,
      totalMaintenanceCost
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'Available' }),
      Vehicle.countDocuments({ status: 'In Shop' }),
      Vehicle.countDocuments({ status: 'On Trip' }),
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'On Duty' }),
      Driver.countDocuments({ status: { $in: ['Suspended', 'Banned'] } }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'Dispatched' }),
      Trip.countDocuments({ status: 'Completed' }),
      Trip.countDocuments({ status: 'Draft' }),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: { $add: ['$fuel_cost', '$misc_cost'] } } } }]),
      Maintenance.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }])
    ]);

    const utilizationRate = totalVehicles > 0
      ? Math.round((onTripVehicles / totalVehicles) * 100)
      : 0;

    const totalRevenue = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);

    // Monthly cost savings estimate
    const avgMaintenanceCost = totalMaintenanceCost[0]?.total || 0;
    const estimatedMonthlySavings = Math.round(avgMaintenanceCost * 0.15); // 15% savings from proactive maintenance

    res.json({
      success: true,
      data: {
        fleet: { total: totalVehicles, available: availableVehicles, inShop: inShopVehicles, onTrip: onTripVehicles },
        drivers: { total: totalDrivers, onDuty: onDutyDrivers, suspended: suspendedDrivers },
        trips: { total: totalTrips, active: activeTrips, completed: completedTrips, draft: draftTrips },
        utilizationRate,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        totalMaintenanceCost: totalMaintenanceCost[0]?.total || 0,
        estimatedMonthlySavings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/fuel-efficiency
router.get('/fuel-efficiency', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ fuel_liters: { $gt: 0 } })
      .populate('trip', 'distance_km trip_code')
      .populate('vehicle', 'name_model license_plate');

    const efficiencyData = expenses
      .filter(e => e.trip && e.trip.distance_km > 0)
      .map(e => ({
        trip_code: e.trip.trip_code,
        vehicle: e.vehicle?.name_model || 'Unknown',
        distance_km: e.trip.distance_km,
        fuel_liters: e.fuel_liters,
        km_per_liter: Math.round((e.trip.distance_km / e.fuel_liters) * 100) / 100,
        cost_per_km: Math.round((e.fuel_cost / e.trip.distance_km) * 100) / 100
      }));

    res.json({ success: true, data: efficiencyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/vehicle-roi
router.get('/vehicle-roi', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const roiData = [];

    for (const v of vehicles) {
      // Get revenue from trips using this vehicle
      const tripRevenue = await Trip.aggregate([
        { $match: { assigned_vehicle: v._id, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$revenue' } } }
      ]);

      // Get maintenance costs
      const maintCost = await Maintenance.aggregate([
        { $match: { vehicle: v._id } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);

      // Get fuel costs
      const fuelCost = await Expense.aggregate([
        { $match: { vehicle: v._id } },
        { $group: { _id: null, total: { $sum: { $add: ['$fuel_cost', '$misc_cost'] } } } }
      ]);

      const revenue = tripRevenue[0]?.total || 0;
      const maintenance = maintCost[0]?.total || 0;
      const fuel = fuelCost[0]?.total || 0;
      const roi = v.acquisition_cost > 0
        ? Math.round(((revenue - maintenance - fuel) / v.acquisition_cost) * 10000) / 100
        : 0;

      roiData.push({
        vehicle: v.name_model,
        license_plate: v.license_plate,
        type: v.type,
        acquisition_cost: v.acquisition_cost,
        revenue,
        maintenance_cost: maintenance,
        fuel_cost: fuel,
        net_profit: revenue - maintenance - fuel,
        roi_pct: roi,
        status: v.status
      });
    }

    res.json({ success: true, data: roiData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/utilization
router.get('/utilization', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const utilizationData = [];

    for (const v of vehicles) {
      const totalTrips = await Trip.countDocuments({ assigned_vehicle: v._id });
      const completedTrips = await Trip.countDocuments({ assigned_vehicle: v._id, status: 'Completed' });
      const activeTrips = await Trip.countDocuments({ assigned_vehicle: v._id, status: 'Dispatched' });

      utilizationData.push({
        vehicle: v.name_model,
        license_plate: v.license_plate,
        type: v.type,
        status: v.status,
        totalTrips,
        completedTrips,
        activeTrips,
        odometer_km: v.odometer_km,
        isDeadStock: v.status === 'Available' && totalTrips === 0 && v.odometer_km < 100
      });
    }

    res.json({ success: true, data: utilizationData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET /api/analytics/monthly-summary
router.get('/monthly-summary', auth, async (req, res) => {
  try {
    // Revenue by month (from completed trips)
    const revenueByMonth = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$revenue' }
      }},
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    // Fuel cost by month
    const fuelByMonth = await Expense.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$expense_date' } },
        fuel_cost: { $sum: '$fuel_cost' },
        misc_cost: { $sum: '$misc_cost' }
      }},
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    // Maintenance cost by month
    const maintByMonth = await Maintenance.aggregate([
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$service_date' } },
        maintenance_cost: { $sum: '$cost' }
      }},
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    // Merge all months
    const allMonths = new Set([
      ...revenueByMonth.map(r => r._id),
      ...fuelByMonth.map(r => r._id),
      ...maintByMonth.map(r => r._id)
    ]);

    const summary = [...allMonths].sort().reverse().map(month => {
      const rev = revenueByMonth.find(r => r._id === month);
      const fuel = fuelByMonth.find(r => r._id === month);
      const maint = maintByMonth.find(r => r._id === month);
      const revenue = rev?.revenue || 0;
      const fuelCost = (fuel?.fuel_cost || 0) + (fuel?.misc_cost || 0);
      const maintCost = maint?.maintenance_cost || 0;
      return {
        month,
        revenue,
        fuel_cost: fuelCost,
        maintenance_cost: maintCost,
        net_profit: revenue - fuelCost - maintCost
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
