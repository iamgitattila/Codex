import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, List, Chip, Divider, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { assetService } from '../database/services/assetService';
import { Asset } from '../types';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const [filters, setFilters] = useState({
    consumables: true,
    gear: true,
    kits: true,
    documents: true,
    belowPar: false,
    expiringSoon: false,
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const searchResults = await assetService.search(query);
        setResults(applyFilters(searchResults));
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setResults([]);
    }
  };

  const applyFilters = (items: Asset[]) => {
    let filtered = items;

    // Category filters
    const activeCategories = [];
    if (filters.consumables) activeCategories.push('Consumable');
    if (filters.gear) activeCategories.push('Gear');
    if (filters.kits) activeCategories.push('Kit');
    if (filters.documents) activeCategories.push('Document');

    if (activeCategories.length > 0) {
      filtered = filtered.filter(item => activeCategories.includes(item.category));
    }

    // Below par filter
    if (filters.belowPar) {
      filtered = filtered.filter(
        item => item.quantityPar && item.quantityOwned < item.quantityPar
      );
    }

    // Expiring soon filter
    if (filters.expiringSoon) {
      filtered = filtered.filter(item => {
        if (!item.expirationDate) return false;
        const days = Math.floor(
          (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return days <= 30 && days >= 0;
      });
    }

    return filtered;
  };

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: !prev[filterName] };
      if (searchQuery.length >= 2) {
        assetService.search(searchQuery).then(searchResults => {
          setResults(applyFilters(searchResults));
        });
      }
      return newFilters;
    });
  };

  const getStatusIcon = (item: Asset) => {
    if (item.quantityPar && item.quantityOwned < item.quantityPar) {
      return 'arrow-down-circle';
    }
    if (item.expirationDate) {
      const days = Math.floor(
        (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days < 7) return 'alert-circle';
      if (days < 14) return 'alert';
    }
    return 'package-variant';
  };

  const getStatusColor = (item: Asset) => {
    if (item.quantityPar && item.quantityOwned < item.quantityPar) {
      return '#FF9800';
    }
    if (item.expirationDate) {
      const days = Math.floor(
        (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days < 7) return '#F44336';
      if (days < 14) return '#FF9800';
    }
    return '#2E7D32';
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search inventory..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filters}>
        <Chip
          selected={filters.consumables}
          onPress={() => toggleFilter('consumables')}
          style={styles.chip}
        >
          Consumables
        </Chip>
        <Chip
          selected={filters.gear}
          onPress={() => toggleFilter('gear')}
          style={styles.chip}
        >
          Gear
        </Chip>
        <Chip
          selected={filters.kits}
          onPress={() => toggleFilter('kits')}
          style={styles.chip}
        >
          Kits
        </Chip>
        <Chip
          selected={filters.belowPar}
          onPress={() => toggleFilter('belowPar')}
          style={styles.chip}
          icon="arrow-down"
        >
          Below Par
        </Chip>
      </View>

      {searchQuery.length < 2 ? (
        <View style={styles.emptyState}>
          <Text>Enter at least 2 characters to search</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>No results found for "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <>
              <List.Item
                title={item.name}
                description={`Qty: ${item.quantityOwned} ${item.unitType} | Location: ${item.locationId}`}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={getStatusIcon(item)}
                    color={getStatusColor(item)}
                  />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('ItemDetail', { assetId: item.id })}
              />
              <Divider />
            </>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
