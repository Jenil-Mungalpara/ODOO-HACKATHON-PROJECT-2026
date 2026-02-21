const express = require('express');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// GET /api/vehicles
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: vehicles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vehicles/available
router.get('/available', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'Available' }).sort({ name_model: 1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vehicles
router.post('/', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'License plate already exists.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'License plate already exists.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    res.json({ success: true, message: 'Vehicle deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
