import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Protocol } from '../../constants/protocols';
import { PROTOCOLS } from '../../constants/protocols';

interface ProtocolsState {
  protocols: Protocol[];
  loading: boolean;
  error: string | null;
}

const initialState: ProtocolsState = {
  protocols: PROTOCOLS,
  loading: false,
  error: null,
};

const protocolsSlice = createSlice({
  name: 'protocols',
  initialState,
  reducers: {
    setProtocols: (state, action: PayloadAction<Protocol[]>) => {
      state.protocols = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProtocols, setLoading, setError } = protocolsSlice.actions;
export default protocolsSlice.reducer;
