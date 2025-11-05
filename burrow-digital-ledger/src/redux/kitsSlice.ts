// Redux slice for kits
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Kit, KitWithItems, KitItem } from '../types';
import * as KitService from '../database/kitService';

interface KitsState {
  kits: KitWithItems[];
  selectedKit: KitWithItems | null;
  loading: boolean;
  error: string | null;
}

const initialState: KitsState = {
  kits: [],
  selectedKit: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchKits = createAsyncThunk('kits/fetchAll', async () => {
  return await KitService.getAllKits();
});

export const fetchKitById = createAsyncThunk(
  'kits/fetchById',
  async (id: string) => {
    return await KitService.getKitById(id);
  }
);

export const createKit = createAsyncThunk(
  'kits/create',
  async (kit: Omit<Kit, 'id' | 'created_at'>) => {
    const newKit = await KitService.createKit(kit);
    return await KitService.getKitById(newKit.id);
  }
);

export const updateKit = createAsyncThunk(
  'kits/update',
  async ({ id, updates }: { id: string; updates: Partial<Kit> }) => {
    await KitService.updateKit(id, updates);
    return { id, updates };
  }
);

export const deleteKit = createAsyncThunk('kits/delete', async (id: string) => {
  await KitService.deleteKit(id);
  return id;
});

export const addItemToKit = createAsyncThunk(
  'kits/addItem',
  async ({
    kitId,
    assetId,
    quantityRequired,
  }: {
    kitId: string;
    assetId: string;
    quantityRequired: number;
  }) => {
    await KitService.addItemToKit(kitId, assetId, quantityRequired);
    return await KitService.getKitById(kitId);
  }
);

export const removeItemFromKit = createAsyncThunk(
  'kits/removeItem',
  async ({ kitId, assetId }: { kitId: string; assetId: string }) => {
    await KitService.removeItemFromKit(kitId, assetId);
    return await KitService.getKitById(kitId);
  }
);

export const toggleItemPacked = createAsyncThunk(
  'kits/toggleItemPacked',
  async ({ kitItemId, kitId }: { kitItemId: string; kitId: string }) => {
    await KitService.toggleItemPacked(kitItemId);
    return await KitService.getKitById(kitId);
  }
);

export const verifyAllKitItems = createAsyncThunk(
  'kits/verifyAll',
  async (kitId: string) => {
    await KitService.verifyAllKitItems(kitId);
    return await KitService.getKitById(kitId);
  }
);

// Slice
const kitsSlice = createSlice({
  name: 'kits',
  initialState,
  reducers: {
    selectKit: (state, action: PayloadAction<KitWithItems | null>) => {
      state.selectedKit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all kits
    builder.addCase(fetchKits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKits.fulfilled, (state, action) => {
      state.loading = false;
      state.kits = action.payload;
    });
    builder.addCase(fetchKits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch kits';
    });

    // Fetch kit by ID
    builder.addCase(fetchKitById.fulfilled, (state, action) => {
      state.selectedKit = action.payload;
    });

    // Create kit
    builder.addCase(createKit.fulfilled, (state, action) => {
      if (action.payload) {
        state.kits.push(action.payload);
      }
    });

    // Update kit
    builder.addCase(updateKit.fulfilled, (state, action) => {
      const { id, updates } = action.payload;
      const index = state.kits.findIndex((k) => k.id === id);
      if (index !== -1) {
        state.kits[index] = { ...state.kits[index], ...updates };
      }
      if (state.selectedKit && state.selectedKit.id === id) {
        state.selectedKit = { ...state.selectedKit, ...updates };
      }
    });

    // Delete kit
    builder.addCase(deleteKit.fulfilled, (state, action) => {
      state.kits = state.kits.filter((k) => k.id !== action.payload);
      if (state.selectedKit && state.selectedKit.id === action.payload) {
        state.selectedKit = null;
      }
    });

    // Add item to kit
    builder.addCase(addItemToKit.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.kits.findIndex((k) => k.id === action.payload!.id);
        if (index !== -1) {
          state.kits[index] = action.payload;
        }
        if (state.selectedKit && state.selectedKit.id === action.payload.id) {
          state.selectedKit = action.payload;
        }
      }
    });

    // Remove item from kit
    builder.addCase(removeItemFromKit.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.kits.findIndex((k) => k.id === action.payload!.id);
        if (index !== -1) {
          state.kits[index] = action.payload;
        }
        if (state.selectedKit && state.selectedKit.id === action.payload.id) {
          state.selectedKit = action.payload;
        }
      }
    });

    // Toggle item packed
    builder.addCase(toggleItemPacked.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.kits.findIndex((k) => k.id === action.payload!.id);
        if (index !== -1) {
          state.kits[index] = action.payload;
        }
        if (state.selectedKit && state.selectedKit.id === action.payload.id) {
          state.selectedKit = action.payload;
        }
      }
    });

    // Verify all kit items
    builder.addCase(verifyAllKitItems.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.kits.findIndex((k) => k.id === action.payload!.id);
        if (index !== -1) {
          state.kits[index] = action.payload;
        }
        if (state.selectedKit && state.selectedKit.id === action.payload.id) {
          state.selectedKit = action.payload;
        }
      }
    });
  },
});

export const { selectKit } = kitsSlice.actions;

export default kitsSlice.reducer;
