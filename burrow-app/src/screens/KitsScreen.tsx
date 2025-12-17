import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, FAB, ProgressBar } from 'react-native-paper';
import { spacing } from '../constants/theme';

export default function KitsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Bug-Out Bags</List.Subheader>
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No kits created yet
            </Text>
            <Text variant="bodySmall" style={styles.emptyText}>
              Create your first kit to organize related items
            </Text>
          </View>
        </List.Section>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="Add Kit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
