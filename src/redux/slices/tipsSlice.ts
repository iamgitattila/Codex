import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tip } from '../../types';
import { getTipsByScenarioId, getTipById } from '../../database/queries';

interface TipsState {
  tipsByScenario: { [scenarioId: string]: Tip[] };
  currentTip: Tip | null;
  loading: boolean;
  error: string | null;
}

const initialState: TipsState = {
  tipsByScenario: {},
  currentTip: null,
  loading: false,
  error: null,
};

export const fetchTipsByScenario = createAsyncThunk(
  'tips/fetchByScenario',
  async (scenarioId: string) => {
    const tips = await getTipsByScenarioId(scenarioId);
    return { scenarioId, tips };
  }
);

export const fetchTipById = createAsyncThunk(
  'tips/fetchById',
  async (tipId: string) => {
    const tip = await getTipById(tipId);
    return tip;
  }
);

const tipsSlice = createSlice({
  name: 'tips',
  initialState,
  reducers: {
    clearCurrentTip: (state) => {
      state.currentTip = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTipsByScenario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTipsByScenario.fulfilled,
        (state, action: PayloadAction<{ scenarioId: string; tips: Tip[] }>) => {
          state.loading = false;
          state.tipsByScenario[action.payload.scenarioId] = action.payload.tips;
        }
      )
      .addCase(fetchTipsByScenario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tips';
      })
      .addCase(fetchTipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTipById.fulfilled, (state, action: PayloadAction<Tip | null>) => {
        state.loading = false;
        state.currentTip = action.payload;
      })
      .addCase(fetchTipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tip';
      });
  },
});

export const { clearCurrentTip } = tipsSlice.actions;
export default tipsSlice.reducer;
