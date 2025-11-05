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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { fetchTipsByScenario } from '../redux/slices/tipsSlice';
import { RootStackParamList, Tip } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ScenarioDetail'>;
type ScenarioDetailRouteProp = RouteProp<RootStackParamList, 'ScenarioDetail'>;

const ScenarioDetailScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScenarioDetailRouteProp>();

  const { scenarioId } = route.params;

  const { tipsByScenario, loading } = useSelector((state: RootState) => state.tips);
  const { scenarios } = useSelector((state: RootState) => state.scenarios);
  const { progress } = useSelector((state: RootState) => state.user);

  const tips = tipsByScenario[scenarioId] || [];
  const scenario = scenarios.find((s) => s.id === scenarioId);

  useEffect(() => {
    dispatch(fetchTipsByScenario(scenarioId));
  }, [dispatch, scenarioId]);

  useEffect(() => {
    if (scenario) {
      navigation.setOptions({ title: scenario.title });
    }
  }, [scenario, navigation]);

  const getTipProgress = (tipId: string): string | null => {
    const tipProgress = progress.find((p) => p.tip_id === tipId);
    return tipProgress?.status || null;
  };

  const handleTipPress = (tip: Tip) => {
    navigation.navigate('TipDetail', { tipId: tip.id });
  };

  const renderTipCard = ({ item }: { item: Tip }) => {
    const status = getTipProgress(item.id);

    const getStatusIcon = () => {
      switch (status) {
        case 'mastered':
          return 'check-circle';
        case 'attempted':
          return 'progress-check';
        case 'viewed':
          return 'eye';
        default:
          return 'circle-outline';
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case 'mastered':
          return '#4CAF50';
        case 'attempted':
          return '#FF9800';
        case 'viewed':
          return '#2196F3';
        default:
          return '#9E9E9E';
      }
    };

    return (
      <TouchableOpacity
        style={styles.tipCard}
        onPress={() => handleTipPress(item)}
        activeOpacity={0.7}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{item.rank}</Text>
        </View>

        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{item.title}</Text>

          <View style={styles.tipMeta}>
            <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty}`]]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>

            <View style={styles.timeBadge}>
              <Icon name="clock-outline" size={14} color="#757575" />
              <Text style={styles.timeText}>{item.time_to_master}</Text>
            </View>
          </View>
        </View>

        <Icon name={getStatusIcon()} size={28} color={getStatusColor()} />
      </TouchableOpacity>
    );
  };

  if (loading && tips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const completedTips = tips.filter((tip) => getTipProgress(tip.id) === 'mastered').length;
  const progressPercent = tips.length > 0 ? Math.round((completedTips / tips.length) * 100) : 0;

  return (
    <View style={styles.container}>
      {scenario && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerIcon}>{scenario.icon}</Text>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{scenario.title}</Text>
              <Text style={styles.headerDescription}>{scenario.description}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressValue}>
                {completedTips}/{tips.length} mastered
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={tips}
        renderItem={renderTipCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No tips available</Text>
          </View>
        }
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    fontSize: 56,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  headerDescription: {
    fontSize: 14,
    color: '#757575',
  },
  progressSection: {
    marginTop: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  listContent: {
    padding: 15,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
    fontSize: 11,
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 10,
  },
});

export default ScenarioDetailScreen;
