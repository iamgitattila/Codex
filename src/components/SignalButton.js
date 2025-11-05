// Signal Button Component for Pre-Saved Signals

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export default function SignalButton({ signal, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{signal.icon}</Text>
        <Text style={styles.name}>{signal.name}</Text>
      </View>
      <Text style={styles.morse}>{signal.morse}</Text>
      <Text style={styles.english}>{signal.english}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  morse: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  english: {
    fontSize: 14,
    color: '#AFAFAF',
  },
});
