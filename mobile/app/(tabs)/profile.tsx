import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import {
  User,
  Mail,
  MapPin,
  LogOut,
  Edit3,
  Settings,
  HelpCircle,
  Shield,
  Eye,
  Crown,
  CheckCircle,
  Calendar,
  Heart,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import { Spinner } from '../../src/components/Spinner';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
// import { ProfileCard } from '../components/ProfileCard'; // To be implemented later

const QuickActionButton: React.FC<{ icon: React.ElementType, label: string, onPress: () => void, color?: string }> =
({ icon: Icon, label, onPress, color = '#ffffff' }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Icon color={color} size={20} style={styles.actionIcon} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'own' | 'preview'>('own');

  if (!user || !user.profile) {
    return (
      <View style={styles.centered}>
        <Spinner />
      </View>
    );
  }

  const { email, profile } = user;
  const { displayName, photos, location, age, isVerified, membershipTier } = profile;
  const profileCompletion = 85; // Mock data

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'own' ? 'preview' : 'own')}>
          <Eye color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: photos[0] }} style={styles.avatar} />
            {isVerified && <CheckCircle color="#3498db" size={24} style={styles.verifiedIcon} />}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName} {membershipTier === 'vip' && <Crown color="#ffd700" size={20}/>}</Text>
            <View style={styles.infoRow}><Mail size={14} color="#b0b0b0"/><Text style={styles.infoText}>{email}</Text></View>
            <View style={styles.infoRow}><MapPin size={14} color="#b0b0b0"/><Text style={styles.infoText}>{location}</Text></View>
            <View style={styles.infoRow}><Calendar size={14} color="#b0b0b0"/><Text style={styles.infoText}>{age} years old</Text></View>
          </View>
          <TouchableOpacity><Edit3 color="white" size={20}/></TouchableOpacity>
        </View>
        <Text style={styles.completionText}>Profile Completion: {profileCompletion}%</Text>
        <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={profileCompletion / 100} color="#FF69B4" />
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <QuickActionButton icon={User} label="Edit Profile" onPress={() => {}} />
        <QuickActionButton icon={Heart} label="BDSM/Kink Quiz" onPress={() => {}} />
        <QuickActionButton icon={Settings} label="Match Preferences" onPress={() => {}} />
        <QuickActionButton icon={BookOpen} label="My Learning Journey" onPress={() => {}} />
        <QuickActionButton icon={Award} label="Achievements" onPress={() => {}} />
        <QuickActionButton icon={TrendingUp} label="Community Stats" onPress={() => {}} />
        <QuickActionButton icon={HelpCircle} label="Help & Support" onPress={() => {}} />
        <QuickActionButton icon={Shield} label="About SPICE" onPress={() => {}} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut color="#e74c3c" size={20} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  card: { backgroundColor: '#2a2a2a', borderRadius: 16, padding: 16, margin: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  verifiedIcon: { position: 'absolute', top: -4, right: -4, backgroundColor: '#1a1a1a', borderRadius: 12 },
  profileInfo: { flex: 1, marginLeft: 16 },
  displayName: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  infoText: { color: '#b0b0b0', fontSize: 14 },
  completionText: { color: '#b0b0b0', marginBottom: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionIcon: { marginRight: 16 },
  actionLabel: { fontSize: 16, color: 'white' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, margin: 16, borderRadius: 100, borderWidth: 2, borderColor: '#e74c3c' },
  logoutText: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});
