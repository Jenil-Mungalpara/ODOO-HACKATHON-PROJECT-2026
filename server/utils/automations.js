const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const Alert = require('../models/Alert');

// ═══════════════════════════════════════════════════════════
// Helper: create and persist an alert
// ═══════════════════════════════════════════════════════════
async function createAlert({ title, message, severity = 'info', entity_type, entity_id }) {
  return Alert.create({ title, message, severity, entity_type, entity_id });
}

// ═══════════════════════════════════════════════════════════
// SECTION 3 — Trip Validation (verbatim error messages)
// ═══════════════════════════════════════════════════════════
async function validateTripCreation(tripData) {
  const errors = [];

  // Date validation
  if (tripData.expected_start_date && tripData.expected_delivery_date) {
    if (new Date(tripData.expected_delivery_date) < new Date(tripData.expected_start_date)) {
      errors.push('Delivery date must be same or after start date.');
    }
  }

  if (tripData.assigned_vehicle) {
    const vehicle = await Vehicle.findById(tripData.assigned_vehicle);
    if (!vehicle) {
      errors.push('Vehicle not found.');
    } else {
      // Vehicle status check
      if (vehicle.status !== 'Available') {
        errors.push(`Vehicle '${vehicle.license_plate}' is currently ${vehicle.status} and cannot be selected.`);
      }
      // Cargo weight vs capacity (Automation H)
      if (tripData.cargo_weight_kg > vehicle.max_capacity_kg) {
        errors.push(
          `Overweight: selected vehicle capacity is ${vehicle.max_capacity_kg} kg. Reduce cargo or choose a larger vehicle.`
        );
        // Create critical alert for overweight attempt
        await createAlert({
          title: 'Cargo Overweight Attempt',
          message: `Attempted to assign ${tripData.cargo_weight_kg} kg to vehicle ${vehicle.license_plate} (capacity ${vehicle.max_capacity_kg} kg).`,
          severity: 'critical',
          entity_type: 'vehicle',
          entity_id: vehicle._id
        });
      }
    }
  }

  if (tripData.assigned_driver) {
    const driver = await Driver.findById(tripData.assigned_driver);
    if (!driver) {
      errors.push('Driver not found.');
    } else {
      // Suspended / Banned check
      if (driver.status === 'Suspended' || driver.status === 'Banned') {
        errors.push(`Driver '${driver.name}' is ${driver.status} and cannot be selected.`);
      }
      // License expiry check — also triggers Automation A inline
      if (new Date(driver.license_expiry_date) < new Date()) {
        // Auto-suspend if not already
        if (driver.status !== 'Suspended' && driver.status !== 'Banned') {
          driver.status = 'Suspended';
          await driver.save();
          await createAlert({
            title: 'Driver License Expired',
            message: `Driver ${driver.name}'s license expired on ${new Date(driver.license_expiry_date).toLocaleDateString()} and has been suspended.`,
            severity: 'warning',
            entity_type: 'driver',
            entity_id: driver._id
          });
        }
        errors.push(`Driver '${driver.name}' license expired on ${new Date(driver.license_expiry_date).toLocaleDateString()}. Update license to assign.`);
      }
    }
  }

  return errors;
}

// ═══════════════════════════════════════════════════════════
// Automation B — Trip Dispatch
// ═══════════════════════════════════════════════════════════
async function onTripDispatched(trip) {
  if (trip.assigned_vehicle) {
    const vehicle = await Vehicle.findById(trip.assigned_vehicle);
    if (vehicle) {
      if (vehicle.status !== 'Available') {
        await createAlert({
          title: 'Dispatch Blocked',
          message: `Attempted to dispatch with vehicle ${vehicle.license_plate} in ${vehicle.status}`,
          severity: 'critical',
          entity_type: 'trip',
          entity_id: trip._id
        });
        throw new Error(`Vehicle '${vehicle.license_plate}' is currently ${vehicle.status} and cannot be dispatched.`);
      }
      vehicle.status = 'On Trip';
      await vehicle.save();
    }
  }
  if (trip.assigned_driver) {
    const driver = await Driver.findById(trip.assigned_driver);
    if (driver) {
      driver.total_trips_assigned += 1;
      driver.status = 'On Duty';
      await driver.save();
    }
  }
  trip.actual_start_date = new Date();
  await trip.save();

  await createAlert({
    title: 'Trip Dispatched',
    message: `Trip ${trip.trip_code} has been dispatched.`,
    severity: 'info',
    entity_type: 'trip',
    entity_id: trip._id
  });
}

