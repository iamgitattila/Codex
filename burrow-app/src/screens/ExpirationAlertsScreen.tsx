import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Divider, Chip, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';

import { assetService } from '../database/services/assetService';
import { Asset } from '../types';

export default function ExpirationAlertsScreen() {
  const navigation = useNavigation<any>();
  const [expiringSoon, setExpiringSoon] = useState<Asset[]>([]);
  const [expired, setExpired] = useState<Asset[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const soon = await assetService.getExpiringSoon(30);
    const exp = soon.filter(item => {
      const days = differenceInDays(parseISO(item.expirationDate!), new Date());
      return days < 0;
    });
    const notExp = soon.filter(item => {
      const days = differenceInDays(parseISO(item.expirationDate!), new Date());
      return days >= 0;
    });

    setExpiringSoon(notExp);
    setExpired(exp);
  };

  const getUrgencyColor = (expirationDate: string) => {
    const days = differenceInDays(parseISO(expirationDate), new Date());
    if (days < 0) return '#F44336'; // Expired
    if (days < 7) return '#F44336'; // Urgent
    if (days < 14) return '#FF9800'; // Soon
    return '#FFC107'; // Upcoming
  };

  const getUrgencyLabel = (expirationDate: string) => {
    const days = differenceInDays(parseISO(expirationDate), new Date());
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days remaining`;
  };

  const renderItem = ({ item }: { item: Asset }) => (
    <>
      <List.Item
        title={item.name}
        description={`Qty: ${item.quantityOwned} ${item.unitType} | ${format(parseISO(item.expirationDate!), 'MMM dd, yyyy')}`}
        left={(props) => (
          <List.Icon
            {...props}
            icon="alert-circle"
            color={getUrgencyColor(item.expirationDate!)}
          />
        )}
        right={() => (
          <Chip
            style={{ backgroundColor: getUrgencyColor(item.expirationDate!) + '20' }}
            textStyle={{ color: getUrgencyColor(item.expirationDate!) }}
          >
            {getUrgencyLabel(item.expirationDate!)}
          </Chip>
        )}
        onPress={() => navigation.navigate('ItemDetail', { assetId: item.id })}
      />
      <Divider />
    </>
  );

  return (
    <View style={styles.container}>
      {expired.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired ({expired.length})</Text>
          <FlatList
            data={expired}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      )}

      {expiringSoon.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiring Soon ({expiringSoon.length})</Text>
          <FlatList
            data={expiringSoon}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      )}

      {expired.length === 0 && expiringSoon.length === 0 && (
        <View style={styles.emptyState}>
          <Text>No items expiring in the next 30 days</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
