import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, List, Divider, ProgressBar, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { kitService } from '../database/services/kitService';
import { Kit, KitItem } from '../types';

export default function KitDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [kit, setKit] = useState<Kit | null>(null);
  const [kitItems, setKitItems] = useState<KitItem[]>([]);
  const [progress, setProgress] = useState({ packed: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, [route.params]);

  const loadData = async () => {
    if (route.params?.kitId) {
      const k = await kitService.getById(route.params.kitId);
      setKit(k);

      if (k) {
        const items = await kitService.getKitItems(k.id);
        setKitItems(items);

        const prog = await kitService.getKitProgress(k.id);
        setProgress(prog);
      }
    }
  };

  if (!kit) {
    return (
      <View style={styles.container}>
        <Paragraph>Loading...</Paragraph>
      </View>
    );
  }

  const progressPercent = progress.total > 0 ? progress.packed / progress.total : 0;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{kit.name}</Title>
          {kit.description && <Paragraph>{kit.description}</Paragraph>}
          <Paragraph style={styles.meta}>Type: {kit.kitType}</Paragraph>

          <View style={styles.progressContainer}>
            <Paragraph>
              Packed: {progress.packed} / {progress.total}
            </Paragraph>
            <ProgressBar progress={progressPercent} color="#2E7D32" style={styles.progressBar} />
            <Chip icon={progressPercent >= 1 ? 'check-circle' : 'alert-circle'}>
              {Math.round(progressPercent * 100)}% Complete
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={kitItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            <List.Item
              title={`Item ID: ${item.assetId}`}
              description={`Required: ${item.quantityRequired}`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={item.isPacked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  color={item.isPacked ? '#2E7D32' : '#999'}
                />
              )}
            />
            <Divider />
          </>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Paragraph>No items in this kit</Paragraph>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 12,
  },
  meta: {
    marginTop: 8,
    color: '#666',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    marginVertical: 8,
    height: 8,
    borderRadius: 4,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
});
