// Home Screen - Quick access to signals and messages

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import SignalButton from '../components/SignalButton';
import MessageButton from '../components/MessageButton';
import { getPreSavedSignals, getCustomMessages, deleteCustomMessage } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const [preSavedSignals, setPreSavedSignals] = useState([]);
  const [customMessages, setCustomMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setPreSavedSignals(getPreSavedSignals());
    const messages = await getCustomMessages();
    setCustomMessages(messages);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSignalPress = (signal) => {
    navigation.navigate('Transmission', { signal });
  };

  const handleMessagePress = (message) => {
    navigation.navigate('Transmission', {
      signal: {
        name: message.text,
        morse: message.morse,
        wpm: message.wpm || 20,
        isCustom: true,
      }
    });
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteCustomMessage(messageId);
      await loadData();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MORSE BLINKER</Text>
        <Text style={styles.subtitle}>Signal. Communicate. Transmit.</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK SIGNALS</Text>
          {preSavedSignals.map((signal) => (
            <SignalButton
              key={signal.signal_id}
              signal={signal}
              onPress={() => handleSignalPress(signal)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOM MESSAGES</Text>
          {customMessages.length === 0 ? (
            <Text style={styles.emptyText}>No custom messages yet</Text>
          ) : (
            customMessages.map((message) => (
              <MessageButton
                key={message.message_id}
                message={message}
                onPress={() => handleMessagePress(message)}
                onDelete={() => handleDeleteMessage(message.message_id)}
              />
            ))
          )}

          <TouchableOpacity
            style={styles.newMessageButton}
            onPress={() => navigation.navigate('Encoder')}
          >
            <Text style={styles.newMessageText}>+ NEW MESSAGE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Practice')}
        >
          <Text style={styles.footerButtonText}>🎯 Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.footerButtonText}>📊 History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#AFAFAF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C6C6E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  newMessageButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  newMessageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  footerButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
