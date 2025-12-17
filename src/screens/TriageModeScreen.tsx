import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { incrementViewCount } from '../redux/slices/userProgressSlice';
import { URGENCY_COLORS, UrgencyLevel } from '../constants/protocols';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function TriageModeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const protocols = useAppSelector((state) => state.protocols.protocols);

  // Group protocols by urgency
  const criticalProtocols = protocols.filter((p) => p.urgencyLevel === 'RED');
  const importantProtocols = protocols.filter((p) => p.urgencyLevel === 'YELLOW');
  const referenceProtocols = protocols.filter((p) => p.urgencyLevel === 'GREEN');

  const handleProtocolPress = (protocolId: string) => {
    dispatch(incrementViewCount(protocolId));
    navigation.navigate('ProtocolDetail', { protocolId });
  };

  const renderProtocolButton = (protocolId: string, title: string, urgencyLevel: UrgencyLevel) => {
    const color = URGENCY_COLORS[urgencyLevel];
    const icon =
      urgencyLevel === 'RED'
        ? 'alert-circle'
        : urgencyLevel === 'YELLOW'
        ? 'alert'
        : 'information';

    return (
      <TouchableOpacity
        key={protocolId}
        onPress={() => handleProtocolPress(protocolId)}
        activeOpacity={0.7}
      >
        <Card style={[styles.protocolCard, { borderLeftColor: color, borderLeftWidth: 6 }]}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
            <Text variant="titleMedium" style={styles.protocolTitle}>
              {title}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          🚨 Emergency Triage Mode
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Select the type of emergency
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Critical Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { backgroundColor: URGENCY_COLORS.RED }]}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              CRITICAL - Immediate Action
            </Text>
          </View>
          {criticalProtocols.map((protocol) =>
            renderProtocolButton(protocol.id, protocol.title, protocol.urgencyLevel)
          )}
        </View>

        {/* Important Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { backgroundColor: URGENCY_COLORS.YELLOW }]}>
            <MaterialCommunityIcons name="alert" size={24} color="#fff" />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              IMPORTANT - Urgent Care
            </Text>
          </View>
          {importantProtocols.map((protocol) =>
            renderProtocolButton(protocol.id, protocol.title, protocol.urgencyLevel)
          )}
        </View>

        {/* Reference Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { backgroundColor: URGENCY_COLORS.GREEN }]}>
            <MaterialCommunityIcons name="information" size={24} color="#fff" />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              REFERENCE - Non-Critical
            </Text>
          </View>
          {referenceProtocols.map((protocol) =>
            renderProtocolButton(protocol.id, protocol.title, protocol.urgencyLevel)
          )}
        </View>

        {/* Safety Notice */}
        <Card style={styles.noticeCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.noticeTitle}>
              ⚠️ Important Safety Notice
            </Text>
            <Text variant="bodyMedium" style={styles.noticeText}>
              This app provides educational reference material only. In a true medical emergency:
            </Text>
            <View style={styles.bulletList}>
              <Text variant="bodyMedium" style={styles.bullet}>
                • Call emergency services (911) if available
              </Text>
              <Text variant="bodyMedium" style={styles.bullet}>
                • Seek professional medical care when possible
              </Text>
              <Text variant="bodyMedium" style={styles.bullet}>
                • Use these protocols only when professional help is unavailable
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  protocolCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  protocolTitle: {
    flex: 1,
    fontWeight: '600',
  },
  noticeCard: {
    margin: 16,
    backgroundColor: '#FFF3E0',
    elevation: 2,
  },
  noticeTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#E65100',
  },
  noticeText: {
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletList: {
    marginLeft: 8,
  },
  bullet: {
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});
