import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Divider, FAB, Badge, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { fetchLocations } from '../store/slices/locationsSlice';
import { RootState, AppDispatch } from '../store';
import { locationService } from '../database/services/locationService';

export default function LocationsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const locations = useSelector((state: RootState) => state.locations.items);

  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchLocations());
    await loadItemCounts();
  };

  const loadItemCounts = async () => {
    const counts: Record<string, number> = {};
    for (const location of locations) {
      counts[location.id] = await locationService.getItemCount(location.id);
    }
    setItemCounts(counts);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return 'home';
      case 'Vehicle':
        return 'car';
      case 'Cache':
        return 'map-marker';
      case 'External':
        return 'domain';
      default:
        return 'map-marker';
    }
  };

  const renderLocation = ({ item }: any) => (
    <>
      <List.Item
        title={item.name}
        description={item.description || item.locationType}
        left={(props) => (
          <List.Icon {...props} icon={getLocationIcon(item.locationType)} />
        )}
        right={(props) => (
          <View style={styles.rightContent}>
            <Badge style={styles.badge}>{itemCounts[item.id] || 0}</Badge>
            <List.Icon {...props} icon="chevron-right" />
          </View>
        )}
        onPress={() => navigation.navigate('LocationDetail', { locationId: item.id })}
      />
      <Divider />
    </>
  );

  return (
    <View style={styles.container}>
      {locations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No locations yet</Text>
          <Text style={styles.emptySubtext}>Add your first storage location</Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocation}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* TODO: Add location dialog */}}
        label="Add Location"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
});
