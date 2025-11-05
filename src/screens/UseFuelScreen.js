/**
 * UseFuelScreen - Log fuel usage from a can
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';
import { updateCan, addUsageEntry } from '../services/storage';
import { calculateDaysRemaining, getCanStatus, formatFuelType } from '../utils/fuelCalculations';
import { EQUIPMENT_TYPES, USAGE_PURPOSES } from '../constants/fuelData';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';
import { STATUS_COLORS } from '../constants/fuelData';

const UseFuelScreen = ({ route, navigation }) => {
  const { can } = route.params;

  const [gallonsUsed, setGallonsUsed] = useState('');
  const [equipment, setEquipment] = useState(can.equipment_use || EQUIPMENT_TYPES[0]);
  const [purpose, setPurpose] = useState(USAGE_PURPOSES[0]);
  const [notes, setNotes] = useState('');

  const daysRemaining = calculateDaysRemaining(can.expiration_date);
  const status = getCanStatus(daysRemaining);
  const statusColor = STATUS_COLORS[status];

  const quickAmounts = [0.5, 1, 2, 5];

  const handleQuickAmount = (amount) => {
    setGallonsUsed(amount.toString());
  };

  const handleUseFuel = async () => {
    const used = parseFloat(gallonsUsed);

    // Validation
    if (!used || used <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (used > can.current_contents_gallons) {
      Alert.alert(
        'Error',
        `Can only has ${can.current_contents_gallons.toFixed(1)} gallons available`
      );
      return;
    }

    // Create usage entry
    const usageEntry = {
      usage_id: uuid.v4(),
      can_id: can.can_id,
      gallons_used: used,
      timestamp: new Date().toISOString(),
      equipment: equipment,
      purpose: purpose,
      notes: notes.trim(),
    };

    // Update can contents
    const newContents = can.current_contents_gallons - used;
    const updates = {
      current_contents_gallons: newContents,
      condition: newContents === 0 ? 'empty' : newContents < can.size_gallons * 0.25 ? 'low' : 'open',
    };

    const usageSuccess = await addUsageEntry(usageEntry);
    const updateSuccess = await updateCan(can.can_id, updates);

    if (usageSuccess && updateSuccess) {
      Alert.alert(
        '✓ Usage Logged',
        `${used} gal used from can\n${newContents.toFixed(1)} gal remaining`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to log usage. Please try again.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.content}>
        {/* Can Info Card */}
        <View style={[styles.canInfoCard, { borderColor: statusColor }]}>
          <Text style={styles.canInfoTitle}>
            {can.size_gallons} gal {formatFuelType(can.fuel_type)}
          </Text>
          <Text style={styles.canInfoLocation}>📍 {can.storage_location}</Text>
          <View style={styles.canInfoDivider} />
          <View style={styles.canInfoRow}>
            <Text style={styles.canInfoLabel}>Available:</Text>
            <Text style={styles.canInfoValue}>
              {can.current_contents_gallons.toFixed(1)} gal
            </Text>
          </View>
          <View style={styles.canInfoRow}>
            <Text style={styles.canInfoLabel}>Status:</Text>
            <Text style={[styles.canInfoValue, { color: statusColor }]}>
              {daysRemaining >= 0 ? `${daysRemaining} days` : 'EXPIRED'}
            </Text>
          </View>
        </View>

        {/* Amount to Use */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Gallons to Use:</Text>

          {/* Quick amount buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickButton,
                  gallonsUsed === amount.toString() && styles.quickButtonActive,
                ]}
                onPress={() => handleQuickAmount(amount)}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    gallonsUsed === amount.toString() && styles.quickButtonTextActive,
                  ]}
                >
                  {amount} gal
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={globalStyles.input}
            placeholder="Enter custom amount"
            keyboardType="decimal-pad"
            value={gallonsUsed}
            onChangeText={setGallonsUsed}
          />
          <Text style={globalStyles.inputHelp}>
            Remaining: {can.current_contents_gallons.toFixed(1)} gal
          </Text>
        </View>

        {/* Equipment */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Equipment:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={equipment}
              onValueChange={setEquipment}
              style={styles.picker}
            >
              {EQUIPMENT_TYPES.map((eq) => (
                <Picker.Item key={eq} label={eq} value={eq} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Purpose */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Purpose:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={purpose}
              onValueChange={setPurpose}
              style={styles.picker}
            >
              {USAGE_PURPOSES.map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Notes (Optional):</Text>
          <TextInput
            style={[globalStyles.input, styles.notesInput]}
            placeholder="Any observations..."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonDanger, styles.submitButton]}
          onPress={handleUseFuel}
        >
          <Text style={globalStyles.buttonText}>✓ LOG USAGE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  canInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  canInfoTitle: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  canInfoLocation: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  canInfoDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  canInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  canInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  canInfoValue: {
    ...typography.body,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  quickButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  quickButtonText: {
    ...typography.body,
    color: colors.text,
  },
  quickButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
});

export default UseFuelScreen;
