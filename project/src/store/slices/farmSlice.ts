import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Farm {
  _id: string;
  name: string;
  location: string;
  owner: string;
}

interface FarmState {
  farms: Farm[];
  currentFarm: Farm | null;
  loading: boolean;
  error: string | null;
}

const initialState: FarmState = {
  farms: [],
  currentFarm: null,
  loading: false,
  error: null,
};

export const fetchFarms = createAsyncThunk('farm/fetchFarms', async () => {
  const response = await api.get('/farms');
  return response.data;
});

export const createFarm = createAsyncThunk(
  'farm/createFarm',
  async (farmData: Omit<Farm, '_id'>) => {
    const response = await api.post('/farms', farmData);
    return response.data;
  }
);

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setCurrentFarm: (state, action) => {
      state.currentFarm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las fincas';
      })
      .addCase(createFarm.fulfilled, (state, action) => {
        state.farms.push(action.payload);
      });
  },
});

export const { setCurrentFarm } = farmSlice.actions;
export default farmSlice.reducer;