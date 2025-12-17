import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, RadioButton, ProgressBar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { submitAnswer } from '../redux/slices/quizSlice';
import { updateStatus } from '../redux/slices/userProgressSlice';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'Quiz'>;

export default function QuizScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { protocolId } = route.params;

  const protocol = useAppSelector((state) =>
    state.protocols.protocols.find((p) => p.id === protocolId)
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!protocol) {
    return (
      <View style={styles.container}>
        <Text>Quiz not available</Text>
      </View>
    );
  }

  const questions = protocol.quizQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctOption;

    dispatch(
      submitAnswer({
        id: `${protocolId}_${currentQuestion.id}_${Date.now()}`,
        protocolId,
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        isCorrect,
        timestamp: new Date().toISOString(),
      })
    );

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      const score = ((correctAnswers + (selectedAnswer === currentQuestion.correctOption ? 1 : 0)) / questions.length) * 100;

      // Update user status based on score
      if (score >= 80) {
        dispatch(updateStatus({ protocolId, status: 'mastered' }));
      } else if (score >= 60) {
        dispatch(updateStatus({ protocolId, status: 'studied' }));
      }
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const finalScore = (correctAnswers / questions.length) * 100;
    const passed = finalScore >= 70;

    return (
      <View style={styles.container}>
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.resultTitle}>
              Quiz Completed! 🎉
            </Text>
            <Text variant="displayMedium" style={[styles.score, passed ? styles.passScore : styles.failScore]}>
              {finalScore.toFixed(0)}%
            </Text>
            <Text variant="titleLarge" style={styles.resultText}>
              {correctAnswers} out of {questions.length} correct
            </Text>

            <View style={styles.resultMessage}>
              {finalScore >= 90 ? (
                <Text variant="bodyLarge">Excellent! You've mastered this protocol. ⭐</Text>
              ) : finalScore >= 70 ? (
                <Text variant="bodyLarge">Good job! You have a solid understanding. ✓</Text>
              ) : (
                <Text variant="bodyLarge">
                  Review the protocol and try again to improve your knowledge.
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleRetake}
              style={styles.button}
              icon="refresh"
            >
              Retake Quiz
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Back to Protocol
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <ProgressBar progress={progress} style={styles.progressBar} />
      </View>

      <Card style={styles.questionCard}>
        <Card.Content>
          <View style={styles.difficultyBadge}>
            <Text variant="labelSmall" style={styles.difficultyText}>
              {currentQuestion.difficulty}
            </Text>
          </View>

          <Text variant="titleLarge" style={styles.question}>
            {currentQuestion.question}
          </Text>

          <RadioButton.Group
            onValueChange={(value) => !showResult && setSelectedAnswer(parseInt(value))}
            value={selectedAnswer?.toString() || ''}
          >
            {currentQuestion.options.map((option, index) => {
              let optionStyle = styles.option;
              if (showResult) {
                if (index === currentQuestion.correctOption) {
                  optionStyle = styles.correctOption;
                } else if (index === selectedAnswer) {
                  optionStyle = styles.incorrectOption;
                }
              }

              return (
                <Card key={index} style={[styles.optionCard, optionStyle]}>
                  <Card.Content style={styles.optionContent}>
                    <RadioButton value={index.toString()} disabled={showResult} />
                    <Text variant="bodyLarge" style={styles.optionText}>
                      {option}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })}
          </RadioButton.Group>

          {showResult && (
            <View style={styles.explanation}>
              <Text variant="titleMedium" style={styles.explanationTitle}>
                {selectedAnswer === currentQuestion.correctOption ? '✓ Correct!' : '✗ Incorrect'}
              </Text>
              <Text variant="bodyMedium" style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        {!showResult ? (
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={selectedAnswer === null}
            style={styles.button}
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.button}
            icon={currentQuestionIndex < questions.length - 1 ? 'arrow-right' : 'check'}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerText: {
    marginBottom: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  questionCard: {
    margin: 16,
    elevation: 3,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  question: {
    marginBottom: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  optionCard: {
    marginBottom: 12,
    elevation: 1,
  },
  option: {
    backgroundColor: '#fff',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 8,
  },
  explanation: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  explanationTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  explanationText: {
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
  resultCard: {
    margin: 16,
    padding: 16,
    elevation: 4,
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  score: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  passScore: {
    color: '#4CAF50',
  },
  failScore: {
    color: '#FF9800',
  },
  resultText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  resultMessage: {
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 24,
  },
});
