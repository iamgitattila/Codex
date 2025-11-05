import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { fetchTipById } from '../redux/slices/tipsSlice';
import { updateProgress, toggleBookmark, fetchBookmarks } from '../redux/slices/userSlice';
import { RootStackParamList } from '../types';

type TipDetailRouteProp = RouteProp<RootStackParamList, 'TipDetail'>;

const TipDetailScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<TipDetailRouteProp>();
  const navigation = useNavigation();

  const { tipId } = route.params;

  const { currentTip, loading } = useSelector((state: RootState) => state.tips);
  const { progress, bookmarks } = useSelector((state: RootState) => state.user);

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    dispatch(fetchTipById(tipId));
    dispatch(fetchBookmarks());

    // Mark as viewed when opened
    dispatch(updateProgress({ tipId, status: 'viewed' }));
  }, [dispatch, tipId]);

  useEffect(() => {
    const bookmarked = bookmarks.some((b) => b.tip_id === tipId);
    setIsBookmarked(bookmarked);
  }, [bookmarks, tipId]);

  useEffect(() => {
    if (currentTip) {
      navigation.setOptions({ title: currentTip.title });
    }
  }, [currentTip, navigation]);

  const handleBookmark = () => {
    dispatch(toggleBookmark({ tipId, isBookmarked }));
  };

  const handleMarkAttempted = () => {
    dispatch(updateProgress({ tipId, status: 'attempted' }));
  };

  const handleMarkMastered = () => {
    dispatch(updateProgress({ tipId, status: 'mastered' }));
  };

  if (loading || !currentTip) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const tipProgress = progress.find((p) => p.tip_id === tipId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{currentTip.rank}</Text>
            </View>
            <TouchableOpacity style={styles.bookmarkButton} onPress={handleBookmark}>
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={isBookmarked ? '#FF9800' : '#757575'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{currentTip.title}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, styles[`difficulty${currentTip.difficulty}`]]}>
              <Text style={styles.difficultyText}>{currentTip.difficulty}</Text>
            </View>

            <View style={styles.timeBadge}>
              <Icon name="clock-outline" size={16} color="#757575" />
              <Text style={styles.timeText}>Time to master: {currentTip.time_to_master}</Text>
            </View>
          </View>

          {tipProgress && (
            <View style={[styles.statusBadge, styles[`status${tipProgress.status}`]]}>
              <Text style={styles.statusText}>
                {tipProgress.status === 'mastered'
                  ? '✓ Mastered'
                  : tipProgress.status === 'attempted'
                  ? '⚡ Attempted'
                  : '👁 Viewed'}
              </Text>
            </View>
          )}
        </View>

        {/* Main Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>{currentTip.instruction_text}</Text>
        </View>

        {/* Success Criteria */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Success Criteria</Text>
          </View>
          <Text style={styles.bodyText}>{currentTip.success_criteria}</Text>
        </View>

        {/* Materials Needed */}
        {currentTip.materials_needed && currentTip.materials_needed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="toolbox" size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Materials Needed</Text>
            </View>
            {currentTip.materials_needed.map((material, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemText}>{material}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Common Mistakes */}
        {currentTip.common_mistakes && currentTip.common_mistakes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="alert-circle" size={20} color="#F44336" />
              <Text style={styles.sectionTitle}>Common Mistakes</Text>
            </View>
            {currentTip.common_mistakes.map((mistake, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>⚠️</Text>
                <Text style={styles.listItemText}>{mistake}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Variations */}
        {currentTip.variations && currentTip.variations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="swap-horizontal" size={20} color="#2196F3" />
              <Text style={styles.sectionTitle}>Variations</Text>
            </View>
            {currentTip.variations.map((variation, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>→</Text>
                <Text style={styles.listItemText}>{variation}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {tipProgress?.status !== 'attempted' && tipProgress?.status !== 'mastered' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAttempted}>
            <Icon name="progress-check" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark Attempted</Text>
          </TouchableOpacity>
        )}

        {tipProgress?.status !== 'mastered' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.masteredButton]}
            onPress={handleMarkMastered}>
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark Mastered</Text>
          </TouchableOpacity>
        )}

        {tipProgress?.status === 'mastered' && (
          <View style={styles.completedBanner}>
            <Icon name="trophy" size={24} color="#FFD700" />
            <Text style={styles.completedText}>Skill Mastered! 🎉</Text>
          </View>
        )}
      </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
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
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  statusviewed: {
    backgroundColor: '#E3F2FD',
  },
  statusattempted: {
    backgroundColor: '#FFF3E0',
  },
  statusmastered: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#424242',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#424242',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#757575',
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#424242',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  masteredButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  completedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 10,
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TipDetailScreen;
