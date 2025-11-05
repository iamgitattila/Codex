import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, List, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { differenceInDays, parseISO } from 'date-fns';

import { fetchAssets } from '../store/slices/assetsSlice';
import { fetchLocations } from '../store/slices/locationsSlice';
import { fetchKits } from '../store/slices/kitsSlice';
import { RootState, AppDispatch } from '../store';
import { assetService } from '../database/services/assetService';
import { DashboardStats } from '../types';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const assets = useSelector((state: RootState) => state.assets.items);
  const locations = useSelector((state: RootState) => state.locations.items);
  const kits = useSelector((state: RootState) => state.kits.items);

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalValue: 0,
    expiringSoon: 0,
    belowPar: 0,
    locationCount: 0,
    kitCount: 0,
  });
  const [expiringSoonItems, setExpiringSoonItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchAssets()),
        dispatch(fetchLocations()),
        dispatch(fetchKits()),
      ]);
      await calculateStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateStats = async () => {
    try {
      const totalAssets = await assetService.getCount();
      const totalValue = await assetService.getTotalValue();
      const expiring = await assetService.getExpiringSoon(30);
      const belowPar = await assetService.getBelowPar();

      setStats({
        totalAssets,
        totalValue,
        expiringSoon: expiring.length,
        belowPar: belowPar.length,
        locationCount: locations.length,
        kitCount: kits.length,
      });

      setExpiringSoonItems(expiring.slice(0, 5));
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getExpirationColor = (expirationDate: string) => {
    const days = differenceInDays(parseISO(expirationDate), new Date());
    if (days < 7) return '#F44336'; // Red
    if (days < 14) return '#FF9800'; // Orange
    return '#FFC107'; // Yellow
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Stats</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="package-variant" size={32} color="#2E7D32" />
                <Paragraph style={styles.statNumber}>{stats.totalAssets}</Paragraph>
                <Paragraph style={styles.statLabel}>Total Assets</Paragraph>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="currency-usd" size={32} color="#2E7D32" />
                <Paragraph style={styles.statNumber}>${stats.totalValue.toFixed(0)}</Paragraph>
                <Paragraph style={styles.statLabel}>Total Value</Paragraph>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#F44336" />
                <Paragraph style={styles.statNumber}>{stats.expiringSoon}</Paragraph>
                <Paragraph style={styles.statLabel}>Expiring Soon</Paragraph>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="arrow-down-circle" size={32} color="#FF9800" />
                <Paragraph style={styles.statNumber}>{stats.belowPar}</Paragraph>
                <Paragraph style={styles.statLabel}>Below Par</Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title>Expiring Soon</Title>
              {stats.expiringSoon > 0 && (
                <Chip icon="alert" textStyle={{ color: '#F44336' }}>
                  {stats.expiringSoon}
                </Chip>
              )}
            </View>
            {expiringSoonItems.length === 0 ? (
              <Paragraph>No items expiring in the next 30 days</Paragraph>
            ) : (
              expiringSoonItems.map((item, index) => {
                const days = differenceInDays(parseISO(item.expirationDate), new Date());
                return (
                  <React.Fragment key={item.id}>
                    <List.Item
                      title={item.name}
                      description={`Expires in ${days} days`}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="alert-circle"
                          color={getExpirationColor(item.expirationDate)}
                        />
                      )}
                      onPress={() => navigation.navigate('ItemDetail', { assetId: item.id })}
                    />
                    {index < expiringSoonItems.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })
            )}
            {stats.expiringSoon > 5 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('ExpirationAlerts')}
                style={styles.viewAllButton}
              >
                View All ({stats.expiringSoon})
              </Button>
            )}
          </Card.Content>
        </Card>

        {stats.belowPar > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>Items Below Par Level</Title>
                <Chip icon="arrow-down">{stats.belowPar}</Chip>
              </View>
              <Paragraph>
                {stats.belowPar} items are below their minimum par levels
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ShoppingList')}
                style={styles.actionButton}
                icon="cart"
              >
                Generate Shopping List
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Locations')}
                style={styles.quickActionButton}
                icon="map-marker"
              >
                Locations ({stats.locationCount})
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Kits')}
                style={styles.quickActionButton}
                icon="bag-checked"
              >
                Kits ({stats.kitCount})
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
        label="Add Item"
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButton: {
    marginTop: 12,
  },
  viewAllButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
});
