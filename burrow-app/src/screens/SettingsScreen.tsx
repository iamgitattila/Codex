import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { List, Switch, Divider, Button, Card, Title, Paragraph } from 'react-native-paper';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [belowParAlerts, setBelowParAlerts] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Information</Title>
          <Paragraph>Version: 1.0.0</Paragraph>
          <Paragraph>Burrow: The Digital Ledger</Paragraph>
          <Paragraph>by PrepperCodex</Paragraph>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Enable Notifications"
          description="Receive alerts for expiring items"
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Below Par Alerts"
          description="Alert when items drop below par level"
          right={() => (
            <Switch
              value={belowParAlerts}
              onValueChange={setBelowParAlerts}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Daily Reminder"
          description="Daily inventory check reminder"
          right={() => (
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Export to PDF"
          description="Create printable inventory backup"
          left={(props) => <List.Icon {...props} icon="file-pdf-box" />}
          onPress={() => {/* TODO: Export PDF */}}
        />
        <Divider />
        <List.Item
          title="Export to CSV"
          description="Export data for Excel/Sheets"
          left={(props) => <List.Icon {...props} icon="file-delimited" />}
          onPress={() => {/* TODO: Export CSV */}}
        />
        <Divider />
        <List.Item
          title="Storage Used"
          description="45 MB"
          left={(props) => <List.Icon {...props} icon="database" />}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-lock" />}
          onPress={() => {/* TODO: Privacy policy */}}
        />
        <Divider />
        <List.Item
          title="Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {/* TODO: Support */}}
        />
        <Divider />
        <List.Item
          title="About Burrow"
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => {/* TODO: About */}}
        />
      </List.Section>

      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          Burrow: The Digital Ledger
        </Paragraph>
        <Paragraph style={styles.footerText}>
          Offline-first inventory management for preppers
        </Paragraph>
        <Paragraph style={styles.footerText}>
          PrepperCodex | Pillar 4
        </Paragraph>
      </View>
    </ScrollView>
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
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
