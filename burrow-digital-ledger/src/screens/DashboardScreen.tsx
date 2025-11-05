// Dashboard Screen - Main overview of inventory
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  IconButton,
  ProgressBar,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchAssets, fetchExpiringAssets, fetchAssetsBelowPar } from '../redux/assetsSlice';
import { fetchLocations } from '../redux/locationsSlice';
import { fetchKits } from '../redux/kitsSlice';
import { getTotalInventoryValue } from '../database/assetService';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const assets = useAppSelector((state) => state.assets.assets);
  const locations = useAppSelector((state) => state.locations.locations);
  const kits = useAppSelector((state) => state.kits.kits);
  const loading = useAppSelector((state) => state.assets.loading);

  const [totalValue, setTotalValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);
  const [belowParCount, setBelowParCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchAssets()).unwrap(),
        dispatch(fetchLocations()).unwrap(),
        dispatch(fetchKits()).unwrap(),
      ]);

      const value = await getTotalInventoryValue();
      setTotalValue(value);

      // Get expiring assets count
      const expiringAssets = await dispatch(fetchExpiringAssets(30)).unwrap();
      setExpiringCount(expiringAssets.length);

      // Get below par count
      const belowParAssets = await dispatch(fetchAssetsBelowPar()).unwrap();
      setBelowParCount(belowParAssets.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Quick Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Stats
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Total Assets:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              {assets.length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Total Value:</Text>
            <Text variant="bodyLarge" style={styles.statValue}>
              ${totalValue.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Expiring Soon:</Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.statValue,
                expiringCount > 0 && { color: theme.colors.error },
              ]}
            >
              {expiringCount} items
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">Below Par:</Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.statValue,
                belowParCount > 0 && { color: theme.colors.error },
              ]}
            >
              {belowParCount} items
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('AddEditAsset', {})}
              style={styles.actionButton}
            >
              New Item
            </Button>
            <Button
              mode="outlined"
              icon="magnify"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' } as any)}
              style={styles.actionButton}
            >
              Search
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Expiring Soon */}
      {expiringCount > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Expiring Soon
              </Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => navigation.navigate('ExpirationAlerts')}
              />
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {expiringCount} items expiring within 30 days
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ExpirationAlerts')}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Shopping List */}
      {belowParCount > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Shopping Needed
              </Text>
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={() => navigation.navigate('ShoppingList')}
              />
            </View>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">
              {belowParCount} items below par level
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ShoppingList')}
              style={styles.viewAllButton}
            >
              Generate Shopping List
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Locations */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Locations
          </Text>
          <Divider style={styles.divider} />
          {locations.slice(0, 4).map((location) => (
            <TouchableOpacity
              key={location.id}
              onPress={() =>
                navigation.navigate('LocationView', {
                  locationId: location.id,
                  locationName: location.name,
                })
              }
            >
              <View style={styles.locationItem}>
                <Text variant="bodyLarge">{location.name}</Text>
                <Text variant="bodySmall" style={styles.secondaryText}>
                  {location.asset_count || 0} items
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <Button
            mode="text"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Locations' } as any)}
            style={styles.viewAllButton}
          >
            View All Locations
          </Button>
        </Card.Content>
      </Card>

      {/* Kits */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Kits & Collections
          </Text>
          <Divider style={styles.divider} />
          {kits.slice(0, 3).map((kit) => {
            const completion =
              kit.total_items > 0 ? kit.packed_items / kit.total_items : 0;

            return (
              <TouchableOpacity
                key={kit.id}
                onPress={() => navigation.navigate('KitDetails', { kitId: kit.id })}
              >
                <View style={styles.kitItem}>
                  <View>
                    <Text variant="bodyLarge">{kit.name}</Text>
                    <Text variant="bodySmall" style={styles.secondaryText}>
                      Packed: {kit.packed_items}/{kit.total_items} items
                    </Text>
                  </View>
                  <ProgressBar
                    progress={completion}
                    color={completion >= 0.8 ? theme.colors.primary : theme.colors.error}
                    style={styles.progressBar}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
          <Button
            mode="text"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Kits' } as any)}
            style={styles.viewAllButton}
          >
            View All Kits
          </Button>
        </Card.Content>
      </Card>

      {/* Export & Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="file-export"
              onPress={() => navigation.navigate('DataExport')}
              style={styles.actionButton}
            >
              Export PDF
            </Button>
            <Button
              mode="outlined"
              icon="cog"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' } as any)}
              style={styles.actionButton}
            >
              Settings
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statValue: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  kitItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  secondaryText: {
    color: '#757575',
  },
  progressBar: {
    marginTop: 8,
    height: 8,
    borderRadius: 4,
  },
  viewAllButton: {
    marginTop: 8,
  },
});
