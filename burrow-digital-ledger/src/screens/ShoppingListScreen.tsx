import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Checkbox, Button } from 'react-native-paper';
import { getAssetsBelowPar } from '../database/assetService';
import { AssetWithLocation } from '../types';

export default function ShoppingListScreen() {
  const [items, setItems] = useState<AssetWithLocation[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const belowPar = await getAssetsBelowPar();
    setItems(belowPar);
  };

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Shopping List</Text>
          <Text variant="bodySmall">{items.length} items needed</Text>
        </Card.Content>
      </Card>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const needed = (item.quantity_par || 0) - item.quantity_owned;
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.itemRow}>
                  <Checkbox
                    status={checkedItems.has(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleCheck(item.id)}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyLarge">{item.name}</Text>
                    <Text variant="bodySmall">Need: {needed} more</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <Button mode="contained" onPress={() => {}}>
          Export Shopping List
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  footer: { padding: 12 },
});
