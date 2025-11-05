import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchLocations } from '../redux/locationsSlice';

export default function LocationsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.locations.locations);

  useEffect(() => {
    dispatch(fetchLocations());
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() =>
              navigation.navigate('LocationView', {
                locationId: item.id,
                locationName: item.name,
              })
            }
          >
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">{item.location_type}</Text>
              <Text variant="bodySmall">{item.asset_count || 0} items</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
});
