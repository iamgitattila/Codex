import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Scenario } from '../../types';
import { getAllScenarios } from '../../database/queries';

interface ScenariosState {
  scenarios: Scenario[];
  loading: boolean;
  error: string | null;
}

const initialState: ScenariosState = {
  scenarios: [],
  loading: false,
  error: null,
};

export const fetchScenarios = createAsyncThunk(
  'scenarios/fetchAll',
  async () => {
    const scenarios = await getAllScenarios();
    return scenarios;
  }
);

const scenariosSlice = createSlice({
  name: 'scenarios',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScenarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarios.fulfilled, (state, action: PayloadAction<Scenario[]>) => {
        state.loading = false;
        state.scenarios = action.payload;
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch scenarios';
      });
  },
});

export default scenariosSlice.reducer;
