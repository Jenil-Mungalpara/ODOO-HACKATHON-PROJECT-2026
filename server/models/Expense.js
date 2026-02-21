const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  distance_covered_km: { type: Number, default: 0, min: 0 },
  fuel_liters: { type: Number, default: 0, min: 0 },
  fuel_cost: { type: Number, default: 0, min: 0 },
  misc_cost: { type: Number, default: 0, min: 0 },
  expense_date: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Recorded'],
    default: 'Pending'
  }
}, { timestamps: true });

// Virtual: total cost
expenseSchema.virtual('total_cost').get(function() {
  return this.fuel_cost + this.misc_cost;
});

expenseSchema.set('toJSON', { virtuals: true });
expenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema);
