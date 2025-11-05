import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  Platform,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [count, setCount] = React.useState(0);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, {color: textColor}]}>
            Welcome to Codex Mobile
          </Text>

          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>
              Running on: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
            </Text>
          </View>

          <Text style={[styles.subtitle, {color: textColor}]}>
            Cross-Platform Mobile App
          </Text>

          <View style={styles.counterContainer}>
            <Text style={[styles.counterLabel, {color: textColor}]}>
              Counter: {count}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.incrementButton]}
                onPress={() => setCount(count + 1)}>
                <Text style={styles.buttonText}>Increment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.decrementButton]}
                onPress={() => setCount(count - 1)}>
                <Text style={styles.buttonText}>Decrement</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={() => setCount(0)}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.infoTitle, {color: textColor}]}>
              🚀 Features
            </Text>
            <Text style={[styles.infoText, {color: textColor}]}>
              ✓ Cross-platform (iOS & Android)
            </Text>
            <Text style={[styles.infoText, {color: textColor}]}>
              ✓ Dark mode support
            </Text>
            <Text style={[styles.infoText, {color: textColor}]}>
              ✓ Modern React hooks
            </Text>
            <Text style={[styles.infoText, {color: textColor}]}>
              ✓ TypeScript support
            </Text>
            <Text style={[styles.infoText, {color: textColor}]}>
              ✓ Responsive design
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  platformBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  platformText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  counterContainer: {
    alignItems: 'center',
    marginVertical: 30,
    width: '100%',
  },
  counterLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#34C759',
  },
  decrementButton: {
    backgroundColor: '#FF3B30',
  },
  resetButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    width: '100%',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 4,
    lineHeight: 24,
  },
});

export default App;
