const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  entity_type: { type: String, enum: ['vehicle', 'driver', 'trip', 'maintenance'] },
  entity_id: { type: mongoose.Schema.Types.ObjectId },
  resolved: { type: Boolean, default: false },
  resolved_at: { type: Date, default: null },
  resolution_note: { type: String, default: null }
}, { timestamps: true });

// Index for quick feed queries
alertSchema.index({ resolved: 1, createdAt: -1 });
alertSchema.index({ entity_type: 1, entity_id: 1 });

module.exports = mongoose.model('Alert', alertSchema);
