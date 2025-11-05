import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { toggleBookmark, incrementViewCount } from '../redux/slices/userProgressSlice';
import { Protocol, URGENCY_COLORS, URGENCY_LABELS } from '../constants/protocols';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function BookmarksScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const protocols = useAppSelector((state) => state.protocols.protocols);
  const bookmarks = useAppSelector((state) => state.userProgress.bookmarks);
  const userProgress = useAppSelector((state) => state.userProgress.progress);

  const bookmarkedProtocols = protocols.filter((p) => bookmarks.includes(p.id));

  const handleProtocolPress = (protocolId: string) => {
    dispatch(incrementViewCount(protocolId));
    navigation.navigate('ProtocolDetail', { protocolId });
  };

  const handleRemoveBookmark = (protocolId: string) => {
    dispatch(toggleBookmark(protocolId));
  };

  const renderProtocolCard = ({ item }: { item: Protocol }) => {
    const progress = userProgress[item.id];
    const urgencyColor = URGENCY_COLORS[item.urgencyLevel];

    return (
      <TouchableOpacity onPress={() => handleProtocolPress(item.id)} activeOpacity={0.7}>
        <Card style={[styles.card, { borderLeftColor: urgencyColor, borderLeftWidth: 6 }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Chip
                style={[styles.urgencyChip, { backgroundColor: urgencyColor }]}
                textStyle={styles.chipText}
              >
                {URGENCY_LABELS[item.urgencyLevel]}
              </Chip>
              <TouchableOpacity
                onPress={() => handleRemoveBookmark(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="bookmark-remove" size={24} color="#FF5722" />
              </TouchableOpacity>
            </View>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {item.description}
            </Text>
            {progress && (
              <View style={styles.footer}>
                <Text variant="bodySmall" style={styles.footerText}>
                  Last viewed: {new Date(progress.lastViewed).toLocaleDateString()}
                </Text>
                {progress.status && (
                  <Chip style={styles.statusChip} compact>
                    {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                  </Chip>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (bookmarkedProtocols.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="bookmark-outline" size={80} color="#ccc" />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Bookmarks Yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          Bookmark protocols for quick access by tapping the bookmark icon on any protocol page.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Bookmarked Protocols
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {bookmarkedProtocols.length} protocol{bookmarkedProtocols.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      <FlatList
        data={bookmarkedProtocols}
        renderItem={renderProtocolCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgencyChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    color: '#999',
  },
  statusChip: {
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    lineHeight: 24,
  },
});
