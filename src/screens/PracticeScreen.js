// Practice Mode Screen - Receive and decode Morse signals

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { morseToTiming } from '../utils/morseEncoder';
import { PRE_SAVED_SIGNALS } from '../constants/preSavedSignals';

export default function PracticeScreen({ navigation }) {
  const [currentSignal, setCurrentSignal] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const flashOn = async () => {
    if (cameraRef && hasPermission) {
      try {
        await Camera.setFlashModeAsync(Camera.Constants.FlashMode.torch);
      } catch (error) {
        console.log('Flash error:', error);
      }
    }
  };

  const flashOff = async () => {
    if (cameraRef && hasPermission) {
      try {
        await Camera.setFlashModeAsync(Camera.Constants.FlashMode.off);
      } catch (error) {
        console.log('Flash error:', error);
      }
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const generateRandomSignal = () => {
    const signals = PRE_SAVED_SIGNALS;
    return signals[Math.floor(Math.random() * signals.length)];
  };

  const handleStartPractice = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    const signal = generateRandomSignal();
    setCurrentSignal(signal);
    setUserGuess('');
    setIsBlinking(true);
    startPulseAnimation();

    // Blink the signal
    const timing = morseToTiming(signal.morse, 15); // Slower for practice

    try {
      for (const event of timing) {
        if (event.type === 'signal') {
          await flashOn();
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          await flashOff();
        }
        await sleep(event.duration);
      }
      await flashOff();
    } catch (error) {
      console.error('Practice transmission error:', error);
    }

    setIsBlinking(false);
    stopPulseAnimation();
  };

  const handleSubmit = () => {
    if (!currentSignal) return;

    setAttempts(attempts + 1);

    if (userGuess.toUpperCase().trim() === currentSignal.name.toUpperCase()) {
      setScore(score + 1);
      Alert.alert(
        'Correct! 🎉',
        `That was "${currentSignal.name}"\n\nScore: ${score + 1}/${attempts + 1}`,
        [
          { text: 'Next', onPress: handleStartPractice }
        ]
      );
    } else {
      Alert.alert(
        'Incorrect',
        `It was "${currentSignal.name}"\nMorse: ${currentSignal.morse}\n\nScore: ${score}/${attempts + 1}`,
        [
          { text: 'Try Another', onPress: handleStartPractice }
        ]
      );
    }
  };

  const handleShowAnswer = () => {
    if (currentSignal) {
      Alert.alert(
        'Answer',
        `Message: ${currentSignal.name}\nMorse: ${currentSignal.morse}\nMeaning: ${currentSignal.english}`
      );
    }
  };

  const handleReset = () => {
    setScore(0);
    setAttempts(0);
    setCurrentSignal(null);
    setUserGuess('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden camera component for flash access */}
      {hasPermission && (
        <Camera
          ref={ref => setCameraRef(ref)}
          style={styles.hiddenCamera}
          type={Camera.Constants.Type.back}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PRACTICE MODE</Text>
        <Text style={styles.subtitle}>Decode the signal!</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}/{attempts}</Text>
          {attempts > 0 && (
            <Text style={styles.accuracy}>
              {Math.round((score / attempts) * 100)}% accuracy
            </Text>
          )}
        </View>

        <Animated.View
          style={[
            styles.visualContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {isBlinking ? (
            <Text style={styles.statusEmoji}>📡</Text>
          ) : currentSignal && !isBlinking ? (
            <Text style={styles.statusEmoji}>❓</Text>
          ) : (
            <Text style={styles.statusEmoji}>🎯</Text>
          )}
        </Animated.View>

        <Text style={styles.statusText}>
          {isBlinking
            ? 'RECEIVING SIGNAL...'
            : currentSignal
            ? 'What did you see?'
            : 'Tap START to begin'}
        </Text>

        {currentSignal && !isBlinking && (
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="Your answer (e.g., SOS)"
              placeholderTextColor="#6C6C6E"
              value={userGuess}
              onChangeText={setUserGuess}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isBlinking}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>✓ SUBMIT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.hintButton]}
                onPress={handleShowAnswer}
              >
                <Text style={styles.buttonText}>💡 HINT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>HOW TO PLAY</Text>
          <Text style={styles.instructionsText}>
            1. Tap START to receive a random signal{'\n'}
            2. Watch the flash pattern carefully{'\n'}
            3. Type what you think the message is{'\n'}
            4. Submit your answer to check{'\n'}
            5. Try to improve your accuracy!
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            isBlinking && styles.startButtonDisabled
          ]}
          onPress={handleStartPractice}
          disabled={isBlinking}
        >
          <Text style={styles.startButtonText}>
            {isBlinking ? '⏳ RECEIVING' : '🚀 START DRILL'}
          </Text>
        </TouchableOpacity>

        {attempts > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>↻ Reset Score</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hiddenCamera: {
    width: 1,
    height: 1,
    position: 'absolute',
    top: -100,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B6B',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#AFAFAF',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  accuracy: {
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 4,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: 20,
  },
  statusEmoji: {
    fontSize: 80,
  },
  statusText: {
    fontSize: 16,
    color: '#AFAFAF',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputSection: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  hintButton: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructions: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#AFAFAF',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#6C6C6E',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
