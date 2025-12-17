import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Chip, Button, TextInput, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { addInventoryItem, updateInventoryQuantity } from '../redux/slices/kitInventorySlice';

export default function KitTrackerScreen() {
  const dispatch = useAppDispatch();
  const scenarios = useAppSelector((state) => state.kitInventory.scenarios);
  const inventory = useAppSelector((state) => state.kitInventory.inventory);
  const protocols = useAppSelector((state) => state.protocols.protocols);

  const [selectedScenario, setSelectedScenario] = useState(scenarios[0].id);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('0');

  const currentScenario = scenarios.find((s) => s.id === selectedScenario);
  const scenarioProtocols = protocols.filter((p) =>
    currentScenario?.protocolIds.includes(p.id)
  );

  // Collect all required materials for selected scenario
  const requiredMaterials = scenarioProtocols.reduce((acc, protocol) => {
    protocol.materialsRequired.forEach((material) => {
      const existing = acc.find((m) => m.name === material.name);
      if (existing) {
        existing.quantity += material.quantity;
      } else {
        acc.push({ ...material });
      }
    });
    return acc;
  }, [] as Array<{ name: string; quantity: number; unit?: string; estimatedCost?: number }>);

  // Calculate completion percentage
  const ownedMaterials = inventory.filter((item) =>
    requiredMaterials.some((rm) => rm.name === item.materialName)
  );
  const completionPercentage =
    requiredMaterials.length > 0
      ? (ownedMaterials.filter((item) => item.quantityOwned >= item.quantityNeeded).length /
          requiredMaterials.length) *
        100
      : 0;

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const quantity = parseInt(newItemQuantity) || 0;
      dispatch(
        addInventoryItem({
          id: `${Date.now()}_${newItemName}`,
          materialId: newItemName.toLowerCase().replace(/\s+/g, '_'),
          materialName: newItemName,
          quantityOwned: quantity,
          quantityNeeded: quantity,
          dateAcquired: new Date().toISOString(),
        })
      );
      setNewItemName('');
      setNewItemQuantity('0');
      setShowAddItem(false);
    }
  };

  const getMaterialStatus = (materialName: string, requiredQty: number) => {
    const owned = inventory.find((item) => item.materialName === materialName);
    const ownedQty = owned?.quantityOwned || 0;

    if (ownedQty >= requiredQty) {
      return { icon: 'check-circle', color: '#4CAF50', status: 'Complete' };
    } else if (ownedQty > 0) {
      return { icon: 'clock-outline', color: '#FF9800', status: 'Partial' };
    } else {
      return { icon: 'close-circle', color: '#F44336', status: 'Needed' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Medical Kit Tracker
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Track your emergency medical supplies
        </Text>
      </View>

      {/* Scenario Selector */}
      <ScrollView horizontal style={styles.scenarioSelector} showsHorizontalScrollIndicator={false}>
        {scenarios.map((scenario) => (
          <Chip
            key={scenario.id}
            selected={selectedScenario === scenario.id}
            onPress={() => setSelectedScenario(scenario.id)}
            style={styles.scenarioChip}
          >
            {scenario.kitName}
          </Chip>
        ))}
      </ScrollView>

      {/* Completion Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text variant="titleLarge" style={styles.statusTitle}>
              {currentScenario?.kitName}
            </Text>
            <Text variant="headlineMedium" style={styles.percentage}>
              {completionPercentage.toFixed(0)}%
            </Text>
          </View>
          <ProgressBar
            progress={completionPercentage / 100}
            style={styles.progressBar}
            color="#4CAF50"
          />
          <Text variant="bodySmall" style={styles.statusText}>
            {ownedMaterials.filter((i) => i.quantityOwned >= i.quantityNeeded).length} of{' '}
            {requiredMaterials.length} items acquired
          </Text>
        </Card.Content>
      </Card>

      {/* Materials List */}
      <ScrollView style={styles.materialsList}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Required Materials
          </Text>
          <Button icon="plus" onPress={() => setShowAddItem(true)}>
            Add Custom
          </Button>
        </View>

        {requiredMaterials.map((material, index) => {
          const status = getMaterialStatus(material.name, material.quantity);
          const owned = inventory.find((item) => item.materialName === material.name);

          return (
            <Card key={index} style={styles.materialCard}>
              <Card.Content>
                <View style={styles.materialHeader}>
                  <MaterialCommunityIcons name={status.icon} size={24} color={status.color} />
                  <View style={styles.materialInfo}>
                    <Text variant="titleMedium">{material.name}</Text>
                    <Text variant="bodySmall" style={styles.materialMeta}>
                      Need: {material.quantity} {material.unit || 'pieces'}
                      {material.estimatedCost && ` • ~$${material.estimatedCost}`}
                    </Text>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: status.color }]}
                    textStyle={styles.statusChipText}
                  >
                    {status.status}
                  </Chip>
                </View>

                {owned && (
                  <View style={styles.quantitySection}>
                    <Text variant="bodyMedium">
                      You have: {owned.quantityOwned} / {material.quantity}
                    </Text>
                    <ProgressBar
                      progress={Math.min(owned.quantityOwned / material.quantity, 1)}
                      style={styles.itemProgress}
                      color={status.color}
                    />
                  </View>
                )}

                {!owned && (
                  <Button
                    mode="outlined"
                    icon="cart"
                    onPress={() =>
                      dispatch(
                        addInventoryItem({
                          id: `${Date.now()}_${material.name}`,
                          materialId: material.name.toLowerCase().replace(/\s+/g, '_'),
                          materialName: material.name,
                          quantityOwned: 0,
                          quantityNeeded: material.quantity,
                        })
                      )
                    }
                    style={styles.addButton}
                  >
                    Add to Inventory
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        })}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Custom Item Modal */}
      <Portal>
        <Modal
          visible={showAddItem}
          onDismiss={() => setShowAddItem(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add Custom Item
          </Text>
          <TextInput
            label="Item Name"
            value={newItemName}
            onChangeText={setNewItemName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Quantity"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.modalButtons}>
            <Button onPress={() => setShowAddItem(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddItem}>
              Add Item
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
  },
  scenarioSelector: {
    padding: 16,
    maxHeight: 60,
  },
  scenarioChip: {
    marginRight: 8,
  },
  statusCard: {
    margin: 16,
    marginTop: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    flex: 1,
    fontWeight: '600',
  },
  percentage: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    color: '#666',
  },
  materialsList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  materialCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  materialMeta: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 11,
  },
  quantitySection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  itemProgress: {
    marginTop: 8,
    height: 6,
  },
  addButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});
