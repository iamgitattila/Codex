import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Checkbox } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchKitById, toggleItemPacked } from '../redux/kitsSlice';

export default function KitDetailsScreen() {
  const route = useRoute<any>();
  const { kitId } = route.params;
  const dispatch = useAppDispatch();
  const kit = useAppSelector((state) => state.kits.selectedKit);

  useEffect(() => {
    dispatch(fetchKitById(kitId));
  }, [kitId]);

  if (!kit) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">{kit.name}</Text>
          <Text variant="bodyMedium">
            Packed: {kit.packed_items}/{kit.total_items} items
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={kit.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge">{item.asset?.name || 'Unknown'}</Text>
                  <Text variant="bodySmall">Qty Required: {item.quantity_required}</Text>
                </View>
                <Checkbox
                  status={item.is_packed ? 'checked' : 'unchecked'}
                  onPress={() =>
                    dispatch(toggleItemPacked({ kitItemId: item.id, kitId }))
                  }
                />
              </View>
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
  itemRow: { flexDirection: 'row', alignItems: 'center' },
});
