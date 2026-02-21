const express = require('express');
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { onMaintenanceCreated, onMaintenanceCompleted } = require('../utils/automations');

const router = express.Router();

// GET /api/maintenance
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.from || req.query.to) {
      filter.service_date = {};
      if (req.query.from) filter.service_date.$gte = new Date(req.query.from);
      if (req.query.to) filter.service_date.$lte = new Date(req.query.to);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const total = await Maintenance.countDocuments(filter);
    const logs = await Maintenance.find(filter)
      .populate('vehicle', 'name_model license_plate type status')
      .sort({ service_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/maintenance/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await Maintenance.findById(req.params.id)
      .populate('vehicle');
    if (!log) return res.status(404).json({ success: false, message: 'Service log not found.' });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/maintenance
router.post('/', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    await maintenance.save();

    // Automation: set vehicle to In Shop
    await onMaintenanceCreated(maintenance);

    const populated = await Maintenance.findById(maintenance._id)
      .populate('vehicle', 'name_model license_plate');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/maintenance/:id
router.put('/:id', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('vehicle', 'name_model license_plate');
    if (!maintenance) return res.status(404).json({ success: false, message: 'Service log not found.' });
    res.json({ success: true, data: maintenance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/maintenance/:id/complete
router.post('/:id/complete', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ success: false, message: 'Service log not found.' });
    if (maintenance.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Already completed.' });
    }

    await onMaintenanceCompleted(maintenance);

    const populated = await Maintenance.findById(maintenance._id)
      .populate('vehicle', 'name_model license_plate status');
    res.json({ success: true, data: populated, message: 'Maintenance completed. Vehicle status updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', auth, authorize('Fleet Manager', 'Admin'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    if (!maintenance) return res.status(404).json({ success: false, message: 'Service log not found.' });
    res.json({ success: true, message: 'Service log deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
