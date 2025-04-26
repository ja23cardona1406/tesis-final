import mongoose from 'mongoose';

const dairyRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  cowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cow',
    required: true
  },
  production_liters: {
    type: Number,
    required: true,
    min: 0
  },
  temperature: {
    type: Number,
    required: true,
    min: -10,
    max: 50
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  feed_amount: {
    type: Number,
    required: true,
    min: 0
  },
  milking_session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  }
}, {
  timestamps: true
});

dairyRecordSchema.index({ farmId: 1, cowId: 1, createdAt: 1 });

export const DairyRecord = mongoose.model('DairyRecord', dairyRecordSchema);