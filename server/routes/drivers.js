const express = require('express');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// GET /api/drivers
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
    const total = await Driver.countDocuments(filter);
    const drivers = await Driver.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: drivers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drivers/eligible — On Duty + valid license
router.get('/eligible', auth, async (req, res) => {
  try {
    const drivers = await Driver.find({
      status: 'On Duty',
      license_expiry_date: { $gte: new Date() }
    }).sort({ name: 1 });
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drivers/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drivers
router.post('/', auth, authorize('Safety Officer', 'Admin'), async (req, res) => {
  try {
    const driver = new Driver(req.body);
    // Auto-suspend if license already expired
    if (new Date(driver.license_expiry_date) < new Date()) {
      driver.status = 'Suspended';
    }
    await driver.save();
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'License number already exists.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/drivers/:id
router.put('/:id', auth, authorize('Safety Officer', 'Admin'), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/drivers/:id/suspend
router.post('/:id/suspend', auth, authorize('Safety Officer', 'Admin'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    driver.status = 'Suspended';
    driver.warnings += 1;
    await driver.save();
    res.json({ success: true, data: driver, message: `${driver.name} has been suspended.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drivers/:id/ban
router.post('/:id/ban', auth, authorize('Admin'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    driver.status = 'Banned';
    await driver.save();
    res.json({ success: true, data: driver, message: `${driver.name} has been banned.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drivers/:id/reinstate
router.post('/:id/reinstate', auth, authorize('Safety Officer', 'Admin'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    if (new Date(driver.license_expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot reinstate — license is still expired.' });
    }
    driver.status = 'On Duty';
    await driver.save();
    res.json({ success: true, data: driver, message: `${driver.name} has been reinstated.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/drivers/:id
router.delete('/:id', auth, authorize('Safety Officer', 'Admin'), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.json({ success: true, message: 'Driver deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
