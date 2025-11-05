import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '../redux/hooks';
import { RootStackParamList } from '../types';

type RouteParams = RouteProp<RootStackParamList, 'VideoPlayer'>;

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const route = useRoute<RouteParams>();
  const { protocolId } = route.params;
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  const protocol = useAppSelector((state) =>
    state.protocols.protocols.find((p) => p.id === protocolId)
  );

  if (!protocol || !protocol.videoMetadata) {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge">Video not available for this protocol</Text>
        <Text variant="bodyMedium" style={styles.comingSoon}>
          Video demonstrations coming soon!
        </Text>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (video.current) {
      if (status?.isLoaded && status.isPlaying) {
        await video.current.pauseAsync();
      } else {
        await video.current.playAsync();
      }
    }
  };

  const handleReplay = async () => {
    if (video.current) {
      await video.current.replayAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {protocol.title}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Video Demonstration
      </Text>

      {/* Placeholder for video - in production, this would load actual video files */}
      <View style={styles.videoPlaceholder}>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          📹 Video Player
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          Duration: {protocol.videoMetadata.duration}
        </Text>
        <Text variant="bodySmall" style={styles.placeholderNote}>
          Note: Video files need to be added to the project
        </Text>
      </View>

      {/*
      Uncomment this when actual video files are available:

      <Video
        ref={video}
        style={styles.video}
        source={{ uri: protocol.videoMetadata.localPath || protocol.videoMetadata.remoteUrl }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={setStatus}
      />
      */}

      <View style={styles.controls}>
        <Button
          mode="contained"
          icon="play"
          onPress={handlePlayPause}
          style={styles.button}
        >
          Play Demo
        </Button>
      </View>

      <View style={styles.info}>
        <Text variant="titleMedium" style={styles.infoTitle}>
          What you'll learn:
        </Text>
        <View style={styles.bulletList}>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Visual demonstration of all {protocol.steps.length} steps
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Proper technique and hand positioning
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Common mistakes to avoid
          </Text>
          <Text variant="bodyMedium" style={styles.bullet}>
            • Equipment usage and alternatives
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  video: {
    width: width - 32,
    height: (width - 32) * (9 / 16), // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: width - 32,
    height: (width - 32) * (9 / 16),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#aaa',
    marginBottom: 16,
  },
  placeholderNote: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  button: {
    minWidth: 120,
  },
  info: {
    marginTop: 32,
    width: '100%',
  },
  infoTitle: {
    color: '#fff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  bulletList: {
    paddingLeft: 8,
  },
  bullet: {
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 22,
  },
  comingSoon: {
    marginTop: 16,
    color: '#666',
  },
});
