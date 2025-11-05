import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProgress, Bookmark, DailyChallenge } from '../../types';
import {
  getUserProgress,
  updateUserProgress,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getTodayChallenge,
} from '../../database/queries';

interface UserState {
  userId: string;
  isPremium: boolean;
  progress: UserProgress[];
  bookmarks: Bookmark[];
  dailyChallenge: DailyChallenge | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userId: 'default_user',
  isPremium: false,
  progress: [],
  bookmarks: [],
  dailyChallenge: null,
  loading: false,
  error: null,
};

export const fetchUserProgress = createAsyncThunk(
  'user/fetchProgress',
  async (_, { getState }) => {
    const state = getState() as { user: UserState };
    const progress = await getUserProgress(state.user.userId);
    return progress;
  }
);

export const updateProgress = createAsyncThunk(
  'user/updateProgress',
  async (
    { tipId, status }: { tipId: string; status: 'viewed' | 'attempted' | 'mastered' },
    { getState }
  ) => {
    const state = getState() as { user: UserState };
    await updateUserProgress(tipId, status, state.user.userId);
    const progress = await getUserProgress(state.user.userId);
    return progress;
  }
);

export const fetchBookmarks = createAsyncThunk(
  'user/fetchBookmarks',
  async (_, { getState }) => {
    const state = getState() as { user: UserState };
    const bookmarks = await getBookmarks(state.user.userId);
    return bookmarks;
  }
);

export const toggleBookmark = createAsyncThunk(
  'user/toggleBookmark',
  async ({ tipId, isBookmarked }: { tipId: string; isBookmarked: boolean }, { getState }) => {
    const state = getState() as { user: UserState };

    if (isBookmarked) {
      await removeBookmark(tipId, state.user.userId);
    } else {
      await addBookmark(tipId, state.user.userId);
    }

    const bookmarks = await getBookmarks(state.user.userId);
    return bookmarks;
  }
);

export const fetchDailyChallenge = createAsyncThunk(
  'user/fetchDailyChallenge',
  async (_, { getState }) => {
    const state = getState() as { user: UserState };
    const challenge = await getTodayChallenge(state.user.userId);
    return challenge;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPremiumStatus: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProgress.fulfilled, (state, action: PayloadAction<UserProgress[]>) => {
        state.progress = action.payload;
      })
      .addCase(updateProgress.fulfilled, (state, action: PayloadAction<UserProgress[]>) => {
        state.progress = action.payload;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action: PayloadAction<Bookmark[]>) => {
        state.bookmarks = action.payload;
      })
      .addCase(toggleBookmark.fulfilled, (state, action: PayloadAction<Bookmark[]>) => {
        state.bookmarks = action.payload;
      })
      .addCase(
        fetchDailyChallenge.fulfilled,
        (state, action: PayloadAction<DailyChallenge | null>) => {
          state.dailyChallenge = action.payload;
        }
      );
  },
});

export const { setPremiumStatus } = userSlice.actions;
export default userSlice.reducer;
