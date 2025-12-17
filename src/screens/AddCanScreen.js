/**
 * AddCanScreen - Form to add a new fuel can
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
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';
import { addCan } from '../services/storage';
import { calculateExpirationDate } from '../utils/fuelCalculations';
import {
  FUEL_SHELF_LIFE,
  STORAGE_LOCATIONS,
  EQUIPMENT_TYPES,
  CAN_SIZES,
} from '../constants/fuelData';
import { FuelTypes, CanConditions } from '../types';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';

const AddCanScreen = ({ navigation }) => {
  const [size, setSize] = useState(5);
  const [customSize, setCustomSize] = useState('');
  const [fuelType, setFuelType] = useState(FuelTypes.GASOLINE);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [stabilizerUsed, setStabilizerUsed] = useState(true);
  const [location, setLocation] = useState(STORAGE_LOCATIONS[0]);
  const [equipment, setEquipment] = useState(EQUIPMENT_TYPES[0]);
  const [notes, setNotes] = useState('');

  const expirationDate = calculateExpirationDate(purchaseDate, fuelType, stabilizerUsed);
  const daysUntilExpiration = Math.ceil(
    (expirationDate - purchaseDate) / (1000 * 60 * 60 * 24)
  );

  const handleAddCan = async () => {
    // Validation
    const finalSize = customSize ? parseFloat(customSize) : size;
    if (!finalSize || finalSize <= 0) {
      Alert.alert('Error', 'Please enter a valid can size');
      return;
    }

    const newCan = {
      can_id: uuid.v4(),
      size_gallons: finalSize,
      fuel_type: fuelType,
      purchase_date: purchaseDate.toISOString(),
      stabilizer_used: stabilizerUsed,
      expiration_date: expirationDate.toISOString(),
      current_contents_gallons: finalSize,
      storage_location: location,
      condition: CanConditions.SEALED,
      equipment_use: equipment,
      created_at: new Date().toISOString(),
      notes: notes.trim(),
    };

    const success = await addCan(newCan);

    if (success) {
      Alert.alert(
        '✓ Can Added',
        `${finalSize} gal ${FUEL_SHELF_LIFE[fuelType].name} added\nExpires: ${expirationDate.toLocaleDateString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to add can. Please try again.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.content}>
        {/* Size Selection */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Size (Gallons):</Text>
          <View style={styles.sizeButtons}>
            {CAN_SIZES.map((canSize) => (
              <TouchableOpacity
                key={canSize.value}
                style={[
                  styles.sizeButton,
                  size === canSize.value && !customSize && styles.sizeButtonActive,
                ]}
                onPress={() => {
                  setSize(canSize.value);
                  setCustomSize('');
                }}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    size === canSize.value && !customSize && styles.sizeButtonTextActive,
                  ]}
                >
                  {canSize.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={globalStyles.input}
            placeholder="Custom size"
            keyboardType="decimal-pad"
            value={customSize}
            onChangeText={(text) => {
              setCustomSize(text);
              setSize(0);
            }}
          />
        </View>

        {/* Fuel Type */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Fuel Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fuelType}
              onValueChange={setFuelType}
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

        {/* Stabilizer Toggle */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Stabilizer Added?</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                stabilizerUsed && styles.toggleButtonActive,
              ]}
              onPress={() => setStabilizerUsed(true)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  stabilizerUsed && styles.toggleButtonTextActive,
                ]}
              >
                ✓ Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !stabilizerUsed && styles.toggleButtonActive,
              ]}
              onPress={() => setStabilizerUsed(false)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !stabilizerUsed && styles.toggleButtonTextActive,
                ]}
              >
                ✗ No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Location */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Storage Location:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={location}
              onValueChange={setLocation}
              style={styles.picker}
            >
              {STORAGE_LOCATIONS.map((loc) => (
                <Picker.Item key={loc} label={loc} value={loc} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Equipment Use:</Text>
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

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={globalStyles.inputLabel}>Notes (Optional):</Text>
          <TextInput
            style={[globalStyles.input, styles.notesInput]}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Expiration Display */}
        <View style={styles.expirationCard}>
          <Text style={styles.expirationLabel}>EXPIRATION DATE</Text>
          <Text style={styles.expirationDate}>
            {expirationDate.toLocaleDateString()}
          </Text>
          <Text style={styles.expirationInfo}>
            {daysUntilExpiration} days ({Math.floor(daysUntilExpiration / 30)} months)
          </Text>
          <Text style={styles.expirationNote}>
            {stabilizerUsed ? '✓ With stabilizer' : '⚠️ Without stabilizer'}
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSuccess, styles.addButton]}
          onPress={handleAddCan}
        >
          <Text style={globalStyles.buttonText}>✓ ADD CAN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: spacing.lg,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  sizeButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  sizeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeButtonText: {
    ...typography.body,
    color: colors.text,
  },
  sizeButtonTextActive: {
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
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  toggleButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: colors.surface,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  expirationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  expirationLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  expirationDate: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  expirationInfo: {
    ...typography.body,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  expirationNote: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  addButton: {
    marginBottom: spacing.xl,
  },
});

export default AddCanScreen;
