const express = require('express');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const { generateAlerts } = require('../utils/automations');

const router = express.Router();

// GET /api/alerts — aggregate feed (persisted + live)
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await generateAlerts();
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/alerts/persisted — DB-only alerts with pagination
router.get('/persisted', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.entity_type) filter.entity_type = req.query.entity_type;
    if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';

    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alerts/:id/resolve — resolve an alert with a note
router.post('/:id/resolve', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    if (alert.resolved) return res.status(400).json({ success: false, message: 'Alert already resolved.' });

    alert.resolved = true;
    alert.resolved_at = new Date();
    alert.resolution_note = req.body.resolution_note || '';
    await alert.save();

    res.json({ success: true, data: alert, message: 'Alert resolved.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
