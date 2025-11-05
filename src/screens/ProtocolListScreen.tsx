import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text, Card, Chip, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { incrementViewCount } from '../redux/slices/userProgressSlice';
import { Protocol, URGENCY_COLORS, URGENCY_LABELS, UrgencyLevel } from '../constants/protocols';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ProtocolList'>;

export default function ProtocolListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const protocols = useAppSelector((state) => state.protocols.protocols);
  const userProgress = useAppSelector((state) => state.userProgress.progress);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | null>(null);

  const filteredProtocols = protocols.filter((protocol) => {
    const matchesSearch =
      searchQuery === '' ||
      protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = !filterUrgency || protocol.urgencyLevel === filterUrgency;

    return matchesSearch && matchesFilter;
  });

  const handleProtocolPress = (protocolId: string) => {
    dispatch(incrementViewCount(protocolId));
    navigation.navigate('ProtocolDetail', { protocolId });
  };

  const renderProtocolCard = ({ item }: { item: Protocol }) => {
    const progress = userProgress[item.id];
    const viewCount = progress?.viewCount || 0;
    const urgencyColor = URGENCY_COLORS[item.urgencyLevel];

    return (
      <TouchableOpacity
        onPress={() => handleProtocolPress(item.id)}
        activeOpacity={0.7}
      >
        <Card style={[styles.card, { borderLeftColor: urgencyColor, borderLeftWidth: 6 }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Chip
                style={[styles.urgencyChip, { backgroundColor: urgencyColor }]}
                textStyle={styles.chipText}
              >
                {URGENCY_LABELS[item.urgencyLevel]}
              </Chip>
              {progress?.bookmarked && (
                <Text style={styles.bookmarkIcon}>⭐</Text>
              )}
            </View>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {item.description}
            </Text>
            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                {viewCount > 0 ? `Viewed ${viewCount} times` : 'Not viewed yet'}
              </Text>
              {progress?.status && (
                <Chip style={styles.statusChip} compact>
                  {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="bodyLarge" style={styles.tagline}>
          "Medical skills for when professionals can't reach you"
        </Text>
      </View>

      <Searchbar
        placeholder="Search protocols..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Text variant="bodyMedium" style={styles.filterLabel}>
          Filter by urgency:
        </Text>
        <View style={styles.filterChips}>
          <Chip
            selected={filterUrgency === null}
            onPress={() => setFilterUrgency(null)}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filterUrgency === 'RED'}
            onPress={() => setFilterUrgency('RED')}
            style={styles.filterChip}
            selectedColor={URGENCY_COLORS.RED}
          >
            Critical
          </Chip>
          <Chip
            selected={filterUrgency === 'YELLOW'}
            onPress={() => setFilterUrgency('YELLOW')}
            style={styles.filterChip}
            selectedColor={URGENCY_COLORS.YELLOW}
          >
            Important
          </Chip>
          <Chip
            selected={filterUrgency === 'GREEN'}
            onPress={() => setFilterUrgency('GREEN')}
            style={styles.filterChip}
            selectedColor={URGENCY_COLORS.GREEN}
          >
            Reference
          </Chip>
        </View>
      </View>

      <FlatList
        data={filteredProtocols}
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
  tagline: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
  bookmarkIcon: {
    fontSize: 20,
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
});
