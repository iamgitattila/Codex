import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { fetchBookmarks } from '../redux/slices/userSlice';
import { getTipById } from '../database/queries';
import { RootStackParamList, Tip } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Bookmarks'>;

const BookmarksScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();

  const { bookmarks } = useSelector((state: RootState) => state.user);
  const [bookmarkedTips, setBookmarkedTips] = useState<Tip[]>([]);

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  useEffect(() => {
    const loadBookmarkedTips = async () => {
      const tips: Tip[] = [];
      for (const bookmark of bookmarks) {
        const tip = await getTipById(bookmark.tip_id);
        if (tip) tips.push(tip);
      }
      setBookmarkedTips(tips);
    };

    loadBookmarkedTips();
  }, [bookmarks]);

  const handleTipPress = (tip: Tip) => {
    navigation.navigate('TipDetail', { tipId: tip.id });
  };

  const renderTipCard = ({ item }: { item: Tip }) => (
    <TouchableOpacity
      style={styles.tipCard}
      onPress={() => handleTipPress(item)}
      activeOpacity={0.7}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>

      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.difficultyBadge, styles[`difficulty${item.difficulty}`]]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>

      <Icon name="chevron-right" size={24} color="#2E7D32" />
    </TouchableOpacity>
  );

  if (bookmarkedTips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="bookmark-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
        <Text style={styles.emptyText}>
          Bookmark your favorite survival tips for quick access later!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {bookmarkedTips.length} Saved {bookmarkedTips.length === 1 ? 'Tip' : 'Tips'}
        </Text>
      </View>

      <FlatList
        data={bookmarkedTips}
        renderItem={renderTipCard}
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
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
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
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
});

export default BookmarksScreen;
