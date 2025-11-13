import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ProfileCard } from '../components/ProfileCard';
import { Spinner } from '../components/Spinner';
// import { useAuth } from '../hooks/useAuth';
// import { MatchingService } from '../services/matchingService';

const { width: screenWidth } = Dimensions.get('window');
const swipeThreshold = screenWidth * 0.4;

const mockProfiles = [
  { id: '1', displayName: 'Alice', age: 28, photos: ['https://randomuser.me/api/portraits/women/1.jpg'], bio: 'Frontend Developer', location: 'New York', interests: ['Coding', 'Hiking'] },
  { id: '2', displayName: 'Bob', age: 32, photos: ['https://randomuser.me/api/portraits/men/2.jpg'], bio: 'Backend Developer', location: 'San Francisco', interests: ['Gaming', 'Cooking'] },
  { id: '3', displayName: 'Charlie', age: 25, photos: ['https://randomuser.me/api/portraits/men/3.jpg'], bio: 'Designer', location: 'Austin', interests: ['Art', 'Music'] },
];

export const BrowsePage: React.FC = () => {
  // const { user } = useAuth();
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const handleSwipe = (direction: 'like' | 'pass') => {
    console.log(`Swiped ${direction}`);
    setCurrentIndex(prev => prev + 1);
    translateX.value = 0;
    rotate.value = 0;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    rotate.value = (event.nativeEvent.translationX / screenWidth) * 20;
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (Math.abs(event.nativeEvent.translationX) > swipeThreshold) {
        const direction = event.nativeEvent.translationX > 0 ? 'like' : 'pass';
        translateX.value = withSpring(screenWidth * (direction === 'like' ? 1.5 : -1.5));
        runOnJS(handleSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    }
  };

  if (loading) return <View style={styles.centered}><Spinner /></View>;

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.endOfProfilesText}>No More Profiles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <ProfileCard profile={profiles[currentIndex]} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '90%',
    height: '80%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  endOfProfilesText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
