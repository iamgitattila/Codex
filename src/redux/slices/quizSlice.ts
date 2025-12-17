import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuizResult } from '../../types';

interface QuizState {
  results: QuizResult[];
  currentQuizProtocolId: string | null;
  currentQuestionIndex: number;
}

const initialState: QuizState = {
  results: [],
  currentQuizProtocolId: null,
  currentQuestionIndex: 0,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuiz: (state, action: PayloadAction<string>) => {
      state.currentQuizProtocolId = action.payload;
      state.currentQuestionIndex = 0;
    },
    submitAnswer: (state, action: PayloadAction<QuizResult>) => {
      state.results.push(action.payload);
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },
    resetQuiz: (state) => {
      state.currentQuizProtocolId = null;
      state.currentQuestionIndex = 0;
    },
    clearResults: (state, action: PayloadAction<string>) => {
      state.results = state.results.filter((r) => r.protocolId !== action.payload);
    },
  },
});

export const { startQuiz, submitAnswer, nextQuestion, resetQuiz, clearResults } = quizSlice.actions;
export default quizSlice.reducer;
