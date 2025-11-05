/**
 * Bug-Out Timer - Settings Screen
 * Manage SMS contacts, audio/haptic settings, and app preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS, LIMITS, MESSAGES } from '../constants';
import {
  getSmsContacts,
  addSmsContact,
  updateSmsContact,
  deleteSmsContact,
  getSettings,
  updateSetting,
  clearAllData,
  getDataSize
} from '../utils/storage';
import { validatePhoneNumber, createContact, formatPhoneNumber } from '../utils/sms';
import sharedStyles from '../styles/shared';

const SettingsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState({});
  const [dataSize, setDataSize] = useState(null);

  // Add contact form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedContacts = await getSmsContacts();
    const loadedSettings = await getSettings();
    const size = await getDataSize();

    setContacts(loadedContacts);
    setSettings(loadedSettings);
    setDataSize(size);
  };

  const handleAddContact = async () => {
    // Validation
    if (!newContactName.trim()) {
      Alert.alert('Error', 'Please enter a contact name.');
      return;
    }

    if (!validatePhoneNumber(newContactPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits).');
      return;
    }

    if (contacts.length >= LIMITS.maxSmsContacts) {
      Alert.alert('Limit Reached', MESSAGES.smsContactLimit);
      return;
    }

    // Create and add contact
    const contact = createContact(newContactName, newContactPhone);
    const result = await addSmsContact(contact);

    if (result.success) {
      setContacts(result.contacts);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddForm(false);
      Alert.alert('Success', 'Contact added successfully.');
    } else {
      Alert.alert('Error', result.error || 'Failed to add contact.');
    }
  };

  const handleToggleContact = async (contact) => {
    const result = await updateSmsContact(contact.contact_id, {
      enabled: !contact.enabled
    });

    if (result.success) {
      setContacts(result.contacts);
    }
  };

  const handleDeleteContact = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteSmsContact(contact.contact_id);
            if (result.success) {
              setContacts(result.contacts);
            }
          }
        }
      ]
    );
  };

  const handleToggleSetting = async (key) => {
    const newValue = !settings[key];
    const result = await updateSetting(key, newValue);

    if (result.success) {
      setSettings(result.settings);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      MESSAGES.confirmReset,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const result = await clearAllData();
            if (result.success) {
              Alert.alert('Success', 'All data has been reset.', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]);
            } else {
              Alert.alert('Error', 'Failed to reset data.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* SMS Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>📱 SMS Emergency Contacts</Text>
          <Text style={styles.sectionSubtext}>
            Add up to {LIMITS.maxSmsContacts} emergency contacts for evacuation alerts
          </Text>

          {contacts.map((contact) => (
            <View key={contact.contact_id} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <View style={styles.contactControls}>
                <Switch
                  value={contact.enabled}
                  onValueChange={() => handleToggleContact(contact)}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={COLORS.textPrimary}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContact(contact)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {showAddForm ? (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Contact Name"
                placeholderTextColor={COLORS.disabled}
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={COLORS.disabled}
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.addFormButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewContactName('');
                    setNewContactPhone('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
              disabled={contacts.length >= LIMITS.maxSmsContacts}
            >
              <Text style={styles.addButtonText}>
                + Add Contact {contacts.length >= LIMITS.maxSmsContacts && '(Limit Reached)'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audio & Haptics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🔊 Audio & Haptics</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Audio Enabled</Text>
            <Switch
              value={settings.audioEnabled}
              onValueChange={() => handleToggleSetting('audioEnabled')}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={() => handleToggleSetting('hapticEnabled')}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Keep Screen On</Text>
            <Switch
              value={settings.keepScreenOn}
              onValueChange={() => handleToggleSetting('keepScreenOn')}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.textPrimary}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ℹ️ App Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{settings.appVersion || '1.0.0'}</Text>
          </View>

          {dataSize && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data Storage</Text>
              <Text style={styles.infoValue}>
                {dataSize.kilobytes} KB ({dataSize.drillCount} drills)
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetData}
          >
            <Text style={styles.buttonText}>Reset All Data</Text>
          </TouchableOpacity>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutText}>
              Bug-Out Timer is designed for preppers to practice emergency
              evacuation scenarios. Run weekly drills to improve your response
              time and preparedness.
            </Text>
            <Text style={styles.aboutText}>
              All data is stored locally on your device. No internet connection
              required.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg
  },

  headerContainer: {
    marginBottom: SPACING.xl
  },

  backButton: {
    marginBottom: SPACING.md
  },

  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.header,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  section: {
    marginBottom: SPACING.xxl
  },

  sectionHeader: {
    fontSize: TYPOGRAPHY.fontSize.sectionHeader,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },

  sectionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },

  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.md
  },

  contactInfo: {
    flex: 1
  },

  contactName: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },

  contactPhone: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  contactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },

  deleteButton: {
    padding: SPACING.sm
  },

  deleteButtonText: {
    fontSize: 20
  },

  addForm: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.md
  },

  input: {
    height: DIMENSIONS.inputHeight,
    backgroundColor: COLORS.background,
    borderRadius: DIMENSIONS.borderRadius.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md
  },

  addFormButtons: {
    flexDirection: 'row',
    gap: SPACING.md
  },

  addButton: {
    height: DIMENSIONS.buttonHeight.small,
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },

  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.md
  },

  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: DIMENSIONS.borderRadius.medium,
    marginBottom: SPACING.md
  },

  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary
  },

  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },

  button: {
    height: DIMENSIONS.buttonHeight.small,
    borderRadius: DIMENSIONS.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },

  buttonPrimary: {
    backgroundColor: COLORS.buttonPrimary
  },

  buttonSecondary: {
    backgroundColor: COLORS.buttonSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight
  },

  buttonDanger: {
    backgroundColor: COLORS.error
  },

  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  aboutSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: DIMENSIONS.borderRadius.medium
  },

  aboutText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.small * TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.md
  }
});

export default SettingsScreen;
