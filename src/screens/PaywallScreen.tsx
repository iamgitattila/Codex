import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppDispatch } from '../redux/store';
import { setPremiumStatus } from '../redux/slices/userSlice';

const PaywallScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  const handlePurchase = () => {
    // In production, this would integrate with In-App Purchase APIs
    // For MVP demo, we'll just activate premium
    Alert.alert(
      'Purchase Successful!',
      'Welcome to SurvivalSkill Premium! All scenarios are now unlocked.',
      [
        {
          text: 'Get Started',
          onPress: () => {
            dispatch(setPremiumStatus(true));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'No previous purchases found.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="crown" size={80} color="#FFD700" />
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Master all 10 critical survival scenarios
        </Text>
      </View>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>Access all 10 survival scenarios</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>100+ expert-verified survival tips</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>Daily challenges with spaced repetition</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>Offline access - works without internet</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>Progress tracking and analytics</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>Unlimited bookmarks</Text>
        </View>

        <View style={styles.featureRow}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.featureText}>No ads, ever</Text>
        </View>
      </View>

      {/* Pricing Plans */}
      <View style={styles.plansContainer}>
        <Text style={styles.plansTitle}>Choose Your Plan</Text>

        {/* Annual Plan */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'annual' && styles.selectedPlan]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.7}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Annual</Text>
              <Text style={styles.planPrice}>$39.99/year</Text>
            </View>
            {selectedPlan === 'annual' && (
              <Icon name="check-circle" size={28} color="#2E7D32" />
            )}
          </View>

          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>SAVE 33% - Best Value!</Text>
          </View>

          <Text style={styles.planDetail}>Just $3.33/month</Text>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.7}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>$4.99/month</Text>
            </View>
            {selectedPlan === 'monthly' && (
              <Icon name="check-circle" size={28} color="#2E7D32" />
            )}
          </View>

          <Text style={styles.planDetail}>Cancel anytime</Text>
        </TouchableOpacity>
      </View>

      {/* Purchase Button */}
      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>
          Start {selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Plan
        </Text>
        <Text style={styles.purchaseButtonSubtext}>
          {selectedPlan === 'annual' ? '$39.99/year' : '$4.99/month'}
        </Text>
      </TouchableOpacity>

      {/* Restore & Terms */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By purchasing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions auto-renew unless canceled 24 hours before renewal.
        </Text>
      </View>

      {/* Why Premium? */}
      <View style={styles.whyPremiumContainer}>
        <Text style={styles.whyPremiumTitle}>Why Go Premium?</Text>
        <Text style={styles.whyPremiumText}>
          Survival skills require practice and repetition. Our premium content includes
          advanced techniques like navigation without GPS, first aid, edible plant
          identification, and improvised tools—knowledge that could save your life in an
          emergency.
        </Text>
        <Text style={styles.whyPremiumText}>
          With offline access, you'll have these skills available even when internet and
          power grids fail.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 15,
    flex: 1,
  },
  plansContainer: {
    padding: 20,
    marginTop: 10,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedPlan: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
  planDetail: {
    fontSize: 14,
    color: '#757575',
  },
  savingsBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseButtonSubtext: {
    color: '#C8E6C9',
    fontSize: 14,
    marginTop: 5,
  },
  restoreButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  restoreText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  termsText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
  },
  whyPremiumContainer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
  },
  whyPremiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  whyPremiumText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default PaywallScreen;
