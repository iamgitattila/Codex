import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Checkbox, Divider, FAB, Text, Card, Title, Paragraph } from 'react-native-paper';

import { shoppingListService } from '../database/services/shoppingListService';
import { ShoppingListItem } from '../types';

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const shoppingItems = await shoppingListService.getAll();
    setItems(shoppingItems);

    const cost = await shoppingListService.getTotalEstimatedCost();
    setTotalCost(cost);
  };

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await shoppingListService.update(id, { completed: !item.completed });
      await loadData();
    }
  };

  const handleClearCompleted = async () => {
    await shoppingListService.clearCompleted();
    await loadData();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Shopping Summary</Title>
          <Paragraph>Items: {items.length}</Paragraph>
          <Paragraph>Estimated Total: ${totalCost.toFixed(2)}</Paragraph>
        </Card.Content>
      </Card>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>No items in shopping list</Text>
          <Text style={styles.emptySubtext}>
            Items below par level will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <>
              <List.Item
                title={`Item ID: ${item.assetId}`}
                description={`Need: ${item.quantityToBuy} (${item.priority})`}
                left={() => (
                  <Checkbox
                    status={item.completed ? 'checked' : 'unchecked'}
                    onPress={() => handleToggle(item.id)}
                  />
                )}
                right={() => (
                  item.estimatedCost ? (
                    <Text style={styles.cost}>${item.estimatedCost.toFixed(2)}</Text>
                  ) : null
                )}
              />
              <Divider />
            </>
          )}
        />
      )}

      {items.some(i => i.completed) && (
        <FAB
          icon="delete"
          label="Clear Completed"
          style={styles.fab}
          onPress={handleClearCompleted}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  cost: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#F44336',
  },
});
