import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Cow {
  _id: string;
  name: string;
  identifier: string;
  farm: string;
  birthDate: string;
  status: 'active' | 'inactive';
}

interface CowState {
  cows: Cow[];
  loading: boolean;
  error: string | null;
}

const initialState: CowState = {
  cows: [],
  loading: false,
  error: null,
};

export const fetchCows = createAsyncThunk(
  'cow/fetchCows',
  async (farmId: string) => {
    const response = await api.get(`/farms/${farmId}/cows`);
    return response.data;
  }
);

export const createCow = createAsyncThunk(
  'cow/createCow',
  async (cowData: Omit<Cow, '_id'>) => {
    const response = await api.post(`/farms/${cowData.farm}/cows`, cowData);
    return response.data;
  }
);

const cowSlice = createSlice({
  name: 'cow',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCows.fulfilled, (state, action) => {
        state.loading = false;
        state.cows = action.payload;
      })
      .addCase(fetchCows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las vacas';
      })
      .addCase(createCow.fulfilled, (state, action) => {
        state.cows.push(action.payload);
      });
  },
});

export default cowSlice.reducer;
