import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ProfileCard } from '../components/ProfileCard';
import { Spinner } from '../components/Spinner';

const Tab = createMaterialTopTabNavigator();

const mockMatches = {
  mutual: [
    { id: '1', displayName: 'Alice', age: 28, photos: ['https://randomuser.me/api/portraits/women/1.jpg'], bio: 'Frontend Developer', location: 'New York' },
    { id: '4', displayName: 'Dana', age: 30, photos: ['https://randomuser.me/api/portraits/women/4.jpg'], bio: 'Project Manager', location: 'Chicago' },
  ],
  whoILike: [
    { id: '2', displayName: 'Bob', age: 32, photos: ['https://randomuser.me/api/portraits/men/2.jpg'], bio: 'Backend Developer', location: 'San Francisco' },
  ],
  whoLikesMe: [
    { id: '3', displayName: 'Charlie', age: 25, photos: ['https://randomuser.me/api/portraits/men/3.jpg'], bio: 'Designer', location: 'Austin' },
  ],
};

const MatchList: React.FC<{ matches: any[] }> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profiles to show here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      {matches.map(profile => (
        <TouchableOpacity key={profile.id} style={styles.cardWrapper}>
          <ProfileCard profile={profile} variant="compact" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};


const MutualMatchesScreen = () => <MatchList matches={mockMatches.mutual} />;
const WhoILikeScreen = () => <MatchList matches={mockMatches.whoILike} />;
const WhoLikesMeScreen = () => <MatchList matches={mockMatches.whoLikesMe} />;

export const MatchesPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Matches</Text>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF69B4',
          tabBarInactiveTintColor: '#b0b0b0',
          tabBarStyle: { backgroundColor: '#2a2a2a' },
          tabBarIndicatorStyle: { backgroundColor: '#FF69B4' },
        }}
      >
        <Tab.Screen name="My Matches" component={MutualMatchesScreen} />
        <Tab.Screen name="Who I Like" component={WhoILikeScreen} />
        <Tab.Screen name="Who Likes Me" component={WhoLikesMeScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', padding: 16 },
  listContainer: { flex: 1, backgroundColor: '#1a1a1a' },
  cardWrapper: { marginHorizontal: 16, marginVertical: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  emptyText: { color: '#b0b0b0', fontSize: 16 },
});
