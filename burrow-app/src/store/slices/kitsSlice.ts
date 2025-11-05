import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Kit } from '../../types';
import { kitService } from '../../database/services/kitService';

interface KitsState {
  items: Kit[];
  loading: boolean;
  error: string | null;
}

const initialState: KitsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchKits = createAsyncThunk('kits/fetchAll', async () => {
  return await kitService.getAll();
});

export const createKit = createAsyncThunk('kits/create', async (kit: Omit<Kit, 'id' | 'createdAt'>) => {
  return await kitService.create(kit);
});

export const updateKit = createAsyncThunk(
  'kits/update',
  async ({ id, updates }: { id: string; updates: Partial<Kit> }) => {
    await kitService.update(id, updates);
    return await kitService.getById(id);
  }
);

export const deleteKit = createAsyncThunk('kits/delete', async (id: string) => {
  await kitService.delete(id);
  return id;
});

const kitsSlice = createSlice({
  name: 'kits',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchKits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch kits';
      })
      .addCase(createKit.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateKit.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })
      .addCase(deleteKit.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = kitsSlice.actions;
export default kitsSlice.reducer;
