/**
 * Bug-Out Timer - Home Screen
 * Main screen with scenario selection buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { SCENARIOS } from '../scenarios';
import { COLORS, TYPOGRAPHY, SPACING, DIMENSIONS } from '../constants';
import { getLastDrill } from '../utils/storage';
import { formatTimeHuman, formatDrillDate } from '../utils/timer';
import sharedStyles from '../styles/shared';

const HomeScreen = ({ navigation }) => {
  const [lastDrill, setLastDrill] = useState(null);

  useEffect(() => {
    loadLastDrill();

    // Reload last drill when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadLastDrill();
    });

    return unsubscribe;
  }, [navigation]);

  const loadLastDrill = async () => {
    const drill = await getLastDrill();
    setLastDrill(drill);
  };

  const handleScenarioPress = (scenario) => {
    navigation.navigate('Drill', { scenario });
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleRepeatPress = () => {
    if (lastDrill) {
      const scenario = SCENARIOS.find(s => s.id === lastDrill.scenario_id);
      if (scenario) {
        handleScenarioPress(scenario);
      }
    }
  };

  const handleViewPress = () => {
    if (lastDrill) {
      navigation.navigate('DrillDetail', { drill: lastDrill });
    }
  };

  const renderScenarioButton = (scenario) => {
    return (
      <TouchableOpacity
        key={scenario.id}
        style={[styles.scenarioButton, { backgroundColor: scenario.color }]}
        onPress={() => handleScenarioPress(scenario)}
        activeOpacity={0.8}
      >
        <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
        <Text style={styles.scenarioDuration}>
          {formatTimeHuman(scenario.duration).toUpperCase()}
        </Text>
        <Text style={styles.scenarioName}>{scenario.name}</Text>
        <Text style={styles.scenarioDescription} numberOfLines={2}>
          {scenario.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>BUG-OUT TIMER</Text>
          <Text style={styles.subtitle}>Evacuate. Execute. Measure.</Text>
        </View>

        {/* Scenario Buttons */}
        <View style={styles.scenariosContainer}>
          {SCENARIOS.map(scenario => renderScenarioButton(scenario))}
        </View>

        {/* Last Drill Section */}
        {lastDrill && (
          <View style={styles.lastDrillContainer}>
            <View style={styles.divider} />
            <Text style={styles.lastDrillHeader}>LAST DRILL</Text>
            <View style={styles.lastDrillInfo}>
              <Text style={styles.lastDrillScenario}>
                {lastDrill.scenario_name}
              </Text>
              <Text style={styles.lastDrillDetails}>
                {lastDrill.tasks_completed}/{lastDrill.tasks_total} tasks •{' '}
                {formatDrillDate(lastDrill.start_time)}
              </Text>
            </View>
            <View style={styles.lastDrillButtons}>
              <TouchableOpacity
                style={styles.lastDrillButton}
                onPress={handleRepeatPress}
              >
                <Text style={styles.lastDrillButtonText}>🔄 REPEAT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.lastDrillButton}
                onPress={handleViewPress}
              >
                <Text style={styles.lastDrillButtonText}>👁️ VIEW</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
          </View>
        )}

        {/* Footer Buttons */}
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleHistoryPress}
          >
            <Text style={styles.footerButtonText}>📜 HISTORY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleSettingsPress}
          >
            <Text style={styles.footerButtonText}>⚙️ SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.header + 8,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.sm
  },

  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    letterSpacing: 1
  },

  scenariosContainer: {
    marginBottom: SPACING.lg
  },

  scenarioButton: {
    borderRadius: DIMENSIONS.borderRadius.large,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center'
  },

  scenarioEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm
  },

  scenarioDuration: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: 1
  },

  scenarioName: {
    fontSize: TYPOGRAPHY.fontSize.scenarioName,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },

  scenarioDescription: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    opacity: 0.9
  },

  lastDrillContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg
  },

  lastDrillHeader: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.md
  },

  lastDrillInfo: {
    marginBottom: SPACING.md
  },

  lastDrillScenario: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },

  lastDrillDetails: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary
  },

  lastDrillButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },

  lastDrillButton: {
    flex: 1,
    height: DIMENSIONS.buttonHeight.small,
    backgroundColor: COLORS.buttonSecondary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center'
  },

  lastDrillButtonText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },

  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: 'auto',
    paddingTop: SPACING.lg
  },

  footerButton: {
    flex: 1,
    height: DIMENSIONS.buttonHeight.medium,
    backgroundColor: COLORS.buttonSecondary,
    borderRadius: DIMENSIONS.borderRadius.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center'
  },

  footerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary
  }
});

export default HomeScreen;
