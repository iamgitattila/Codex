// Water Boil Logger - Log Entry Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BoilLog } from '../types';
import { COLORS } from '../constants';

interface LogEntryProps {
  log: BoilLog;
  onPress?: () => void;
}

export default function LogEntry({ log, onPress }: LogEntryProps) {
  const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const date = new Date(log.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftSection}>
        <Text style={styles.volumeText}>{log.volume_oz} oz</Text>
        <Text style={styles.litersText}>({log.volume_liters.toFixed(2)}L)</Text>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.personText}>{log.person}</Text>
        {log.notes && <Text style={styles.notesText}>{log.notes}</Text>}
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  volumeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  litersText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  personText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
