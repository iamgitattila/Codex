import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchKits } from '../redux/kitsSlice';

export default function KitsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const kits = useAppSelector((state) => state.kits.kits);

  useEffect(() => {
    dispatch(fetchKits());
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={kits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const completion = item.total_items > 0 ? item.packed_items / item.total_items : 0;
          return (
            <Card
              style={styles.card}
              onPress={() => navigation.navigate('KitDetails', { kitId: item.id })}
            >
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall">{item.kit_type}</Text>
                <Text variant="bodySmall">
                  Packed: {item.packed_items}/{item.total_items} items
                </Text>
                <ProgressBar
                  progress={completion}
                  color={completion >= 0.8 ? theme.colors.primary : theme.colors.error}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 12 },
  progressBar: { marginTop: 8, height: 8, borderRadius: 4 },
});