// ═══════════════════════════════════════════════════════════
// Automation C — Trip Completion
// ═══════════════════════════════════════════════════════════
async function onTripCompleted(trip) {
  if (trip.assigned_vehicle) {
    const openMaintenance = await Maintenance.findOne({
      vehicle: trip.assigned_vehicle,
      status: 'Open'
    });
    if (!openMaintenance) {
      await Vehicle.findByIdAndUpdate(trip.assigned_vehicle, { status: 'Available' });
    }
  }
  if (trip.assigned_driver) {
    const driver = await Driver.findById(trip.assigned_driver);
    if (driver) {
      driver.trips_completed += 1;
      // Recalculate safety score if incidents exist
      // safety_score_pct stays unchanged if no new incidents
      await driver.save();
    }
  }
  trip.actual_delivery_date = new Date();
  await trip.save();

  await createAlert({
    title: 'Trip Completed',
    message: `Trip ${trip.trip_code} has been completed successfully.`,
    severity: 'info',
    entity_type: 'trip',
    entity_id: trip._id
  });
}

// ═══════════════════════════════════════════════════════════
// Automation D — Trip Cancellation
// ═══════════════════════════════════════════════════════════
async function onTripCancelled(trip) {
  if (trip.assigned_vehicle) {
    const openMaintenance = await Maintenance.findOne({
      vehicle: trip.assigned_vehicle,
      status: 'Open'
    });
    if (!openMaintenance) {
      await Vehicle.findByIdAndUpdate(trip.assigned_vehicle, { status: 'Available' });
    }
  }
  if (trip.assigned_driver) {
    const driver = await Driver.findById(trip.assigned_driver);
    if (driver && driver.status === 'On Duty') {
      driver.status = 'Off Duty';
      await driver.save();
    }
  }
  await trip.save();

  await createAlert({
    title: 'Trip Cancelled',
    message: `Trip ${trip.trip_code} has been cancelled.`,
    severity: 'info',
    entity_type: 'trip',
    entity_id: trip._id
  });
}

