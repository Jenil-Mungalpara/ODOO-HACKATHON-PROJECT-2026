const express = require('express');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  validateTripCreation,
  onTripDispatched,
  onTripCompleted,
  onTripCancelled
} = require('../utils/automations');

const router = express.Router();

// GET /api/trips
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const total = await Trip.countDocuments(filter);
    const trips = await Trip.find(filter)
      .populate('assigned_vehicle', 'name_model license_plate type max_capacity_kg status')
      .populate('assigned_driver', 'name license_number status safety_score_pct')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: trips, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/trips/completed — for expense linking
router.get('/completed', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ status: 'Completed' })
      .populate('assigned_vehicle', 'name_model license_plate')
      .populate('assigned_driver', 'name')
      .sort({ actual_delivery_date: -1 });
    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/trips/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('assigned_vehicle')
      .populate('assigned_driver');
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/trips
router.post('/', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    // Validate trip data
    const validationErrors = await validateTripCreation(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Trip validation failed.',
        errors: validationErrors
      });
    }

    const trip = new Trip(req.body);
    await trip.save();

    // If creating as Dispatched, trigger lifecycle
    if (trip.status === 'Dispatched') {
      await onTripDispatched(trip);
    }

    const populated = await Trip.findById(trip._id)
      .populate('assigned_vehicle', 'name_model license_plate')
      .populate('assigned_driver', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/trips/:id
router.put('/:id', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });

    // If assigning vehicle/driver, validate
    if (req.body.assigned_vehicle || req.body.assigned_driver || req.body.cargo_weight_kg) {
      const checkData = { ...trip.toObject(), ...req.body };
      const validationErrors = await validateTripCreation(checkData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Trip validation failed.',
          errors: validationErrors
        });
      }
    }

    Object.assign(trip, req.body);
    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('assigned_vehicle', 'name_model license_plate')
      .populate('assigned_driver', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/trips/:id/dispatch
router.post('/:id/dispatch', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    if (trip.status !== 'Draft') {
      return res.status(400).json({ success: false, message: `Cannot dispatch a trip with status "${trip.status}".` });
    }
    if (!trip.assigned_vehicle || !trip.assigned_driver) {
      return res.status(400).json({ success: false, message: 'Vehicle and driver must be assigned before dispatch.' });
    }

    // Re-validate before dispatch
    const validationErrors = await validateTripCreation(trip);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot dispatch — validation failed.',
        errors: validationErrors
      });
    }

    trip.status = 'Dispatched';
    await onTripDispatched(trip);

    const populated = await Trip.findById(trip._id)
      .populate('assigned_vehicle')
      .populate('assigned_driver');

    res.json({ success: true, data: populated, message: 'Trip dispatched successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/trips/:id/complete
router.post('/:id/complete', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ success: false, message: `Cannot complete a trip with status "${trip.status}".` });
    }

    trip.status = 'Completed';
    await onTripCompleted(trip);

    const populated = await Trip.findById(trip._id)
      .populate('assigned_vehicle')
      .populate('assigned_driver');

    res.json({ success: true, data: populated, message: 'Trip completed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/trips/:id/cancel
router.post('/:id/cancel', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    if (trip.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed trip.' });
    }

    trip.status = 'Cancelled';
    await onTripCancelled(trip);

    res.json({ success: true, data: trip, message: 'Trip cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', auth, authorize('Dispatcher', 'Admin'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
    if (trip.status === 'Dispatched') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active trip. Cancel it first.' });
    }
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Trip deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
