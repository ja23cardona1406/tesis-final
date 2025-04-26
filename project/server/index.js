import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { dairyRecordRoutes } from './routes/dairyRecord.js';
import { userRoutes } from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/records', dairyRecordRoutes);
app.use('/api/users', userRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error conectando a MongoDB:', error));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});