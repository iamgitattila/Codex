// Settings Screen - Configure app preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { getSettings, updateSettings, resetSettings, clearAllData } from '../services/storage';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const handleUpdateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaults = await resetSettings();
            setSettings(defaults);
            Alert.alert('Success', 'Settings reset to defaults');
          }
        }
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all custom messages, history, and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadSettings();
            Alert.alert('Success', 'All data has been cleared');
          }
        }
      ]
    );
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Transmission Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSMISSION MODE</Text>

          <TouchableOpacity
            style={[
              styles.option,
              settings.transmission_mode === 'LED_FLASH' && styles.optionActive
            ]}
            onPress={() => handleUpdateSetting('transmission_mode', 'LED_FLASH')}
          >
            <Text style={styles.optionEmoji}>💡</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>LED Flash</Text>
              <Text style={styles.optionSubtitle}>Use phone flashlight</Text>
            </View>
            {settings.transmission_mode === 'LED_FLASH' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              settings.transmission_mode === 'VIBRATION' && styles.optionActive
            ]}
            onPress={() => handleUpdateSetting('transmission_mode', 'VIBRATION')}
          >
            <Text style={styles.optionEmoji}>📳</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Vibration</Text>
              <Text style={styles.optionSubtitle}>Silent mode</Text>
            </View>
            {settings.transmission_mode === 'VIBRATION' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              settings.transmission_mode === 'BOTH' && styles.optionActive
            ]}
            onPress={() => handleUpdateSetting('transmission_mode', 'BOTH')}
          >
            <Text style={styles.optionEmoji}>🔦</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Both</Text>
              <Text style={styles.optionSubtitle}>Flash + Vibration</Text>
            </View>
            {settings.transmission_mode === 'BOTH' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Speed Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEFAULT SPEED (WPM)</Text>
          <View style={styles.wpmContainer}>
            {[5, 10, 15, 20, 25, 30, 40].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.wpmButton,
                  settings.default_wpm === speed && styles.wpmButtonActive
                ]}
                onPress={() => handleUpdateSetting('default_wpm', speed)}
              >
                <Text style={[
                  styles.wpmButtonText,
                  settings.default_wpm === speed && styles.wpmButtonTextActive
                ]}>
                  {speed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            Lower speed = easier to decode{'\n'}
            Higher speed = faster transmission
          </Text>
        </View>

        {/* Audio Settings (Future) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO (COMING SOON)</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchTitle}>Audio Morse</Text>
              <Text style={styles.switchSubtitle}>Beep tones</Text>
            </View>
            <Switch
              value={settings.audio_enabled}
              onValueChange={(value) => handleUpdateSetting('audio_enabled', value)}
              trackColor={{ false: '#2C2C2E', true: '#FF6B6B' }}
              thumbColor="#FFFFFF"
              disabled={true}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>MORSE BLINKER</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (MVP)</Text>
            <Text style={styles.aboutText}>
              By PrepperCodex{'\n'}
              Signal without sound. Communicate across miles.
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleResetSettings}
          >
            <Text style={styles.dangerButtonText}>Reset Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearAllData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
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
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AFAFAF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  optionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#2C2C2E',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#AFAFAF',
  },
  checkmark: {
    fontSize: 24,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  wpmContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  helperText: {
    fontSize: 12,
    color: '#6C6C6E',
    marginTop: 8,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    opacity: 0.5,
  },
  switchLabel: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#AFAFAF',
  },
  aboutBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 2,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6C6C6E',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#AFAFAF',
    textAlign: 'center',
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
});
