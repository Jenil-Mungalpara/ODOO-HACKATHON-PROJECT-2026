const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name_model: { type: String, required: true, trim: true },
  license_plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: {
    type: String,
    enum: ['Truck', 'Van', 'Bike'],
    required: true
  },
  max_capacity_kg: { type: Number, required: true, min: 0 },
  odometer_km: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  },
  acquisition_cost: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
