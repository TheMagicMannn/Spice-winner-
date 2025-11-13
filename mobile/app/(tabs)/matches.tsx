import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ProfileCard } from '../../src/components/ProfileCard';
import { Spinner } from '../../src/components/Spinner';
import { useAuth } from '../../src/hooks/useAuth';
import { MatchingService } from '../../src/services/matchingService';
import { Profile } from '../../src/types';

const Tab = createMaterialTopTabNavigator();

const MatchList: React.FC<{ fetchMatches: (userId: string) => Promise<Profile[]> }> = ({ fetchMatches }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches(user.id).then(data => {
        setMatches(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <Spinner />;
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


const MutualMatchesScreen = () => <MatchList fetchMatches={MatchingService.getMutualMatches} />;
const WhoILikeScreen = () => <MatchList fetchMatches={MatchingService.getLikedProfiles} />;
const WhoLikesMeScreen = () => <MatchList fetchMatches={MatchingService.getProfilesWhoLikeMe} />;

export default function MatchesPage() {
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
