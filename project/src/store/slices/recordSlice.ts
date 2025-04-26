import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface DairyRecord {
  _id: string;
  cowId: string;
  farmId: string;
  production_liters: number;
  temperature: number;
  humidity: number;
  feed_amount: number;
  milking_session: 'morning' | 'afternoon' | 'evening';
  createdAt: string;
}

interface RecordState {
  records: DairyRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: RecordState = {
  records: [],
  loading: false,
  error: null,
};

export const fetchRecords = createAsyncThunk(
  'record/fetchRecords',
  async ({ farmId, cowId }: { farmId: string; cowId?: string }) => {
    const url = cowId ? `/farms/${farmId}/cows/${cowId}/records` : `/farms/${farmId}/records`;
    const response = await api.get(url);
    return response.data;
  }
);

export const createRecord = createAsyncThunk(
  'record/createRecord',
  async (recordData: Omit<DairyRecord, '_id' | 'createdAt'>) => {
    const response = await api.post(`/farms/${recordData.farmId}/cows/${recordData.cowId}/records`, recordData);
    return response.data;
  }
);

const recordSlice = createSlice({
  name: 'record',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar los registros';
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.records.push(action.payload);
      });
  },
});

export default recordSlice.reducer;
