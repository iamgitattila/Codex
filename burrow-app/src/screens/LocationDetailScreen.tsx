import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, List, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { locationService } from '../database/services/locationService';
import { assetService } from '../database/services/assetService';
import { Location, Asset } from '../types';

export default function LocationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState<Location | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    loadData();
  }, [route.params]);

  const loadData = async () => {
    if (route.params?.locationId) {
      const loc = await locationService.getById(route.params.locationId);
      setLocation(loc);

      if (loc) {
        const items = await assetService.getByLocation(loc.id);
        setAssets(items);
      }
    }
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Paragraph>Loading...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{location.name}</Title>
          {location.description && <Paragraph>{location.description}</Paragraph>}
          <Paragraph style={styles.meta}>
            Type: {location.locationType} | Items: {assets.length}
          </Paragraph>
        </Card.Content>
      </Card>

      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            <List.Item
              title={item.name}
              description={`Qty: ${item.quantityOwned} ${item.unitType}`}
              left={(props) => <List.Icon {...props} icon="package-variant" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ItemDetail', { assetId: item.id })}
            />
            <Divider />
          </>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Paragraph>No items in this location</Paragraph>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 12,
  },
  meta: {
    marginTop: 8,
    color: '#666',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
});
