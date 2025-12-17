import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { spacing } from '../constants/theme';

export default function DashboardScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Burrow Inventory" subtitle="Last updated: Just now" />
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">0</Text>
                <Text variant="bodySmall">Total Assets</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">$0</Text>
                <Text variant="bodySmall">Total Value</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">0</Text>
                <Text variant="bodySmall">Expiring Soon</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">0</Text>
                <Text variant="bodySmall">Below Par</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <Button
              mode="contained"
              icon="plus"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Add New Item
            </Button>
            <Button
              mode="outlined"
              icon="barcode-scan"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Scan Barcode
            </Button>
            <Button
              mode="outlined"
              icon="magnify"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Search Inventory
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Expiring Soon" />
          <Card.Content>
            <Text variant="bodyMedium">No items expiring soon</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});
