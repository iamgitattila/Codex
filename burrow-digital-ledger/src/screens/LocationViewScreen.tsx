import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { getAssetsByLocation } from '../database/assetService';
import { AssetWithLocation } from '../types';

export default function LocationViewScreen() {
  const route = useRoute<any>();
  const { locationId, locationName } = route.params;
  const [assets, setAssets] = useState<AssetWithLocation[]>([]);

  useEffect(() => {
    loadAssets();
  }, [locationId]);

  const loadAssets = async () => {
    const data = await getAssetsByLocation(locationId);
    setAssets(data);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">Quantity: {item.quantity_owned}</Text>
              <Text variant="bodySmall">Category: {item.category}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
});
