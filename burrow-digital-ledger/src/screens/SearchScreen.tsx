import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Text, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { searchAssets, fetchAssets } from '../redux/assetsSlice';

export default function SearchScreen() {
  const dispatch = useAppDispatch();
  const assets = useAppSelector((state) => state.assets.assets);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAssets());
  }, []);

  const onSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      dispatch(searchAssets(query));
    } else if (query.length === 0) {
      dispatch(fetchAssets());
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search assets..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">Quantity: {item.quantity_owned}</Text>
              <Text variant="bodySmall">Location: {item.location_name}</Text>
              <View style={styles.chipContainer}>
                <Chip compact>{item.category}</Chip>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { margin: 12 },
  card: { margin: 12, marginTop: 0 },
  chipContainer: { flexDirection: 'row', marginTop: 8 },
});
