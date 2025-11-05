import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { List, Divider, Switch, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>General</List.Subheader>
        <List.Item
          title="App Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <Divider />
        <List.Item
          title="Database Size"
          description="2.5 MB"
          left={(props) => <List.Icon {...props} icon="database" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Expiration Alerts"
          description="Alert when items are expiring soon"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        <List.Item
          title="Alert Days"
          description="30 days"
          left={(props) => <List.Icon {...props} icon="calendar" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Data & Security</List.Subheader>
        <List.Item
          title="Export Data"
          description="Export inventory to PDF or CSV"
          left={(props) => <List.Icon {...props} icon="file-export" />}
          onPress={() => {}}
        />
        <List.Item
          title="Backup Database"
          description="Create local backup"
          left={(props) => <List.Icon {...props} icon="backup-restore" />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});
