import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { createAsset } from '../redux/assetsSlice';

export default function AddEditAssetScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.locations.locations);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Asset name is required');
      return;
    }

    try {
      await dispatch(
        createAsset({
          name,
          category: 'Consumable',
          quantity_owned: parseInt(quantity) || 0,
          location_id: locations[0]?.id || 'loc_pantry',
          rotation_status: 'Active',
        })
      ).unwrap();

      navigation.goBack();
    } catch (err) {
      setError('Failed to save asset');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Asset Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
          >
            Save Asset
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancel
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
});
