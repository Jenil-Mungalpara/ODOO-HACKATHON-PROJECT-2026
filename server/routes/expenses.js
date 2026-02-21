const express = require('express');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// GET /api/expenses
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.trip) filter.trip = req.query.trip;
    if (req.query.from || req.query.to) {
      filter.expense_date = {};
      if (req.query.from) filter.expense_date.$gte = new Date(req.query.from);
      if (req.query.to) filter.expense_date.$lte = new Date(req.query.to);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .populate('trip', 'trip_code pickup_location delivery_location status')
      .populate('vehicle', 'name_model license_plate')
      .populate('driver', 'name')
      .sort({ expense_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, data: expenses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/expenses
router.post('/', auth, authorize('Financial Analyst', 'Admin'), async (req, res) => {
  try {
    // Validate: expense must link to a Completed trip
    const trip = await Trip.findById(req.body.trip);
    if (!trip) {
      return res.status(400).json({ success: false, message: 'Trip not found.' });
    }
    if (trip.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Expenses can only be recorded for Completed trips.'
      });
    }

    // Auto-fill vehicle and driver from trip
    const expenseData = {
      ...req.body,
      vehicle: req.body.vehicle || trip.assigned_vehicle,
      driver: req.body.driver || trip.assigned_driver
    };

    const expense = new Expense(expenseData);
    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('trip', 'trip_code')
      .populate('vehicle', 'name_model')
      .populate('driver', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', auth, authorize('Financial Analyst', 'Admin'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('trip', 'trip_code')
    .populate('vehicle', 'name_model')
    .populate('driver', 'name');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, authorize('Financial Analyst', 'Admin'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
