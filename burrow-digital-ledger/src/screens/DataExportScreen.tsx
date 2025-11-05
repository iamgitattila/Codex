import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, List } from 'react-native-paper';

export default function DataExportScreen() {
  const handlePDFExport = async () => {
    // TODO: Implement PDF export
    alert('PDF export feature coming soon!');
  };

  const handleCSVExport = async () => {
    // TODO: Implement CSV export
    alert('CSV export feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Emergency Data Dump</Text>
          <Text variant="bodySmall" style={styles.description}>
            Export your inventory for offline backup
          </Text>

          <Button
            mode="contained"
            icon="file-pdf-box"
            onPress={handlePDFExport}
            style={styles.button}
          >
            Export to PDF
          </Button>

          <Button
            mode="outlined"
            icon="file-delimited"
            onPress={handleCSVExport}
            style={styles.button}
          >
            Export to CSV
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Recent Exports</Text>
          <List.Item
            title="inventory_2025_11_05.pdf"
            description="Nov 5, 2025 - 850 KB"
            left={(props) => <List.Icon {...props} icon="file-pdf-box" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Backup & Restore</Text>
          <Button mode="outlined" icon="backup-restore" style={styles.button}>
            Create Backup
          </Button>
          <Button mode="outlined" icon="restore" style={styles.button}>
            Restore from Backup
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
  description: { marginVertical: 12, color: '#757575' },
  button: { marginTop: 8 },
});
