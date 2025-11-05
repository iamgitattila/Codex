import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getAssetsBelowPar } from '../database/assetService';
import { AssetWithLocation } from '../types';

export default function ParLevelScreen() {
  const navigation = useNavigation<any>();
  const [belowParAssets, setBelowParAssets] = useState<AssetWithLocation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const assets = await getAssetsBelowPar();
    setBelowParAssets(assets);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={belowParAssets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const needed = (item.quantity_par || 0) - item.quantity_owned;
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall">
                  Current: {item.quantity_owned} | Par: {item.quantity_par}
                </Text>
                <Text variant="bodySmall" style={{ color: '#d32f2f' }}>
                  Need: {needed} more
                </Text>
                <Button mode="outlined" onPress={() => {}} style={styles.button}>
                  Add to Shopping List
                </Button>
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
  button: { marginTop: 8 },
});
