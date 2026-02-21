const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  service_type: {
    type: String,
    enum: ['Oil Change', 'Tire Replacement', 'Engine Repair', 'Brake Service', 'General Inspection', 'Battery Replacement', 'Transmission', 'Other'],
    required: true
  },
  service_date: { type: Date, default: Date.now },
  odometer_at_service: { type: Number, min: 0 },
  description: { type: String, trim: true },
  cost: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['Open', 'Completed'],
    default: 'Open'
  },
  completed_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
