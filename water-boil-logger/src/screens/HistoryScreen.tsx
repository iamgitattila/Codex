// Water Boil Logger - History Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BoilLog } from '../types';
import { COLORS } from '../constants';
import { getBoilLogs, deleteBoilLog } from '../services/StorageService';
import { sortLogsByTimestamp, getLast30DaysLogs } from '../utils/calculations';
import LogEntry from '../components/LogEntry';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<BoilLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'last30'>('last30');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      const allLogs = await getBoilLogs();
      const sortedLogs = sortLogsByTimestamp(allLogs);

      if (filter === 'last30') {
        const last30 = getLast30DaysLogs(sortedLogs);
        setLogs(last30);
      } else {
        setLogs(sortedLogs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleDeleteLog = async (log: BoilLog) => {
    Alert.alert(
      'Delete Log',
      `Delete ${log.volume_oz} oz log from ${new Date(log.timestamp).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBoilLog(log.log_id);
              loadLogs();
              Alert.alert('Success', 'Log deleted successfully');
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('Error', 'Failed to delete log');
            }
          },
        },
      ]
    );
  };

  // Group logs by date
  const groupedLogs: { [date: string]: BoilLog[] } = {};
  logs.forEach(log => {
    const date = log.timestamp.split('T')[0];
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });

  const dates = Object.keys(groupedLogs).sort().reverse();

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'last30' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('last30')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'last30' && styles.filterButtonTextActive,
            ]}
          >
            Last 30 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No logs found</Text>
            <Text style={styles.emptyStateSubtext}>
              Start tracking your water intake
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                Total Logs: {logs.length}
              </Text>
              <Text style={styles.statsText}>
                Total Volume: {logs.reduce((sum, l) => sum + l.volume_oz, 0).toFixed(1)} oz
              </Text>
            </View>

            {dates.map(date => {
              const dayLogs = groupedLogs[date];
              const dateObj = new Date(date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const dayTotal = dayLogs.reduce((sum, l) => sum + l.volume_oz, 0);

              return (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <Text style={styles.dateTotalText}>
                      {dayTotal.toFixed(1)} oz
                    </Text>
                  </View>

                  {dayLogs.map(log => (
                    <LogEntry
                      key={log.log_id}
                      log={log}
                      onPress={() => handleDeleteLog(log)}
                    />
                  ))}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  statsBox: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
