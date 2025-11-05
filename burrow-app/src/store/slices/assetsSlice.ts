import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from '../../types';
import { assetService } from '../../database/services/assetService';

interface AssetsState {
  items: Asset[];
  loading: boolean;
  error: string | null;
  selectedAsset: Asset | null;
}

const initialState: AssetsState = {
  items: [],
  loading: false,
  error: null,
  selectedAsset: null,
};

export const fetchAssets = createAsyncThunk('assets/fetchAll', async () => {
  return await assetService.getAll();
});

export const fetchAssetById = createAsyncThunk('assets/fetchById', async (id: string) => {
  return await assetService.getById(id);
});

export const createAsset = createAsyncThunk('assets/create', async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  return await assetService.create(asset);
});

export const updateAsset = createAsyncThunk(
  'assets/update',
  async ({ id, updates }: { id: string; updates: Partial<Asset> }) => {
    await assetService.update(id, updates);
    return await assetService.getById(id);
  }
);

export const deleteAsset = createAsyncThunk('assets/delete', async (id: string) => {
  await assetService.delete(id);
  return id;
});

export const searchAssets = createAsyncThunk('assets/search', async (query: string) => {
  return await assetService.search(query);
});

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setSelectedAsset: (state, action: PayloadAction<Asset | null>) => {
      state.selectedAsset = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assets
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch assets';
      })
      // Fetch by ID
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.selectedAsset = action.payload;
      })
      // Create asset
      .addCase(createAsset.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update asset
      .addCase(updateAsset.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedAsset?.id === action.payload.id) {
            state.selectedAsset = action.payload;
          }
        }
      })
      // Delete asset
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedAsset?.id === action.payload) {
          state.selectedAsset = null;
        }
      })
      // Search
      .addCase(searchAssets.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { setSelectedAsset, clearError } = assetsSlice.actions;
export default assetsSlice.reducer;
