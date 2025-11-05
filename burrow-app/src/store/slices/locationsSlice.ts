import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Location } from '../../types';
import { locationService } from '../../database/services/locationService';

interface LocationsState {
  items: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchLocations = createAsyncThunk('locations/fetchAll', async () => {
  return await locationService.getAll();
});

export const createLocation = createAsyncThunk('locations/create', async (location: Omit<Location, 'id' | 'createdAt'>) => {
  return await locationService.create(location);
});

export const updateLocation = createAsyncThunk(
  'locations/update',
  async ({ id, updates }: { id: string; updates: Partial<Location> }) => {
    await locationService.update(id, updates);
    return await locationService.getById(id);
  }
);

export const deleteLocation = createAsyncThunk('locations/delete', async (id: string) => {
  await locationService.delete(id);
  return id;
});

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch locations';
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
