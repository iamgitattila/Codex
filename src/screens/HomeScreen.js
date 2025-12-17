/**
 * HomeScreen - Main dashboard showing inventory, alerts, and FIFO queue
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getCans } from '../services/storage';
import {
  calculateTotalFuel,
  generateFifoQueue,
  generateAlerts,
} from '../utils/fuelCalculations';
import CanListItem from '../components/CanListItem';
import CanPreview from '../components/CanPreview';
import AlertBanner from '../components/AlertBanner';
import { colors, spacing, borderRadius, typography, globalStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [cans, setCans] = useState([]);
  const [totalFuel, setTotalFuel] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [fifoQueue, setFifoQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInventory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadInventory = async () => {
    try {
      const cansList = await getCans();
      setCans(cansList);

      // Calculate total fuel
      const total = calculateTotalFuel(cansList);
      setTotalFuel(total);

      // Generate FIFO queue
      const queue = generateFifoQueue(cansList);
      setFifoQueue(queue);

      // Generate alerts
      const alertsList = generateAlerts(cansList);
      setAlerts(alertsList);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const handleCanPress = (can) => {
    navigation.navigate('CanDetail', { can });
  };

  const handleAlertPress = (alert) => {
    navigation.navigate('CanDetail', { can: alert.can });
  };

  const handleUseFuelPress = (can) => {
    navigation.navigate('UseFuel', { can });
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={globalStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Inventory Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL FUEL STORED</Text>
          <Text style={styles.totalValue}>{totalFuel.toFixed(1)} gallons</Text>
          <Text style={styles.totalCans}>
            {cans.length} can{cans.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ ALERTS ({alerts.length})</Text>
            {alerts.map((alert, index) => (
              <AlertBanner
                key={index}
                alert={alert}
                onPress={() => handleAlertPress(alert)}
              />
            ))}
          </View>
        )}

        {/* FIFO Queue (Use First) */}
        {fifoQueue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USE FIRST (FIFO QUEUE)</Text>
            <CanPreview can={fifoQueue[0]} />
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonDanger, styles.useFuelButton]}
              onPress={() => handleUseFuelPress(fifoQueue[0])}
            >
              <Text style={globalStyles.buttonText}>USE THIS CAN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* All Cans List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ALL CANS ({cans.length})
          </Text>

          {cans.length === 0 ? (
            <View style={globalStyles.emptyState}>
              <Text style={globalStyles.emptyStateIcon}>⛽</Text>
              <Text style={globalStyles.emptyStateTitle}>No Fuel Cans</Text>
              <Text style={globalStyles.emptyStateText}>
                Tap the button below to add your first fuel can
              </Text>
            </View>
          ) : (
            cans.map((can, index) => (
              <CanListItem
                key={index}
                can={can}
                onPress={() => handleCanPress(can)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Footer Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSuccess, styles.addButton]}
          onPress={() => navigation.navigate('AddCan')}
        >
          <Text style={globalStyles.buttonText}>+ ADD CAN</Text>
        </TouchableOpacity>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[globalStyles.buttonOutline, styles.footerButton]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={globalStyles.buttonOutlineText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.buttonOutline, styles.footerButton]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={globalStyles.buttonOutlineText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  totalCans: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  useFuelButton: {
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  addButton: {
    marginBottom: spacing.sm,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default HomeScreen;
