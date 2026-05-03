const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  lat: Number,
  lng: Number,
  quantity: { type: Number, default: 0 } // waste level %
});

module.exports = mongoose.model("Bin", binSchema);
