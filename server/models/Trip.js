const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  trip_code: { type: String, unique: true },
  pickup_location: { type: String, required: true, trim: true },
  delivery_location: { type: String, required: true, trim: true },
  cargo_weight_kg: { type: Number, required: true, min: 0 },
  assigned_vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  assigned_driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  expected_start_date: { type: Date },
  expected_delivery_date: { type: Date },
  actual_start_date: { type: Date },
  actual_delivery_date: { type: Date },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  distance_km: { type: Number, default: 0, min: 0 },
  revenue: { type: Number, default: 0, min: 0 },
  estimated_fuel_cost: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Auto-generate trip code before save
tripSchema.pre('save', async function(next) {
  if (!this.trip_code) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Trip').countDocuments();
    this.trip_code = `T-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
