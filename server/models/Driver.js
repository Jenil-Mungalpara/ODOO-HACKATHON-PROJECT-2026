const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  license_number: { type: String, required: true, unique: true, trim: true },
  license_expiry_date: { type: Date, required: true },
  contact: { type: String, trim: true },
  status: {
    type: String,
    enum: ['On Duty', 'Off Duty', 'Suspended', 'Banned'],
    default: 'Off Duty'
  },
  total_trips_assigned: { type: Number, default: 0, min: 0 },
  trips_completed: { type: Number, default: 0, min: 0 },
  safety_score_pct: { type: Number, default: 100, min: 0, max: 100 },
  incidents: { type: Number, default: 0, min: 0 },
  warnings: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Virtual: completion rate
driverSchema.virtual('completion_rate').get(function() {
  if (this.total_trips_assigned === 0) return 100;
  return Math.round((this.trips_completed / this.total_trips_assigned) * 100);
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
