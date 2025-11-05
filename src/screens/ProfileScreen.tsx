import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../redux/store';
import { setPremiumStatus } from '../redux/slices/userSlice';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { isPremium, progress, bookmarks } = useSelector((state: RootState) => state.user);
  const { scenarios } = useSelector((state: RootState) => state.scenarios);

  const totalTips = scenarios.length * 10;
  const viewedTips = progress.filter((p) => p.status === 'viewed').length;
  const attemptedTips = progress.filter((p) => p.status === 'attempted').length;
  const masteredTips = progress.filter((p) => p.status === 'mastered').length;
  const completionRate =
    totalTips > 0 ? Math.round((masteredTips / totalTips) * 100) : 0;

  const handleUpgrade = () => {
    navigation.navigate('Paywall', {});
  };

  // Demo function to toggle premium (remove in production)
  const handleTogglePremium = () => {
    dispatch(setPremiumStatus(!isPremium));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Premium Status Card */}
      <View style={styles.premiumCard}>
        {isPremium ? (
          <>
            <Icon name="crown" size={48} color="#FFD700" />
            <Text style={styles.premiumTitle}>Premium Member</Text>
            <Text style={styles.premiumText}>You have access to all scenarios</Text>
          </>
        ) : (
          <>
            <Icon name="crown-outline" size={48} color="#9E9E9E" />
            <Text style={styles.freeTitle}>Free Account</Text>
            <Text style={styles.freeText}>
              Unlock all 10 scenarios with Premium
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Icon name="rocket-launch" size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Progress</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="eye" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{viewedTips}</Text>
            <Text style={styles.statLabel}>Viewed</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="progress-check" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{attemptedTips}</Text>
            <Text style={styles.statLabel}>Attempted</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{masteredTips}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="bookmark" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Completion</Text>
            <Text style={styles.progressValue}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {masteredTips} of {totalTips} tips mastered
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingRow}>
          <Icon name="bell-outline" size={24} color="#757575" />
          <Text style={styles.settingText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Icon name="download" size={24} color="#757575" />
          <Text style={styles.settingText}>Offline Content</Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleTogglePremium}>
          <Icon name="account-cog" size={24} color="#757575" />
          <Text style={styles.settingText}>
            {isPremium ? 'Switch to Free' : 'Switch to Premium'} (Demo)
          </Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.settingRow}>
          <Icon name="information-outline" size={24} color="#757575" />
          <Text style={styles.settingText}>About SurvivalSkill</Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Icon name="shield-check-outline" size={24} color="#757575" />
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Icon name="file-document-outline" size={24} color="#757575" />
          <Text style={styles.settingText}>Terms of Service</Text>
          <Icon name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SurvivalSkill v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with 🔥 for survivors</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  premiumCard: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 15,
  },
  freeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 15,
  },
  premiumText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  freeText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
    marginBottom: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#C8E6C9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#2E7D32',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 15,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 5,
  },
});

export default ProfileScreen;
