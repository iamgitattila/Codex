import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { spacing } from '../constants/theme';

export default function MoreScreen() {
  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Alerts & Management</List.Subheader>
        <List.Item
          title="Expiration Alerts"
          description="View items expiring soon"
          left={(props) => <List.Icon {...props} icon="alert-circle" />}
          onPress={() => {}}
        />
        <List.Item
          title="Par Level Management"
          description="Set minimum quantities"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
          onPress={() => {}}
        />
        <List.Item
          title="Shopping List"
          description="Items to purchase"
          left={(props) => <List.Icon {...props} icon="cart" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data & Backup</List.Subheader>
        <List.Item
          title="Export Data"
          description="Create PDF or CSV backup"
          left={(props) => <List.Icon {...props} icon="download" />}
          onPress={() => {}}
        />
        <List.Item
          title="Import Data"
          description="Restore from backup"
          left={(props) => <List.Icon {...props} icon="upload" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Settings</List.Subheader>
        <List.Item
          title="Notifications"
          description="Configure alerts"
          left={(props) => <List.Icon {...props} icon="bell" />}
          onPress={() => {}}
        />
        <List.Item
          title="Security"
          description="Password & encryption"
          left={(props) => <List.Icon {...props} icon="shield" />}
          onPress={() => {}}
        />
        <List.Item
          title="About"
          description="Version 1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
});
