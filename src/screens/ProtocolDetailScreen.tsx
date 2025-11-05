import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { toggleBookmark, addTimeSpent } from '../redux/slices/userProgressSlice';
import { URGENCY_COLORS, URGENCY_LABELS } from '../constants/protocols';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ProtocolDetail'>;
type RouteParams = RouteProp<RootStackParamList, 'ProtocolDetail'>;

export default function ProtocolDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const dispatch = useAppDispatch();
  const { protocolId } = route.params;

  const protocol = useAppSelector((state) =>
    state.protocols.protocols.find((p) => p.id === protocolId)
  );
  const userProgress = useAppSelector((state) => state.userProgress.progress[protocolId]);
  const isBookmarked = useAppSelector((state) =>
    state.userProgress.bookmarks.includes(protocolId)
  );

  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      dispatch(addTimeSpent({ protocolId, seconds: timeSpent }));
    };
  }, [protocolId]);

  if (!protocol) {
    return (
      <View style={styles.container}>
        <Text>Protocol not found</Text>
      </View>
    );
  }

  const urgencyColor = URGENCY_COLORS[protocol.urgencyLevel];

  const handleBookmark = () => {
    dispatch(toggleBookmark(protocolId));
  };

  const handleWatchVideo = () => {
    navigation.navigate('VideoPlayer', { protocolId });
  };

  const handleTakeQuiz = () => {
    navigation.navigate('Quiz', { protocolId });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: urgencyColor }]}>
        <View style={styles.headerTop}>
          <Chip style={styles.urgencyChip} textStyle={styles.chipText}>
            {URGENCY_LABELS[protocol.urgencyLevel]}
          </Chip>
          <TouchableOpacity onPress={handleBookmark}>
            <MaterialCommunityIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {protocol.title}
        </Text>
        <Text variant="bodyMedium" style={styles.headerDescription}>
          {protocol.description}
        </Text>
      </View>

      {/* Triage Assessment */}
      <Card style={styles.card}>
        <Card.Title
          title="Triage Assessment"
          titleStyle={styles.sectionTitle}
          left={(props) => (
            <MaterialCommunityIcons name="clipboard-check" size={24} color={urgencyColor} />
          )}
        />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.triageText}>
            {protocol.triageAssessment}
          </Text>
        </Card.Content>
      </Card>

      {/* Step-by-Step Protocol */}
      <Card style={styles.card}>
        <Card.Title title="Step-by-Step Protocol" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {protocol.steps.map((step) => (
            <View key={step.step} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: urgencyColor }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text variant="titleMedium" style={styles.stepAction}>
                    {step.action}
                  </Text>
                  {step.duration && (
                    <Chip icon="timer" style={styles.durationChip} compact>
                      {step.duration}
                    </Chip>
                  )}
                </View>
              </View>
              {step.details && (
                <Text variant="bodyMedium" style={styles.stepDetails}>
                  {step.details}
                </Text>
              )}
              {step.step < protocol.steps.length && <Divider style={styles.stepDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Contraindications */}
      <Card style={[styles.card, styles.warningCard]}>
        <Card.Title
          title="⚠️ DO NOT (Contraindications)"
          titleStyle={[styles.sectionTitle, styles.warningTitle]}
        />
        <Card.Content>
          {protocol.contraindications.map((item, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bullet}>❌</Text>
              <Text variant="bodyMedium" style={styles.bulletText}>
                {item}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Required Materials */}
      <Card style={styles.card}>
        <Card.Title
          title="Required Materials"
          titleStyle={styles.sectionTitle}
          left={(props) => <MaterialCommunityIcons name="medical-bag" size={24} color="#666" />}
        />
        <Card.Content>
          {protocol.materialsRequired.map((material, index) => (
            <View key={index} style={styles.materialItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.materialText}>
                {material.name} ({material.quantity} {material.unit || 'pieces'})
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Warning Signs */}
      <Card style={styles.card}>
        <Card.Title title="⚠️ Warning Signs" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {protocol.warningSigns.map((sign, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bullet}>⚠️</Text>
              <Text variant="bodyMedium" style={styles.bulletText}>
                {sign}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Evacuation Trigger */}
      <Card style={[styles.card, styles.evacuationCard]}>
        <Card.Title title="🚨 Evacuation Trigger" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.evacuationText}>
            {protocol.evacuationTrigger}
          </Text>
        </Card.Content>
      </Card>

      {/* Myths vs Facts */}
      <Card style={styles.card}>
        <Card.Title title="💡 Common Myths" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {protocol.myths.map((item, index) => (
            <View key={index} style={styles.mythContainer}>
              <View style={styles.mythHeader}>
                <Text style={styles.mythLabel}>MYTH:</Text>
                <Text variant="bodyMedium" style={styles.mythText}>
                  {item.myth}
                </Text>
              </View>
              <View style={styles.factHeader}>
                <Text style={styles.factLabel}>FACT:</Text>
                <Text variant="bodyMedium" style={styles.factText}>
                  {item.fact}
                </Text>
              </View>
              {index < protocol.myths.length - 1 && <Divider style={styles.mythDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {protocol.videoMetadata && (
          <Button
            mode="contained"
            icon="play-circle"
            onPress={handleWatchVideo}
            style={styles.button}
          >
            Watch Video Demo
          </Button>
        )}
        <Button
          mode="contained"
          icon="help-circle"
          onPress={handleTakeQuiz}
          style={[styles.button, styles.quizButton]}
        >
          Take Knowledge Quiz
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyChip: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  chipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  evacuationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningTitle: {
    color: '#D32F2F',
  },
  triageText: {
    lineHeight: 24,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepAction: {
    fontWeight: '600',
    marginBottom: 4,
  },
  durationChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  stepDetails: {
    marginLeft: 48,
    color: '#666',
    lineHeight: 20,
  },
  stepDivider: {
    marginTop: 16,
    marginLeft: 48,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialText: {
    marginLeft: 8,
  },
  evacuationText: {
    lineHeight: 24,
    fontWeight: '500',
    color: '#D32F2F',
  },
  mythContainer: {
    marginBottom: 16,
  },
  mythHeader: {
    marginBottom: 8,
  },
  mythLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 4,
  },
  mythText: {
    fontStyle: 'italic',
    color: '#666',
  },
  factHeader: {
    marginTop: 4,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  factText: {
    color: '#333',
  },
  mythDivider: {
    marginTop: 12,
  },
  actionButtons: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
  quizButton: {
    backgroundColor: '#2196F3',
  },
  bottomPadding: {
    height: 32,
  },
});
