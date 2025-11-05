import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { fetchScenarios } from '../redux/slices/scenariosSlice';
import { RootStackParamList, Scenario } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ScenarioList'>;

const ScenarioListScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();

  const { scenarios, loading } = useSelector((state: RootState) => state.scenarios);
  const { isPremium, progress } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchScenarios());
  }, [dispatch]);

  const handleScenarioPress = (scenario: Scenario) => {
    // Check if premium content is locked
    if (scenario.is_premium && !isPremium) {
      navigation.navigate('Paywall', { scenarioId: scenario.id });
      return;
    }

    navigation.navigate('ScenarioDetail', { scenarioId: scenario.id });
  };

  const getScenarioProgress = (scenarioId: string): number => {
    // Calculate progress percentage for this scenario
    const scenarioProgress = progress.filter(
      (p) => p.tip_id.startsWith(scenarioId)
    );

    if (scenarioProgress.length === 0) return 0;

    const completed = scenarioProgress.filter((p) => p.status === 'mastered').length;
    return Math.round((completed / 10) * 100); // 10 tips per scenario
  };

  const renderScenarioCard = ({ item }: { item: Scenario }) => {
    const progressPercent = getScenarioProgress(item.id);
    const isLocked = item.is_premium && !isPremium;

    return (
      <TouchableOpacity
        style={[styles.card, isLocked && styles.lockedCard]}
        onPress={() => handleScenarioPress(item)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
            {isLocked && (
              <View style={styles.lockBadge}>
                <Icon name="lock" size={16} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.metaContainer}>
              <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty_level}`]]}>
                <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
              </View>

              {!isLocked && progressPercent > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progressPercent}%</Text>
                </View>
              )}
            </View>
          </View>

          <Icon
            name={isLocked ? 'lock' : 'chevron-right'}
            size={24}
            color={isLocked ? '#9E9E9E' : '#2E7D32'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && scenarios.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading scenarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Master 10 Critical Survival Scenarios</Text>
        <Text style={styles.headerSubtitle}>
          {isPremium ? 'Premium Access' : 'Free: Fire & Water • Upgrade for All'}
        </Text>
      </View>

      <FlatList
        data={scenarios}
        renderItem={renderScenarioCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C8E6C9',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  icon: {
    fontSize: 48,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  difficultyBeginner: {
    backgroundColor: '#4CAF50',
  },
  difficultyIntermediate: {
    backgroundColor: '#FF9800',
  },
  difficultyAdvanced: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
});

export default ScenarioListScreen;
