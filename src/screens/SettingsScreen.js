/**
 * SettingsScreen - App settings and preferences
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getSettings, saveSettings, clearAllData } from '../services/storage';
import { FUEL_SHELF_LIFE } from '../constants/fuelData';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    alert_threshold_days: 30,
    default_fuel_type: 'gasoline',
    default_stabilizer: true,
    volume_unit: 'gallons',
    notification_enabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const handleSave = async () => {
    const success = await saveSettings(settings);
    if (success) {
      Alert.alert('✓ Saved', 'Settings have been saved successfully');
    } else {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all fuel cans and usage history. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllData();
            if (success) {
              Alert.alert('✓ Cleared', 'All data has been cleared', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Home'),
                },
              ]);
            } else {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.content}>
        {/* Alert Settings */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Alerts</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notification_enabled}
              onValueChange={(value) =>
                setSettings({ ...settings, notification_enabled: value })
              }
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Alert Threshold</Text>
              <Text style={styles.settingHelp}>
                Alert when fuel is X days from expiration
              </Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.alert_threshold_days}
                onValueChange={(value) =>
                  setSettings({ ...settings, alert_threshold_days: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="7 days" value={7} />
                <Picker.Item label="14 days" value={14} />
                <Picker.Item label="30 days" value={30} />
                <Picker.Item label="60 days" value={60} />
                <Picker.Item label="90 days" value={90} />
              </Picker>
            </View>
          </View>
        </View>

        {/* Default Settings */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Defaults for New Cans</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Default Fuel Type</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={settings.default_fuel_type}
                onValueChange={(value) =>
                  setSettings({ ...settings, default_fuel_type: value })
                }
                style={styles.picker}
              >
                {Object.keys(FUEL_SHELF_LIFE).map((key) => (
                  <Picker.Item
                    key={key}
                    label={FUEL_SHELF_LIFE[key].name}
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Stabilizer Setting</Text>
            <Switch
              value={settings.default_stabilizer}
              onValueChange={(value) =>
                setSettings({ ...settings, default_stabilizer: value })
              }
            />
          </View>
        </View>

        {/* App Info */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>Fuel Tracker</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>By</Text>
            <Text style={styles.infoValue}>PrepperCodex</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[globalStyles.card, styles.dangerCard]}>
          <Text style={[globalStyles.cardTitle, { color: colors.error }]}>
            Danger Zone
          </Text>

          <TouchableOpacity
            style={[styles.dangerButton]}
            onPress={handleClearData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSuccess, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={globalStyles.buttonText}>✓ SAVE SETTINGS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  settingHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginLeft: spacing.md,
  },
  picker: {
    width: 150,
    height: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
  },
  dangerCard: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.surface,
  },
  saveButton: {
    marginBottom: spacing.xl,
  },
});

export default SettingsScreen;
