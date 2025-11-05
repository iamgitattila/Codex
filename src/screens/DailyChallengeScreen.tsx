import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { fetchDailyChallenge } from '../redux/slices/userSlice';
import { fetchTipById } from '../redux/slices/tipsSlice';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DailyChallenge'>;

const DailyChallengeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();

  const { dailyChallenge } = useSelector((state: RootState) => state.user);
  const { currentTip } = useSelector((state: RootState) => state.tips);

  useEffect(() => {
    dispatch(fetchDailyChallenge());
  }, [dispatch]);

  useEffect(() => {
    if (dailyChallenge && !dailyChallenge.completed) {
      dispatch(fetchTipById(dailyChallenge.challenge_tip_id));
    }
  }, [dailyChallenge, dispatch]);

  const handleStartChallenge = () => {
    if (currentTip) {
      navigation.navigate('TipDetail', { tipId: currentTip.id });
    }
  };

  if (!dailyChallenge) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="calendar-star" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Challenge Today</Text>
          <Text style={styles.emptyText}>
            Complete more scenarios to unlock daily challenges!
          </Text>
        </View>
      </View>
    );
  }

  if (dailyChallenge.completed) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.completedContainer}>
          <Icon name="trophy" size={100} color="#FFD700" />
          <Text style={styles.completedTitle}>Challenge Complete!</Text>
          <Text style={styles.completedText}>
            You've completed today's challenge. Come back tomorrow for a new one!
          </Text>

          <View style={styles.streakCard}>
            <Icon name="fire" size={32} color="#FF5722" />
            <Text style={styles.streakText}>7 Day Streak! 🔥</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="calendar-star" size={60} color="#2E7D32" />
        <Text style={styles.headerTitle}>Today's Challenge</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</Text>
      </View>

      {currentTip && (
        <View style={styles.challengeCard}>
          <View style={styles.cardHeader}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{currentTip.rank}</Text>
            </View>
            <View style={[styles.difficultyBadge, styles[`difficulty${currentTip.difficulty}`]]}>
              <Text style={styles.difficultyText}>{currentTip.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.challengeTitle}>{currentTip.title}</Text>

          <View style={styles.timeContainer}>
            <Icon name="clock-outline" size={18} color="#757575" />
            <Text style={styles.timeText}>Time to master: {currentTip.time_to_master}</Text>
          </View>

          <Text style={styles.challengeDescription} numberOfLines={3}>
            {currentTip.instruction_text.substring(0, 150)}...
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStartChallenge}>
            <Icon name="play-circle" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why Daily Challenges?</Text>
        <Text style={styles.infoText}>
          Spaced repetition is proven to build muscle memory. Practice one skill per day to
          develop unconscious competency in survival situations.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 15,
  },
  headerDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  challengeCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#616161',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2E7D32',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
  },
  completedContainer: {
    alignItems: 'center',
    padding: 40,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
  },
  completedText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
    gap: 12,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
});

export default DailyChallengeScreen;
