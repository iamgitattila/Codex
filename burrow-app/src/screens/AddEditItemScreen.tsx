import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Chip, SegmentedButtons, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';

import { createAsset, updateAsset, fetchAssetById } from '../store/slices/assetsSlice';
import { fetchLocations } from '../store/slices/locationsSlice';
import { RootState, AppDispatch } from '../store';
import { Asset, AssetCategory, Condition, RotationStatus } from '../types';

export default function AddEditItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const locations = useSelector((state: RootState) => state.locations.items);
  const selectedAsset = useSelector((state: RootState) => state.assets.selectedAsset);

  const isEditMode = route.params?.assetId !== undefined;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Consumable' as AssetCategory,
    subcategory: '',
    description: '',
    quantityOwned: '1',
    quantityPar: '',
    unitType: 'pieces',
    locationId: '',
    expirationDate: '',
    dateAcquired: '',
    costUsd: '',
    sourceUrl: '',
    barcodeEan: '',
    notes: '',
    condition: 'Unknown' as Condition,
    rotationStatus: 'Active' as RotationStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchLocations());
    if (isEditMode) {
      dispatch(fetchAssetById(route.params.assetId));
    }
  }, []);

  useEffect(() => {
    if (isEditMode && selectedAsset) {
      setFormData({
        name: selectedAsset.name,
        category: selectedAsset.category,
        subcategory: selectedAsset.subcategory || '',
        description: selectedAsset.description || '',
        quantityOwned: selectedAsset.quantityOwned.toString(),
        quantityPar: selectedAsset.quantityPar?.toString() || '',
        unitType: selectedAsset.unitType,
        locationId: selectedAsset.locationId,
        expirationDate: selectedAsset.expirationDate || '',
        dateAcquired: selectedAsset.dateAcquired || '',
        costUsd: selectedAsset.costUsd?.toString() || '',
        sourceUrl: selectedAsset.sourceUrl || '',
        barcodeEan: selectedAsset.barcodeEan || '',
        notes: selectedAsset.notes || '',
        condition: selectedAsset.condition,
        rotationStatus: selectedAsset.rotationStatus,
      });
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (locations.length > 0 && !formData.locationId) {
      setFormData(prev => ({ ...prev, locationId: locations[0].id }));
    }
  }, [locations]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }
    if (!formData.quantityOwned || parseInt(formData.quantityOwned) < 0) {
      newErrors.quantityOwned = 'Valid quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const assetData = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        description: formData.description || undefined,
        quantityOwned: parseInt(formData.quantityOwned),
        quantityPar: formData.quantityPar ? parseInt(formData.quantityPar) : undefined,
        unitType: formData.unitType,
        locationId: formData.locationId,
        expirationDate: formData.expirationDate || undefined,
        dateAcquired: formData.dateAcquired || undefined,
        costUsd: formData.costUsd ? parseFloat(formData.costUsd) : undefined,
        sourceUrl: formData.sourceUrl || undefined,
        barcodeEan: formData.barcodeEan || undefined,
        notes: formData.notes || undefined,
        condition: formData.condition,
        rotationStatus: formData.rotationStatus,
      };

      if (isEditMode) {
        await dispatch(updateAsset({ id: route.params.assetId, updates: assetData }));
        Alert.alert('Success', 'Item updated successfully');
      } else {
        await dispatch(createAsset(assetData as any));
        Alert.alert('Success', 'Item added successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Button
          mode="outlined"
          icon="barcode-scan"
          onPress={handleScanBarcode}
          style={styles.scanButton}
        >
          Scan Barcode
        </Button>

        <TextInput
          label="Item Name *"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <SegmentedButtons
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as AssetCategory }))}
          buttons={[
            { value: 'Consumable', label: 'Consumable' },
            { value: 'Gear', label: 'Gear' },
            { value: 'Kit', label: 'Kit' },
            { value: 'Document', label: 'Document' },
          ]}
          style={styles.input}
        />

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            label="Quantity Owned *"
            value={formData.quantityOwned}
            onChangeText={(text) => setFormData(prev => ({ ...prev, quantityOwned: text }))}
            keyboardType="numeric"
            error={!!errors.quantityOwned}
            style={[styles.input, styles.halfWidth]}
          />
          <TextInput
            label="Par Level"
            value={formData.quantityPar}
            onChangeText={(text) => setFormData(prev => ({ ...prev, quantityPar: text }))}
            keyboardType="numeric"
            style={[styles.input, styles.halfWidth]}
          />
        </View>

        <TextInput
          label="Unit Type *"
          value={formData.unitType}
          onChangeText={(text) => setFormData(prev => ({ ...prev, unitType: text }))}
          placeholder="e.g., cans, pieces, gallons"
          style={styles.input}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.locationId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
          >
            <Picker.Item label="Select Location *" value="" />
            {locations.map((loc) => (
              <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
            ))}
          </Picker>
        </View>

        <TextInput
          label="Expiration Date (YYYY-MM-DD)"
          value={formData.expirationDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, expirationDate: text }))}
          placeholder="2025-12-31"
          style={styles.input}
        />

        <TextInput
          label="Date Acquired (YYYY-MM-DD)"
          value={formData.dateAcquired}
          onChangeText={(text) => setFormData(prev => ({ ...prev, dateAcquired: text }))}
          placeholder="2024-01-15"
          style={styles.input}
        />

        <TextInput
          label="Cost (USD)"
          value={formData.costUsd}
          onChangeText={(text) => setFormData(prev => ({ ...prev, costUsd: text }))}
          keyboardType="numeric"
          placeholder="29.99"
          style={styles.input}
        />

        <TextInput
          label="Source/Where to Buy"
          value={formData.sourceUrl}
          onChangeText={(text) => setFormData(prev => ({ ...prev, sourceUrl: text }))}
          placeholder="Amazon, Walmart, etc."
          style={styles.input}
        />

        <TextInput
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            {isEditMode ? 'Update' : 'Save'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
  },
  scanButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
