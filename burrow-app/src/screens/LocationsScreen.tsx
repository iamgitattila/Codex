import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, FAB } from 'react-native-paper';
import { spacing } from '../constants/theme';

export default function LocationsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Home Locations</List.Subheader>
          <List.Item
            title="Pantry"
            description="0 items"
            left={(props) => <List.Icon {...props} icon="home" />}
            onPress={() => {}}
          />
          <List.Item
            title="Garage"
            description="0 items"
            left={(props) => <List.Icon {...props} icon="garage" />}
            onPress={() => {}}
          />
          <List.Item
            title="Basement"
            description="0 items"
            left={(props) => <List.Icon {...props} icon="stairs-down" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Mobile Locations</List.Subheader>
          <List.Item
            title="Vehicle"
            description="0 items"
            left={(props) => <List.Icon {...props} icon="car" />}
            onPress={() => {}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>External Locations</List.Subheader>
          <List.Item
            title="Cache"
            description="0 items"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            onPress={() => {}}
          />
        </List.Section>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="Add Location"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
