const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

// ✅ GET all bins
router.get("/", async (req, res) => {
  const bins = await Bin.find();
  res.json(bins);
});

// ✅ ADD new bin
router.post("/", async (req, res) => {
  try {
    const newBin = new Bin(req.body);
    await newBin.save();
    res.json(newBin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE bin
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid bin id" });
  }

  await Bin.deleteOne({ id });
  res.json({ message: "Bin deleted" });
});

// 🔥 RESET bin (must be registered before PUT /:id)
router.put("/reset/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid bin id" });
  }

  try {
    const updated = await Bin.findOneAndUpdate(
      { id },
      { quantity: 0 },
      { new: true }
    );

    console.log(`♻️ Bin ${id} reset to 0%`);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE waste level (Python usually sends only { quantity })
// Load→save preserves existing lat/lng (PUT with only quantity never moves the pin).
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid bin id" });
  }

  try {
    const rawQty = Number(req.body.quantity);
    const quantity = Number.isFinite(rawQty)
      ? Math.min(Math.max(rawQty, 0), 100)
      : 0;

    let doc = await Bin.findOne({ id });

    if (!doc) {
      doc = new Bin({
        id,
        quantity,
        lat: 10.064,
        lng: 76.628,
      });
    } else {
      doc.quantity = quantity;
      const lat = req.body.lat != null ? Number(req.body.lat) : null;
      const lng = req.body.lng != null ? Number(req.body.lng) : null;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        doc.lat = lat;
        doc.lng = lng;
      }
    }

    await doc.save();

    console.log(`📡 Bin ${id} updated → ${quantity}%`);

    if (quantity > 80) {
      console.log(`⚠️ Bin ${id} is almost full!`);
    }

    res.json(doc);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;