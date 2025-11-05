import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Divider, FAB, ProgressBar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { fetchKits } from '../store/slices/kitsSlice';
import { RootState, AppDispatch } from '../store';

export default function KitsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const kits = useSelector((state: RootState) => state.kits.items);

  useEffect(() => {
    dispatch(fetchKits());
  }, []);

  const getKitIcon = (type: string) => {
    switch (type) {
      case 'BOB':
        return 'bag-personal';
      case 'BOV':
        return 'car';
      case 'Cache':
        return 'treasure-chest';
      case 'FirstAid':
        return 'medical-bag';
      case 'Repair':
        return 'toolbox';
      case 'Communications':
        return 'radio';
      default:
        return 'package-variant';
    }
  };

  const renderKit = ({ item }: any) => (
    <>
      <List.Item
        title={item.name}
        description={item.description || item.kitType}
        left={(props) => (
          <List.Icon {...props} icon={getKitIcon(item.kitType)} />
        )}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => navigation.navigate('KitDetail', { kitId: item.id })}
      />
      <Divider />
    </>
  );

  return (
    <View style={styles.container}>
      {kits.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="package-variant-closed" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No kits yet</Text>
          <Text style={styles.emptySubtext}>Create your first kit (BOB, BOV, Cache, etc.)</Text>
        </View>
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item.id}
          renderItem={renderKit}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* TODO: Add kit dialog */}}
        label="Add Kit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
