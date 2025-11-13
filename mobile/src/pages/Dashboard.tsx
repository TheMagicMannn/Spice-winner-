import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Spinner } from '../components/Spinner';
// import { useAuth } from '../hooks/useAuth'; // To be implemented

// Mock data until useAuth is implemented
const mockUser = {
  email: 'jules@example.com',
  profile: {
    displayName: 'Jules',
    photos: ['https://randomuser.me/api/portraits/women/44.jpg'],
    bio: 'Lover of code, coffee, and adventure. Exploring the world one line of code at a time.',
    age: 30,
    location: 'San Francisco, CA',
    interests: ['React Native', 'Supabase', 'TypeScript', 'Hiking', 'Photography'],
  },
};

export const DashboardPage: React.FC = () => {
  // const { user } = useAuth(); // To be implemented
  const user = mockUser;

  if (!user || !user.profile) {
    return (
      <View style={styles.centered}>
        <Spinner />
      </View>
    );
  }

  const { email, profile } = user;
  const { displayName, photos, bio, age, location, interests = [] } = profile;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {photos && photos.length > 0 ? (
            <Image source={{ uri: photos[0] }} style={styles.avatar} />
          ) : (
            <View style={styles.initialAvatar}>
              <Text style={styles.initialText}>
                {displayName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.displayName}>Welcome, {displayName}!</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.details}>{age ? `${age} yrs` : 'Age N/A'} - {location || 'Location N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bio:</Text>
          <Text style={styles.bio}>{bio || 'You have not set a bio yet.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Interests:</Text>
          <View style={styles.interestsContainer}>
            {interests.length > 0 ? (
              interests.map((interest) => (
                <View key={interest} style={styles.interestBadge}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.details}>No interests added yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FF69B4',
    marginBottom: 16,
  },
  initialAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FF69B4',
    backgroundColor: '#FFC0CB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  email: {
    fontSize: 18,
    color: '#b0b0b0',
    marginTop: 4,
  },
  details: {
    fontSize: 16,
    color: '#b0b0b0',
  },
  section: {
    backgroundColor: '#3a3a3a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.5)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFC0CB',
    marginBottom: 8,
  },
  bio: {
    color: 'white',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestBadge: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  interestText: {
    color: '#FFC0CB',
    fontSize: 14,
    fontWeight: '500',
  },
});