// ═══════════════════════════════════════════════════════════
// Automation E — Maintenance Open
// ═══════════════════════════════════════════════════════════
async function onMaintenanceCreated(maintenance) {
  const vehicle = await Vehicle.findById(maintenance.vehicle);
  if (!vehicle) return;

  // Validation: block if vehicle is On Trip
  if (vehicle.status === 'On Trip') {
    throw new Error('Cannot open maintenance while vehicle is On Trip. Mark trip Completed or Cancelled first.');
  }

  if (maintenance.status === 'Open') {
    vehicle.status = 'In Shop';
    await vehicle.save();
    await createAlert({
      title: 'Vehicle In Shop',
      message: `Vehicle ${vehicle.license_plate} is in shop for ${maintenance.service_type}.`,
      severity: 'warning',
      entity_type: 'vehicle',
      entity_id: vehicle._id
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Automation F — Maintenance Completed
// ═══════════════════════════════════════════════════════════
async function onMaintenanceCompleted(maintenance) {
  maintenance.status = 'Completed';
  maintenance.completed_date = new Date();
  await maintenance.save();

  const otherOpen = await Maintenance.findOne({
    vehicle: maintenance.vehicle,
    status: 'Open',
    _id: { $ne: maintenance._id }
  });

  if (!otherOpen) {
    const activeTrip = await Trip.findOne({
      assigned_vehicle: maintenance.vehicle,
      status: 'Dispatched'
    });
    if (!activeTrip) {
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, { status: 'Available' });
    }
  }

  const vehicle = await Vehicle.findById(maintenance.vehicle);
  await createAlert({
    title: 'Maintenance Completed',
    message: `Maintenance completed for ${vehicle ? vehicle.license_plate : 'vehicle'}. Cost: ₹${maintenance.cost}, Odometer: ${maintenance.odometer_at_service} km.`,
    severity: 'info',
    entity_type: 'vehicle',
    entity_id: maintenance.vehicle
  });
}

// ═══════════════════════════════════════════════════════════
// Automation A — Driver License Expiry (scheduled / on-demand)
// ═══════════════════════════════════════════════════════════
async function checkDriverCompliance() {
  const drivers = await Driver.find({ status: { $nin: ['Banned'] } });
  const alertsCreated = [];

  for (const driver of drivers) {
    // License expiry → Suspend
    if (new Date(driver.license_expiry_date) < new Date() && driver.status !== 'Suspended') {
      driver.status = 'Suspended';
      await driver.save();
      const alert = await createAlert({
        title: 'Driver License Expired',
        message: `Driver ${driver.name}'s license expired on ${new Date(driver.license_expiry_date).toLocaleDateString()} and has been suspended.`,
        severity: 'warning',
        entity_type: 'driver',
        entity_id: driver._id
      });
      alertsCreated.push(alert);
    }

    // Safety score warning
    if (driver.safety_score_pct < 75 && driver.status !== 'Suspended') {
      const existing = await Alert.findOne({
        entity_type: 'driver', entity_id: driver._id,
        title: 'Low Safety Score', resolved: false
      });
      if (!existing) {
        const alert = await createAlert({
          title: 'Low Safety Score',
          message: `${driver.name} safety score is critically low: ${driver.safety_score_pct}%`,
          severity: 'warning',
          entity_type: 'driver',
          entity_id: driver._id
        });
        alertsCreated.push(alert);
      }
    }

    // Automation I — Progressive discipline
    const completionRate = driver.total_trips_assigned > 0
      ? (driver.trips_completed / driver.total_trips_assigned) * 100
      : 100;

    if ((completionRate < 80 || driver.safety_score_pct < 75) && driver.total_trips_assigned >= 5) {
      driver.warnings = (driver.warnings || 0) + 1;
      await driver.save();

      if (driver.warnings >= 3 && driver.status !== 'Suspended' && driver.status !== 'Banned') {
        driver.status = 'Suspended';
        await driver.save();
        await createAlert({
          title: 'Driver Suspended — 3 warnings',
          message: `${driver.name} has been suspended after ${driver.warnings} performance warnings.`,
          severity: 'critical',
          entity_type: 'driver',
          entity_id: driver._id
        });
      }
    }
  }

  return alertsCreated;
}

// ═══════════════════════════════════════════════════════════
// Automation G — Smart Maintenance Due (scheduled daily)
// ═══════════════════════════════════════════════════════════
const MAINTENANCE_THRESHOLDS = {
  'Oil Change': { km: 5000, months: 3 },
  'Tire Replacement': { km: 10000, months: 6 },
  'General Service': { km: 10000, months: 6 },
  'General Inspection': { km: 10000, months: 6 },
  'Engine Repair': { km: 15000, months: 12 },
  'Brake Service': { km: 8000, months: 4 },
};

async function checkMaintenanceDue() {
  const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
  const alertsCreated = [];

  for (const v of vehicles) {
    for (const [serviceType, thresholds] of Object.entries(MAINTENANCE_THRESHOLDS)) {
      const lastService = await Maintenance.findOne({
        vehicle: v._id,
        service_type: serviceType,
        status: 'Completed'
      }).sort({ service_date: -1 });

      let reason = null;

      if (lastService) {
        const kmSince = v.odometer_km - (lastService.odometer_at_service || 0);
        if (kmSince >= thresholds.km) {
          reason = `${kmSince.toLocaleString()} km driven since last ${serviceType}`;
        }
        const monthsSince = (Date.now() - new Date(lastService.service_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSince >= thresholds.months) {
          reason = reason || `${Math.round(monthsSince)} months since last ${serviceType}`;
        }
      } else if (v.odometer_km >= thresholds.km) {
        reason = `${v.odometer_km.toLocaleString()} km with no ${serviceType} record`;
      }

      if (reason) {
        // Don't duplicate active alerts
        const existing = await Alert.findOne({
          entity_type: 'vehicle',
          entity_id: v._id,
          title: 'Maintenance Due',
          resolved: false,
          message: { $regex: serviceType }
        });
        if (!existing) {
          const alert = await createAlert({
            title: 'Maintenance Due',
            message: `Vehicle ${v.license_plate}: ${serviceType} due — ${reason}.`,
            severity: 'warning',
            entity_type: 'vehicle',
            entity_id: v._id
          });
          alertsCreated.push(alert);
        }
      }
    }
  }

  return alertsCreated;
}

// ═══════════════════════════════════════════════════════════
// Rule-Breaker Alert Feed (read from DB + live scan)
// ═══════════════════════════════════════════════════════════
async function generateAlerts() {
  // Run compliance and maintenance due checks (idempotent — creates alerts only if new)
  await checkDriverCompliance();
  await checkMaintenanceDue();

  // Also add real-time computed alerts that aren't persisted
  const liveAlerts = [];

  // Vehicles in shop on active trips
  const inShopVehicles = await Vehicle.find({ status: 'In Shop' });
  for (const v of inShopVehicles) {
    const activeTrip = await Trip.findOne({ assigned_vehicle: v._id, status: 'Dispatched' });
    if (activeTrip) {
      liveAlerts.push({
        type: 'vehicle_in_shop_assigned',
        severity: 'critical',
        entity: 'vehicle',
        entityId: v._id,
        entityName: v.name_model,
        message: `${v.name_model} (${v.license_plate}) is In Shop but assigned to trip ${activeTrip.trip_code}`
      });
    }
  }

  // Trips approaching deadline unassigned
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  const urgentTrips = await Trip.find({
    status: 'Draft',
    expected_delivery_date: { $lte: twoDaysFromNow, $gte: new Date() },
    $or: [{ assigned_vehicle: null }, { assigned_driver: null }]
  });
  for (const t of urgentTrips) {
    liveAlerts.push({
      type: 'trip_unassigned_deadline',
      severity: 'warning',
      entity: 'trip',
      entityId: t._id,
      entityName: t.trip_code,
      message: `Trip ${t.trip_code} is approaching deadline but still unassigned`
    });
  }

  // Get persisted alerts (most recent first, unresolved)
  const persistedAlerts = await Alert.find({ resolved: false })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Convert persisted alerts to feed format
  const feedAlerts = persistedAlerts.map(a => ({
    _id: a._id,
    type: a.title.toLowerCase().replace(/\s+/g, '_'),
    severity: a.severity,
    entity: a.entity_type,
    entityId: a.entity_id,
    message: a.message,
    title: a.title,
    createdAt: a.createdAt
  }));

  return [...feedAlerts, ...liveAlerts];
}

// ═══════════════════════════════════════════════════════════
// Maintenance On-Trip Validation
// ═══════════════════════════════════════════════════════════
async function validateMaintenanceCreation(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found.');
  if (vehicle.status === 'On Trip') {
    throw new Error('Cannot open maintenance while vehicle is On Trip. Mark trip Completed or Cancelled first.');
  }
  return vehicle;
}

// ═══════════════════════════════════════════════════════════
// Expense Validation
// ═══════════════════════════════════════════════════════════
async function validateExpenseCreation(expenseData) {
  const trip = await Trip.findById(expenseData.trip).populate('assigned_vehicle assigned_driver');
  if (!trip) throw new Error('Trip not found.');
  if (trip.status !== 'Completed') {
    throw new Error('Expenses can only be recorded for Completed trips.');
  }
  // Auto-fill vehicle and driver from trip
  const autoFilled = {
    vehicle: trip.assigned_vehicle?._id || null,
    driver: trip.assigned_driver?._id || null
  };
  // Mismatch check
  if (expenseData.vehicle && String(expenseData.vehicle) !== String(autoFilled.vehicle)) {
    throw new Error('Expense vehicle/driver mismatch with the selected trip.');
  }
  if (expenseData.driver && String(expenseData.driver) !== String(autoFilled.driver)) {
    throw new Error('Expense vehicle/driver mismatch with the selected trip.');
  }
  return autoFilled;
}

module.exports = {
  createAlert,
  validateTripCreation,
  onTripDispatched,
  onTripCompleted,
  onTripCancelled,
  onMaintenanceCreated,
  onMaintenanceCompleted,
  checkDriverCompliance,
  checkMaintenanceDue,
  generateAlerts,
  validateMaintenanceCreation,
  validateExpenseCreation
};
