import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, FAB, useTheme } from 'react-native-paper';
import { spacing } from '../constants/theme';

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search inventory..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.emptyState}>
        <Text variant="headlineSmall">No items in inventory</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Add your first item to get started
        </Text>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="Add Item"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  searchbar: {
    margin: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
