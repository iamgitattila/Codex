// Transmission Screen - Main transmission interface with LED/vibration control

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { morseToTiming, calculateDuration } from '../utils/morseEncoder';
import { saveTransmission, getSettings } from '../services/storage';

export default function TransmissionScreen({ route, navigation }) {
  const { signal } = route.params;
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [progress, setProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [settings, setSettings] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestPermissions();
    loadSettings();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadSettings = async () => {
    const userSettings = await getSettings();
    setSettings(userSettings);
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
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleTransmit = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access to use the flashlight.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsTransmitting(true);
    setProgress(0);
    startPulseAnimation();

    const timing = morseToTiming(signal.morse, signal.wpm || 20);
    const totalDuration = timing.reduce((sum, t) => sum + t.duration, 0);
    let elapsedTime = 0;

    const transmissionMode = settings?.transmission_mode || 'LED_FLASH';
    const vibrationEnabled = settings?.vibration_enabled &&
                            (transmissionMode === 'VIBRATION' || transmissionMode === 'BOTH');
    const flashEnabled = transmissionMode === 'LED_FLASH' || transmissionMode === 'BOTH';

    try {
      for (let i = 0; i < timing.length; i++) {
        const event = timing[i];

        if (event.type === 'signal') {
          // Turn on LED flash
          if (flashEnabled) {
            await flashOn();
          }

          // Trigger haptic feedback
          if (vibrationEnabled) {
            const isDash = event.duration > 100;
            await Haptics.impactAsync(
              isDash
                ? Haptics.ImpactFeedbackStyle.Heavy
                : Haptics.ImpactFeedbackStyle.Medium
            );
          }

          // Show visual indicator
          setCurrentElement(event.symbol || '·');
        } else {
          // Turn off LED flash
          if (flashEnabled) {
            await flashOff();
          }

          setCurrentElement(null);
        }

        // Update progress
        elapsedTime += event.duration;
        setProgress(elapsedTime / totalDuration);

        // Wait for timing duration
        await sleep(event.duration);
      }

      // Ensure flash is off
      if (flashEnabled) {
        await flashOff();
      }

      // Save to history (unless it's a preview)
      if (!signal.isPreview) {
        await saveTransmission({
          message: signal.name,
          morse: signal.morse,
          wpm: signal.wpm || 20,
          duration: calculateDuration(signal.morse, signal.wpm || 20),
          mode: transmissionMode,
        });
      }

      Alert.alert(
        'Transmitted',
        `Message sent at ${signal.wpm || 20} WPM`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Transmission error:', error);
      Alert.alert('Error', 'Failed to transmit message');
    } finally {
      setIsTransmitting(false);
      setCurrentElement(null);
      setProgress(0);
      stopPulseAnimation();
      if (flashEnabled) {
        await flashOff();
      }
    }
  };

  const duration = calculateDuration(signal.morse, signal.wpm || 20);
  const letterCount = signal.morse.split(' ').length;

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
        <Text style={styles.title}>TRANSMIT</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.messageDisplay}>
          <Text style={styles.messageName}>{signal.name}</Text>
          <Text style={styles.morseCode}>{signal.morse}</Text>
        </View>

        <View style={styles.transmissionVisual}>
          <Animated.View
            style={[
              styles.elementContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.currentElement}>
              {currentElement || '◯'}
            </Text>
          </Animated.View>
        </View>

        {isTransmitting && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>SPEED</Text>
            <Text style={styles.infoValue}>{signal.wpm || 20} WPM</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>LETTERS</Text>
            <Text style={styles.infoValue}>{letterCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DURATION</Text>
            <Text style={styles.infoValue}>{duration.toFixed(1)}s</Text>
          </View>
        </View>

        <View style={styles.modeContainer}>
          <Text style={styles.modeLabel}>MODE</Text>
          <Text style={styles.modeValue}>
            {settings?.transmission_mode === 'LED_FLASH' && '💡 LED Flash'}
            {settings?.transmission_mode === 'VIBRATION' && '📳 Vibration'}
            {settings?.transmission_mode === 'BOTH' && '💡 + 📳 Both'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.transmitButton,
            isTransmitting && styles.transmitButtonDisabled
          ]}
          onPress={handleTransmit}
          disabled={isTransmitting}
        >
          <Text style={styles.transmitButtonText}>
            {isTransmitting ? '📡 TRANSMITTING...' : '📡 TRANSMIT'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          disabled={isTransmitting}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  messageDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  messageName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  morseCode: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  transmissionVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 20,
  },
  elementContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentElement: {
    fontSize: 72,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#AFAFAF',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modeContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  modeLabel: {
    fontSize: 12,
    color: '#AFAFAF',
    marginBottom: 4,
  },
  modeValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  transmitButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  transmitButtonDisabled: {
    backgroundColor: '#6C6C6E',
  },
  transmitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  settingsButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
