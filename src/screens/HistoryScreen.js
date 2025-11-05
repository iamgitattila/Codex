// History Screen - View past transmissions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { getTransmissionHistory, clearTransmissionHistory } from '../services/storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getTransmissionHistory();
    setHistory(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all transmission history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearTransmissionHistory();
            await loadHistory();
          }
        }
      ]
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>TRANSMISSION HISTORY</Text>
        <Text style={styles.subtitle}>{history.length} transmissions</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
        }
      >
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No transmissions yet</Text>
            <Text style={styles.emptySubtext}>
              Send your first Morse message to see it here
            </Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.transmission_id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyMessage}>{item.message}</Text>
                <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
              </View>
              <Text style={styles.historyMorse}>{item.morse}</Text>
              <View style={styles.historyMeta}>
                <Text style={styles.metaText}>{item.wpm} WPM</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>{item.flash_duration_seconds}s</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>
                  {item.transmission_mode === 'LED_FLASH' && '💡 Flash'}
                  {item.transmission_mode === 'VIBRATION' && '📳 Vibration'}
                  {item.transmission_mode === 'BOTH' && '💡+📳 Both'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {history.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Text style={styles.clearButtonText}>🗑️ Clear History</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AFAFAF',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    margin: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyMessage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#6C6C6E',
  },
  historyMorse: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#AFAFAF',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#6C6C6E',
    marginHorizontal: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  clearButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
});
