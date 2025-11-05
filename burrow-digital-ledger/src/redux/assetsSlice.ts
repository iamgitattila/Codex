// Redux slice for assets
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Asset, AssetWithLocation } from '../types';
import * as AssetService from '../database/assetService';

interface AssetsState {
  assets: AssetWithLocation[];
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    category: string | null;
    locationId: string | null;
    showBelowPar: boolean;
    showExpiringSoon: boolean;
  };
}

const initialState: AssetsState = {
  assets: [],
  selectedAsset: null,
  loading: false,
  error: null,
  filters: {
    searchTerm: '',
    category: null,
    locationId: null,
    showBelowPar: false,
    showExpiringSoon: false,
  },
};

// Async thunks
export const fetchAssets = createAsyncThunk('assets/fetchAll', async () => {
  return await AssetService.getAllAssets();
});

export const fetchAssetById = createAsyncThunk(
  'assets/fetchById',
  async (id: string) => {
    return await AssetService.getAssetById(id);
  }
);

export const createAsset = createAsyncThunk(
  'assets/create',
  async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    return await AssetService.createAsset(asset);
  }
);

export const updateAsset = createAsyncThunk(
  'assets/update',
  async ({ id, updates }: { id: string; updates: Partial<Asset> }) => {
    await AssetService.updateAsset(id, updates);
    return { id, updates };
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/delete',
  async (id: string) => {
    await AssetService.deleteAsset(id);
    return id;
  }
);

export const searchAssets = createAsyncThunk(
  'assets/search',
  async (searchTerm: string) => {
    return await AssetService.searchAssets(searchTerm);
  }
);

export const fetchExpiringAssets = createAsyncThunk(
  'assets/fetchExpiring',
  async (days: number = 30) => {
    return await AssetService.getExpiringAssets(days);
  }
);

export const fetchAssetsBelowPar = createAsyncThunk(
  'assets/fetchBelowPar',
  async () => {
    return await AssetService.getAssetsBelowPar();
  }
);

// Slice
const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setLocationFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.locationId = action.payload;
    },
    toggleBelowParFilter: (state) => {
      state.filters.showBelowPar = !state.filters.showBelowPar;
    },
    toggleExpiringSoonFilter: (state) => {
      state.filters.showExpiringSoon = !state.filters.showExpiringSoon;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    selectAsset: (state, action: PayloadAction<Asset | null>) => {
      state.selectedAsset = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all assets
    builder.addCase(fetchAssets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssets.fulfilled, (state, action) => {
      state.loading = false;
      state.assets = action.payload;
    });
    builder.addCase(fetchAssets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch assets';
    });

    // Fetch asset by ID
    builder.addCase(fetchAssetById.fulfilled, (state, action) => {
      state.selectedAsset = action.payload;
    });

    // Create asset
    builder.addCase(createAsset.fulfilled, (state, action) => {
      state.assets.push(action.payload as AssetWithLocation);
    });

    // Update asset
    builder.addCase(updateAsset.fulfilled, (state, action) => {
      const { id, updates } = action.payload;
      const index = state.assets.findIndex((a) => a.id === id);
      if (index !== -1) {
        state.assets[index] = { ...state.assets[index], ...updates };
      }
      if (state.selectedAsset && state.selectedAsset.id === id) {
        state.selectedAsset = { ...state.selectedAsset, ...updates };
      }
    });

    // Delete asset
    builder.addCase(deleteAsset.fulfilled, (state, action) => {
      state.assets = state.assets.filter((a) => a.id !== action.payload);
      if (state.selectedAsset && state.selectedAsset.id === action.payload) {
        state.selectedAsset = null;
      }
    });

    // Search assets
    builder.addCase(searchAssets.fulfilled, (state, action) => {
      state.assets = action.payload;
    });

    // Fetch expiring assets
    builder.addCase(fetchExpiringAssets.fulfilled, (state, action) => {
      state.assets = action.payload;
    });

    // Fetch assets below par
    builder.addCase(fetchAssetsBelowPar.fulfilled, (state, action) => {
      state.assets = action.payload;
    });
  },
});

export const {
  setSearchTerm,
  setCategoryFilter,
  setLocationFilter,
  toggleBelowParFilter,
  toggleExpiringSoonFilter,
  clearFilters,
  selectAsset,
} = assetsSlice.actions;

export default assetsSlice.reducer;
