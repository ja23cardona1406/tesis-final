import express from 'express';
import { DairyRecord } from '../models/DairyRecord.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Crear nuevo registro
router.post('/', auth, async (req, res) => {
  try {
    const record = new DairyRecord({
      ...req.body,
      userId: req.user._id
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener registros del usuario
router.get('/', auth, async (req, res) => {
  try {
    const records = await DairyRecord.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const dairyRecordRoutes = router;