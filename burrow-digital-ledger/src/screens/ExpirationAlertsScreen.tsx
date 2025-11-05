import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { getExpiringAssets, getExpiredAssets } from '../database/assetService';
import { AssetWithLocation } from '../types';

export default function ExpirationAlertsScreen() {
  const theme = useTheme();
  const [expiringAssets, setExpiringAssets] = useState<AssetWithLocation[]>([]);
  const [expiredAssets, setExpiredAssets] = useState<AssetWithLocation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const expiring = await getExpiringAssets(30);
    const expired = await getExpiredAssets();
    setExpiringAssets(expiring);
    setExpiredAssets(expired);
  };

  const allAssets = [...expiredAssets, ...expiringAssets];

  return (
    <View style={styles.container}>
      <FlatList
        data={allAssets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpired = expiredAssets.some((a) => a.id === item.id);
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: isExpired ? theme.colors.error : theme.colors.primary }}
                >
                  {isExpired ? 'EXPIRED' : 'Expiring Soon'}
                </Text>
                <Text variant="bodySmall">Expires: {item.expiration_date}</Text>
                <Text variant="bodySmall">Location: {item.location_name}</Text>
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
});
