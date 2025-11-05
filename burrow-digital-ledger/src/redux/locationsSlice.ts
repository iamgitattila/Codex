// Redux slice for locations
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Location } from '../types';
import * as LocationService from '../database/locationService';

interface LocationsState {
  locations: (Location & { asset_count?: number })[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  locations: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async () => {
    return await LocationService.getLocationsWithAssetCount();
  }
);

export const createLocation = createAsyncThunk(
  'locations/create',
  async (location: Omit<Location, 'id' | 'created_at'>) => {
    return await LocationService.createLocation(location);
  }
);

export const updateLocation = createAsyncThunk(
  'locations/update',
  async ({ id, updates }: { id: string; updates: Partial<Location> }) => {
    await LocationService.updateLocation(id, updates);
    return { id, updates };
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/delete',
  async (id: string) => {
    await LocationService.deleteLocation(id);
    return id;
  }
);

// Slice
const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch locations
    builder.addCase(fetchLocations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLocations.fulfilled, (state, action) => {
      state.loading = false;
      state.locations = action.payload;
    });
    builder.addCase(fetchLocations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch locations';
    });

    // Create location
    builder.addCase(createLocation.fulfilled, (state, action) => {
      state.locations.push({ ...action.payload, asset_count: 0 });
    });

    // Update location
    builder.addCase(updateLocation.fulfilled, (state, action) => {
      const { id, updates } = action.payload;
      const index = state.locations.findIndex((l) => l.id === id);
      if (index !== -1) {
        state.locations[index] = { ...state.locations[index], ...updates };
      }
    });

    // Delete location
    builder.addCase(deleteLocation.fulfilled, (state, action) => {
      state.locations = state.locations.filter((l) => l.id !== action.payload);
    });
  },
});

export default locationsSlice.reducer;
