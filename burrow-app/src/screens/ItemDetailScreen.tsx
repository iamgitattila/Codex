import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO, differenceInDays } from 'date-fns';

import { fetchAssetById, deleteAsset } from '../store/slices/assetsSlice';
import { RootState, AppDispatch } from '../store';

export default function ItemDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const asset = useSelector((state: RootState) => state.assets.selectedAsset);

  useEffect(() => {
    if (route.params?.assetId) {
      dispatch(fetchAssetById(route.params.assetId));
    }
  }, [route.params]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (asset) {
              await dispatch(deleteAsset(asset.id));
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (asset) {
      navigation.navigate('EditItem', { assetId: asset.id });
    }
  };

  if (!asset) {
    return (
      <View style={styles.container}>
        <Paragraph>Loading...</Paragraph>
      </View>
    );
  }

  const daysUntilExpiration = asset.expirationDate
    ? differenceInDays(parseISO(asset.expirationDate), new Date())
    : null;

  const isBelowPar = asset.quantityPar && asset.quantityOwned < asset.quantityPar;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{asset.name}</Title>
          {asset.description && <Paragraph>{asset.description}</Paragraph>}

          <View style={styles.chips}>
            <Chip icon="tag">{asset.category}</Chip>
            {asset.subcategory && <Chip>{asset.subcategory}</Chip>}
            <Chip
              icon={asset.condition === 'Sealed' ? 'check-circle' : 'alert-circle'}
            >
              {asset.condition}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quantity</Title>
          <View style={styles.quantityRow}>
            <View style={styles.quantityItem}>
              <Paragraph style={styles.label}>Owned</Paragraph>
              <Title>{asset.quantityOwned} {asset.unitType}</Title>
            </View>
            {asset.quantityPar && (
              <View style={styles.quantityItem}>
                <Paragraph style={styles.label}>Par Level</Paragraph>
                <Title>{asset.quantityPar} {asset.unitType}</Title>
              </View>
            )}
          </View>
          {isBelowPar && (
            <Chip icon="arrow-down" style={styles.warningChip}>
              Below Par Level ({asset.quantityPar! - asset.quantityOwned} needed)
            </Chip>
          )}
        </Card.Content>
      </Card>

      {asset.expirationDate && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Expiration</Title>
            <Paragraph>
              {format(parseISO(asset.expirationDate), 'MMM dd, yyyy')}
            </Paragraph>
            {daysUntilExpiration !== null && (
              <Chip
                icon="calendar"
                style={[
                  styles.expirationChip,
                  daysUntilExpiration < 7 && styles.urgentChip,
                  daysUntilExpiration >= 7 && daysUntilExpiration < 30 && styles.warningChip,
                ]}
              >
                {daysUntilExpiration > 0
                  ? `${daysUntilExpiration} days remaining`
                  : `Expired ${Math.abs(daysUntilExpiration)} days ago`}
              </Chip>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Details</Title>
          <Divider style={styles.divider} />
          {asset.costUsd && (
            <>
              <View style={styles.detailRow}>
                <Paragraph style={styles.label}>Cost:</Paragraph>
                <Paragraph>${asset.costUsd.toFixed(2)}</Paragraph>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          {asset.dateAcquired && (
            <>
              <View style={styles.detailRow}>
                <Paragraph style={styles.label}>Acquired:</Paragraph>
                <Paragraph>{format(parseISO(asset.dateAcquired), 'MMM dd, yyyy')}</Paragraph>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          {asset.lastVerified && (
            <>
              <View style={styles.detailRow}>
                <Paragraph style={styles.label}>Last Verified:</Paragraph>
                <Paragraph>{format(parseISO(asset.lastVerified), 'MMM dd, yyyy')}</Paragraph>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          {asset.sourceUrl && (
            <>
              <View style={styles.detailRow}>
                <Paragraph style={styles.label}>Source:</Paragraph>
                <Paragraph>{asset.sourceUrl}</Paragraph>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          {asset.barcodeEan && (
            <>
              <View style={styles.detailRow}>
                <Paragraph style={styles.label}>Barcode:</Paragraph>
                <Paragraph>{asset.barcodeEan}</Paragraph>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
        </Card.Content>
      </Card>

      {asset.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Notes</Title>
            <Paragraph>{asset.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.actionButton}
          icon="delete"
          textColor="#F44336"
        >
          Delete
        </Button>
      </View>
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
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  quantityItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  warningChip: {
    marginTop: 12,
    backgroundColor: '#FFF3E0',
  },
  urgentChip: {
    backgroundColor: '#FFEBEE',
  },
  expirationChip: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
