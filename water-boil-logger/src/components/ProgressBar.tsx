// Water Boil Logger - Progress Bar Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  height = 20,
  showLabel = true,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.progressBarContainer, { height }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${clampedProgress}%`,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.progressLabel}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: COLORS.progressFill,
    borderRadius: 10,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
});
