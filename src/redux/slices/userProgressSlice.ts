import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProgress } from '../../types';

interface UserProgressState {
  progress: Record<string, UserProgress>;
  bookmarks: string[];
}

const initialState: UserProgressState = {
  progress: {},
  bookmarks: [],
};

const userProgressSlice = createSlice({
  name: 'userProgress',
  initialState,
  reducers: {
    updateProgress: (state, action: PayloadAction<UserProgress>) => {
      state.progress[action.payload.protocolId] = action.payload;
    },
    incrementViewCount: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload;
      if (state.progress[protocolId]) {
        state.progress[protocolId].viewCount += 1;
        state.progress[protocolId].lastViewed = new Date().toISOString();
      } else {
        state.progress[protocolId] = {
          protocolId,
          status: 'viewed',
          viewCount: 1,
          lastViewed: new Date().toISOString(),
          timeSpentSeconds: 0,
          bookmarked: false,
        };
      }
    },
    addTimeSpent: (state, action: PayloadAction<{ protocolId: string; seconds: number }>) => {
      const { protocolId, seconds } = action.payload;
      if (state.progress[protocolId]) {
        state.progress[protocolId].timeSpentSeconds += seconds;
      }
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const protocolId = action.payload;
      const index = state.bookmarks.indexOf(protocolId);
      if (index > -1) {
        state.bookmarks.splice(index, 1);
      } else {
        state.bookmarks.push(protocolId);
      }
      if (state.progress[protocolId]) {
        state.progress[protocolId].bookmarked = !state.progress[protocolId].bookmarked;
      }
    },
    updateStatus: (
      state,
      action: PayloadAction<{ protocolId: string; status: 'viewed' | 'studied' | 'mastered' }>
    ) => {
      const { protocolId, status } = action.payload;
      if (state.progress[protocolId]) {
        state.progress[protocolId].status = status;
      }
    },
  },
});

export const { updateProgress, incrementViewCount, addTimeSpent, toggleBookmark, updateStatus } =
  userProgressSlice.actions;
export default userProgressSlice.reducer;
