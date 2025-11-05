// Encoder Screen - Create and encode custom messages

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { textToMorse, calculateDuration } from '../utils/morseEncoder';
import { saveCustomMessage } from '../services/storage';

export default function EncoderScreen({ navigation }) {
  const [text, setText] = useState('');
  const [morse, setMorse] = useState('');
  const [wpm, setWpm] = useState(20);

  const handleTextChange = (inputText) => {
    // Only allow alphanumeric, spaces, and basic punctuation
    const sanitized = inputText.toUpperCase().replace(/[^A-Z0-9 .,?'/()&:;=+\-_"$@]/g, '');
    setText(sanitized);
    const encoded = textToMorse(sanitized);
    setMorse(encoded);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      await saveCustomMessage({
        text: text.trim(),
        morse: morse,
        wpm: wpm,
      });
      Alert.alert('Saved', `"${text}" saved to custom messages`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save message');
    }
  };

  const handlePreview = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    navigation.navigate('Transmission', {
      signal: {
        name: text.trim(),
        morse: morse,
        wpm: wpm,
        isPreview: true,
      }
    });
  };

  const duration = morse ? calculateDuration(morse, wpm) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ENCODE MESSAGE</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>MESSAGE</Text>
          <TextInput
            style={styles.input}
            placeholder="Type message (e.g., NEED WATER)"
            placeholderTextColor="#6C6C6E"
            value={text}
            onChangeText={handleTextChange}
            maxLength={50}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text style={styles.charCount}>{text.length}/50 characters</Text>
        </View>

        <View style={styles.morseSection}>
          <Text style={styles.label}>MORSE CODE</Text>
          <View style={styles.morseDisplay}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.morseText}>
                {morse || '...'}
              </Text>
            </ScrollView>
          </View>
        </View>

        <View style={styles.wpmSection}>
          <Text style={styles.label}>SPEED (WPM)</Text>
          <View style={styles.wpmButtons}>
            {[5, 10, 15, 20, 25, 30, 40].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.wpmButton,
                  wpm === speed && styles.wpmButtonActive
                ]}
                onPress={() => setWpm(speed)}
              >
                <Text style={[
                  styles.wpmButtonText,
                  wpm === speed && styles.wpmButtonTextActive
                ]}>
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.durationText}>
            Duration: {duration.toFixed(1)}s
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>MORSE CODE REFERENCE</Text>
          <Text style={styles.infoText}>
            • Dot (·) = Short signal{'\n'}
            • Dash (−) = Long signal (3× dot){'\n'}
            • Letter spacing = 3× dot{'\n'}
            • Word spacing = 7× dot
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.previewButton]}
          onPress={handlePreview}
          disabled={!text.trim()}
        >
          <Text style={styles.buttonText}>📡 PREVIEW</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={!text.trim()}
        >
          <Text style={styles.buttonText}>💾 SAVE</Text>
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
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AFAFAF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  charCount: {
    fontSize: 12,
    color: '#6C6C6E',
    marginTop: 4,
    textAlign: 'right',
  },
  morseSection: {
    marginBottom: 24,
  },
  morseDisplay: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    minHeight: 60,
    justifyContent: 'center',
  },
  morseText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#FF6B6B',
    fontWeight: '600',
  },
  wpmSection: {
    marginBottom: 24,
  },
  wpmButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  wpmButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  wpmButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  wpmButtonText: {
    fontSize: 16,
    color: '#AFAFAF',
    fontWeight: '600',
  },
  wpmButtonTextActive: {
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#AFAFAF',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  previewButton: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
