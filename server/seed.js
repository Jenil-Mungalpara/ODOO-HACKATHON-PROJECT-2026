const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const Maintenance = require('./models/Maintenance');
const Expense = require('./models/Expense');
const Alert = require('./models/Alert');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      Maintenance.deleteMany({}),
      Expense.deleteMany({}),
      Alert.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ────────────────────────────────────────────────
    const users = await User.create([
      { name: 'System Admin', email: 'admin@fleetflow.com', password: 'admin123', role: 'Admin', phone: '+91-9000000001' },
      { name: 'Rahul Sharma', email: 'fleet@fleetflow.com', password: 'fleet123', role: 'Fleet Manager', phone: '+91-9000000002' },
      { name: 'Priya Desai', email: 'dispatch@fleetflow.com', password: 'dispatch123', role: 'Dispatcher', phone: '+91-9000000003' },
      { name: 'Arun Nair', email: 'safety@fleetflow.com', password: 'safety123', role: 'Safety Officer', phone: '+91-9000000004' },
      { name: 'Meera Joshi', email: 'finance@fleetflow.com', password: 'finance123', role: 'Financial Analyst', phone: '+91-9000000005' }
    ]);
    console.log(`👤 Created ${users.length} users`);

    // ── Vehicles (exact spec data) ──────────────────────────
    const vehicles = await Vehicle.create([
      {
        name_model: 'Ford F-350',
        license_plate: 'TRK-42',
        type: 'Truck',
        max_capacity_kg: 8000,
        odometer_km: 120000,
        status: 'Available',
        acquisition_cost: 40000
      },
      {
        name_model: 'Mercedes Sprinter',
        license_plate: 'VAN-11',
        type: 'Van',
        max_capacity_kg: 1500,
        odometer_km: 72000,
        status: 'In Shop',   // Will be confirmed by maintenance automation
        acquisition_cost: 30000
      },
      {
        name_model: 'Hero CD100',
        license_plate: 'BIKE-3',
        type: 'Bike',
        max_capacity_kg: 80,
        odometer_km: 15000,
        status: 'Available',
        acquisition_cost: 800
      }
    ]);
    console.log(`🚛 Created ${vehicles.length} vehicles`);

    // ── Drivers (exact spec data) ───────────────────────────
    const today = new Date();
    const drivers = await Driver.create([
      {
        name: 'Rajesh Kumar',
        license_number: 'DL-RAJ-001',
        license_expiry_date: new Date(today.getTime() + 280 * 24 * 60 * 60 * 1000),
        contact: '+91-9876543210',
        status: 'On Duty',
        total_trips_assigned: 34,
        trips_completed: 33,
        safety_score_pct: 92,
        incidents: 0,
        warnings: 0
      },
      {
        name: 'Anjali Mehta',
        license_number: 'DL-ANJ-002',
        license_expiry_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
        contact: '+91-9876543211',
        status: 'Suspended',   // Automation A would set this
        total_trips_assigned: 20,
        trips_completed: 15,
        safety_score_pct: 68,
        incidents: 2,
        warnings: 2
      },
      {
        name: 'Vikram Singh',
        license_number: 'DL-VIK-003',
        license_expiry_date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000),
        contact: '+91-9876543212',
        status: 'On Duty',
        total_trips_assigned: 12,
        trips_completed: 12,
        safety_score_pct: 95,
        incidents: 0,
        warnings: 0
      }
    ]);
    console.log(`🧑‍✈️ Created ${drivers.length} drivers`);

    // ── Trips (exact spec data) ─────────────────────────────
    const trips = await Trip.create([
      {
        trip_code: 'T-DRAFT-001',
        pickup_location: 'Warehouse A, Mumbai',
        delivery_location: 'Store 23, Pune',
        cargo_weight_kg: 1200,
        assigned_vehicle: null,
        assigned_driver: null,
        expected_start_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        expected_delivery_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'Draft',
        distance_km: 150,
        revenue: 0
      },
      {
        trip_code: 'T-DISPATCH-001',
        pickup_location: 'Port, Chennai',
        delivery_location: 'Client X, Bangalore',
        cargo_weight_kg: 7000,
        assigned_vehicle: vehicles[0]._id,   // Ford F-350 (TRK-42)
        assigned_driver: drivers[0]._id,     // Rajesh Kumar
        expected_start_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expected_delivery_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        actual_start_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'Dispatched',
        distance_km: 350,
        revenue: 1200
      },
      {
        trip_code: 'T-COMPLETE-001',
        pickup_location: 'Factory B, Delhi',
        delivery_location: 'Warehouse C, Jaipur',
        cargo_weight_kg: 5500,
        assigned_vehicle: vehicles[0]._id,
        assigned_driver: drivers[2]._id,   // Vikram Singh
        expected_start_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        expected_delivery_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        actual_start_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        actual_delivery_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distance_km: 280,
        revenue: 950
      }
    ]);
    console.log(`📦 Created ${trips.length} trips`);

    // ── Maintenance (exact spec: VAN-11 Engine Repair, Open) ─
    const maintenance = await Maintenance.create([
      {
        vehicle: vehicles[1]._id,   // Mercedes Sprinter (VAN-11)
        service_type: 'Engine Repair',
        service_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        odometer_at_service: 72000,
        description: 'Engine overheating issue — needs full inspection and coolant system repair.',
        cost: 1500,
        status: 'Open'
      }
    ]);
    console.log(`🔧 Created ${maintenance.length} maintenance records`);

    // ── Seed Rule-Breaker Alerts (Section 6) ─────────────────
    const alerts = await Alert.create([
      // Warning: Driver License Expired — Anjali Mehta
      {
        title: 'Driver License Expired',
        message: `Driver Anjali Mehta's license expired on ${new Date(drivers[1].license_expiry_date).toLocaleDateString()} and has been suspended.`,
        severity: 'warning',
        entity_type: 'driver',
        entity_id: drivers[1]._id,
        resolved: false
      },
      // Warning: Vehicle In Shop — VAN-11
      {
        title: 'Vehicle In Shop',
        message: `Vehicle VAN-11 is in shop for Engine Repair.`,
        severity: 'warning',
        entity_type: 'vehicle',
        entity_id: vehicles[1]._id,
        resolved: false
      },
      // Info: Trip Dispatched — T-DISPATCH-001
      {
        title: 'Trip Dispatched',
        message: `Trip T-DISPATCH-001 has been dispatched.`,
        severity: 'info',
        entity_type: 'trip',
        entity_id: trips[1]._id,
        resolved: false
      },
      // Warning: Low Safety Score — Anjali Mehta (68%)
      {
        title: 'Low Safety Score',
        message: `Anjali Mehta safety score is critically low: 68%`,
        severity: 'warning',
        entity_type: 'driver',
        entity_id: drivers[1]._id,
        resolved: false
      },
      // Warning: Maintenance Due — BIKE-3 has 15000km with no Oil Change
      {
        title: 'Maintenance Due',
        message: `Vehicle BIKE-3: Oil Change due — 15,000 km with no Oil Change record.`,
        severity: 'warning',
        entity_type: 'vehicle',
        entity_id: vehicles[2]._id,
        resolved: false
      }
    ]);
    console.log(`⚠️  Created ${alerts.length} seeded alerts`);

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:             admin@fleetflow.com / admin123');
    console.log('  Fleet Manager:     fleet@fleetflow.com / fleet123');
    console.log('  Dispatcher:        dispatch@fleetflow.com / dispatch123');
    console.log('  Safety Officer:    safety@fleetflow.com / safety123');
    console.log('  Financial Analyst: finance@fleetflow.com / finance123');
    console.log('\n📊 Seeded data:');
    console.log('  3 vehicles (TRK-42 Available, VAN-11 In Shop, BIKE-3 Available)');
    console.log('  3 drivers (Rajesh On Duty, Anjali Suspended, Vikram On Duty)');
    console.log('  3 trips (1 Draft, 1 Dispatched, 1 Completed)');
    console.log('  1 maintenance (VAN-11 Engine Repair, Open)');
    console.log('  5 Rule-Breaker alerts seeded for first-load demo');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
