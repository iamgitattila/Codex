// Water Boil Logger - Weekly Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart } from 'react-native-chart-kit';
import { RootStackParamList, WeeklyData } from '../types';
import { COLORS, WEEKLY_GOAL_OZ, DAYS_OF_WEEK } from '../constants';
import { getBoilLogs, getSettings } from '../services/StorageService';
import { calculateWeeklyData, getWeeklyTotal, getGoalsMetCount } from '../utils/calculations';
import StatCard from '../components/StatCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Weekly'>;

const screenWidth = Dimensions.get('window').width;

export default function WeeklyScreen({ navigation }: Props) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({});
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const [goalsMetCount, setGoalsMetCount] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(64);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      const logs = await getBoilLogs();
      const settings = await getSettings();

      const weekly = calculateWeeklyData(logs, settings.daily_goal_oz);
      const total = getWeeklyTotal(weekly);
      const goalsMet = getGoalsMetCount(weekly);

      setWeeklyData(weekly);
      setWeeklyTotal(total);
      setGoalsMetCount(goalsMet);
      setDailyGoal(settings.daily_goal_oz);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    }
  };

  // Prepare chart data
  const dates = Object.keys(weeklyData).sort();
  const chartLabels = dates.map(date => {
    const d = new Date(date);
    return DAYS_OF_WEEK[d.getDay()];
  });

  const chartData = dates.map(date => weeklyData[date]?.total_oz || 0);

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
  };

  const weeklyGoalMet = weeklyTotal >= WEEKLY_GOAL_OZ;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📊 THIS WEEK</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Total"
            value={`${weeklyTotal.toFixed(0)} oz`}
            icon="💧"
            color={COLORS.primary}
          />
          <StatCard
            label="Days on Goal"
            value={`${goalsMetCount} / 7`}
            icon={goalsMetCount >= 5 ? '✓' : '○'}
            color={goalsMetCount >= 5 ? COLORS.success : COLORS.textLight}
          />
          <StatCard
            label="Weekly Goal"
            value={weeklyGoalMet ? '✓' : '✗'}
            icon={weeklyGoalMet ? '🎉' : '⚠️'}
            color={weeklyGoalMet ? COLORS.success : COLORS.warning}
          />
        </View>

        <View style={styles.goalInfoBox}>
          <Text style={styles.goalInfoText}>
            Weekly Goal: {WEEKLY_GOAL_OZ} oz (7 days × {dailyGoal} oz)
          </Text>
          <Text style={styles.goalInfoSubtext}>
            {weeklyGoalMet
              ? 'Great job! You met your weekly hydration goal! 🎉'
              : `${(WEEKLY_GOAL_OZ - weeklyTotal).toFixed(0)} oz remaining to reach goal`}
          </Text>
        </View>

        {/* Chart */}
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Daily Breakdown</Text>
            <BarChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartData,
                  },
                ],
              }}
              width={screenWidth - 32}
              height={280}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" oz"
              fromZero
              showBarTops={false}
              withInnerLines={true}
            />
          </View>
        )}

        {/* Day-by-day breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Day-by-Day Details</Text>
          {dates.map((date, index) => {
            const data = weeklyData[date];
            const dayName = chartLabels[index];
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <View key={date} style={styles.dayRow}>
                <View style={styles.dayLeft}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <Text style={styles.dayDate}>{formattedDate}</Text>
                </View>

                <View style={styles.dayMiddle}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${(data.total_oz / dailyGoal) * 100}%` },
                    ]}
                  />
                </View>

                <View style={styles.dayRight}>
                  <Text style={styles.dayVolume}>{data.total_oz.toFixed(0)} oz</Text>
                  {data.daily_goal_met && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalInfoBox: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  goalInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  goalInfoSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  breakdownSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dayLeft: {
    width: 80,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dayMiddle: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 6,
    minWidth: 4,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
  },
  dayVolume: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.success,
    marginLeft: 8,
  },
});
