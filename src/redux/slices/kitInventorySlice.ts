import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KitInventoryItem, KitScenario } from '../../types';

interface KitInventoryState {
  inventory: KitInventoryItem[];
  scenarios: KitScenario[];
}

const initialState: KitInventoryState = {
  inventory: [],
  scenarios: [
    {
      id: 'home_bugout',
      kitName: 'Home Bug-Out Kit',
      protocolIds: ['severe_bleeding', 'cpr_airway', 'fractures', 'burns'],
      completionPercentage: 0,
    },
    {
      id: 'vehicle_edc',
      kitName: 'Vehicle EDC Kit',
      protocolIds: ['severe_bleeding', 'fractures'],
      completionPercentage: 0,
    },
  ],
};

const kitInventorySlice = createSlice({
  name: 'kitInventory',
  initialState,
  reducers: {
    addInventoryItem: (state, action: PayloadAction<KitInventoryItem>) => {
      const existingIndex = state.inventory.findIndex((item) => item.id === action.payload.id);
      if (existingIndex > -1) {
        state.inventory[existingIndex] = action.payload;
      } else {
        state.inventory.push(action.payload);
      }
    },
    updateInventoryQuantity: (
      state,
      action: PayloadAction<{ id: string; quantityOwned: number }>
    ) => {
      const item = state.inventory.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantityOwned = action.payload.quantityOwned;
      }
    },
    removeInventoryItem: (state, action: PayloadAction<string>) => {
      state.inventory = state.inventory.filter((item) => item.id !== action.payload);
    },
    addKitScenario: (state, action: PayloadAction<KitScenario>) => {
      state.scenarios.push(action.payload);
    },
    updateKitScenario: (state, action: PayloadAction<KitScenario>) => {
      const index = state.scenarios.findIndex((s) => s.id === action.payload.id);
      if (index > -1) {
        state.scenarios[index] = action.payload;
      }
    },
  },
});

export const {
  addInventoryItem,
  updateInventoryQuantity,
  removeInventoryItem,
  addKitScenario,
  updateKitScenario,
} = kitInventorySlice.actions;
export default kitInventorySlice.reducer;
