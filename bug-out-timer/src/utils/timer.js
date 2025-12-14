/**
 * Bug-Out Timer - Timer Utility
 * Accurate countdown timer using Date.now() for drift prevention
 */

/**
 * Format seconds into MM:SS format
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time (MM:SS)
 */
export const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
};

/**
 * Format seconds into human-readable format
 * Examples: "5 minutes", "1 hour 30 minutes", "45 seconds"
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Human-readable time
 */
export const formatTimeHuman = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);
  }

  return parts.join(' ') || '0 seconds';
};

/**
 * Calculate remaining time based on start time and duration
 * Uses Date.now() for accuracy (no drift)
 * @param {number} startTime - Start timestamp (Date.now())
 * @param {number} duration - Total duration in seconds
 * @param {number} pausedTime - Time paused in milliseconds (optional)
 * @returns {number} Remaining seconds
 */
export const calculateRemainingTime = (startTime, duration, pausedTime = 0) => {
  const elapsed = Date.now() - startTime - pausedTime;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const remaining = duration - elapsedSeconds;

  return Math.max(0, remaining);
};

/**
 * Calculate elapsed time
 * @param {number} startTime - Start timestamp (Date.now())
 * @param {number} pausedTime - Time paused in milliseconds (optional)
 * @returns {number} Elapsed seconds
 */
export const calculateElapsedTime = (startTime, pausedTime = 0) => {
  const elapsed = Date.now() - startTime - pausedTime;
  return Math.floor(elapsed / 1000);
};

/**
 * Calculate drill accuracy
 * @param {number} expectedSeconds - Expected duration
 * @param {number} actualSeconds - Actual duration
 * @returns {Object} Accuracy data
 */
export const calculateAccuracy = (expectedSeconds, actualSeconds) => {
  const difference = actualSeconds - expectedSeconds;
  const absDifference = Math.abs(difference);
  const percentDifference = ((difference / expectedSeconds) * 100).toFixed(1);

  let status = 'exact';
  let message = 'Perfect timing!';

  if (difference > 0) {
    status = 'slower';
    message = `${absDifference} second${absDifference !== 1 ? 's' : ''} slower`;
  } else if (difference < 0) {
    status = 'faster';
    message = `${absDifference} second${absDifference !== 1 ? 's' : ''} faster`;
  }

  return {
    status,
    message,
    difference,
    absDifference,
    percentDifference,
    expectedSeconds,
    actualSeconds
  };
};

/**
 * Get progress percentage
 * @param {number} elapsed - Elapsed seconds
 * @param {number} total - Total duration seconds
 * @returns {number} Progress percentage (0-100)
 */
export const getProgressPercentage = (elapsed, total) => {
  if (total === 0) return 0;
  const percentage = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Check if timer is in critical zone (< 1 minute remaining)
 * @param {number} remainingSeconds - Remaining seconds
 * @returns {boolean} True if critical (< 60 seconds)
 */
export const isCriticalTime = (remainingSeconds) => {
  return remainingSeconds < 60 && remainingSeconds > 0;
};

/**
 * Parse MM:SS format to seconds
 * @param {string} timeString - Time in MM:SS format
 * @returns {number} Total seconds
 */
export const parseTimeToSeconds = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds)) return 0;

  return minutes * 60 + seconds;
};

/**
 * Create a drill data object
 * @param {Object} scenario - Scenario object
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @param {Array} completedTasks - Array of completed task IDs
 * @param {boolean} smsS sent - Whether SMS was sent
 * @returns {Object} Drill data object
 */
export const createDrillData = (
  scenario,
  startTime,
  endTime,
  completedTasks,
  smsSent = false
) => {
  const actualDuration = Math.floor((endTime - startTime) / 1000);
  const incompleteTasks = scenario.tasks
    .filter(task => !completedTasks.includes(task.id))
    .map(task => task.id);

  return {
    drill_id: `drill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scenario_id: scenario.id,
    scenario_name: scenario.name,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    expected_duration_seconds: scenario.duration,
    actual_duration_seconds: actualDuration,
    tasks_completed: completedTasks.length,
    tasks_total: scenario.tasks.length,
    incomplete_tasks: incompleteTasks,
    sms_sent: smsSent,
    sms_recipient_count: 0,
    notes: ''
  };
};

/**
 * Get timestamp formatted for SMS
 * @returns {string} Formatted timestamp
 */
export const getSmsTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get date formatted for drill history
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDrillDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get relative time (e.g., "2 days ago", "Just now")
 * @param {string} isoString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDrillDate(isoString);
  }
};

/**
 * Timer class for managing drill countdown
 */
export class DrillTimer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration; // in seconds
    this.startTime = null;
    this.pauseStartTime = null;
    this.totalPausedTime = 0;
    this.intervalId = null;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.isRunning = false;
    this.isPaused = false;
  }

  start() {
    if (this.isRunning) return;

    this.startTime = Date.now();
    this.isRunning = true;
    this.isPaused = false;

    this.intervalId = setInterval(() => {
      const remaining = calculateRemainingTime(
        this.startTime,
        this.duration,
        this.totalPausedTime
      );

      if (this.onTick) {
        this.onTick(remaining);
      }

      if (remaining === 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 100); // Check every 100ms for accuracy
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    this.pauseStartTime = Date.now();
    clearInterval(this.intervalId);
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;

    const pauseDuration = Date.now() - this.pauseStartTime;
    this.totalPausedTime += pauseDuration;
    this.isPaused = false;
    this.pauseStartTime = null;

    this.intervalId = setInterval(() => {
      const remaining = calculateRemainingTime(
        this.startTime,
        this.duration,
        this.totalPausedTime
      );

      if (this.onTick) {
        this.onTick(remaining);
      }

      if (remaining === 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 100);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getElapsed() {
    if (!this.startTime) return 0;
    return calculateElapsedTime(this.startTime, this.totalPausedTime);
  }

  getRemaining() {
    if (!this.startTime) return this.duration;
    return calculateRemainingTime(
      this.startTime,
      this.duration,
      this.totalPausedTime
    );
  }
}

export default {
  formatTime,
  formatTimeHuman,
  calculateRemainingTime,
  calculateElapsedTime,
  calculateAccuracy,
  getProgressPercentage,
  isCriticalTime,
  parseTimeToSeconds,
  createDrillData,
  getSmsTimestamp,
  formatDrillDate,
  getRelativeTime,
  DrillTimer
};
