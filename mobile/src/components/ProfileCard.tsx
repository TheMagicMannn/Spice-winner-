import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Profile } from '../types'; // Assuming types are moved to a shared location
import {
  Heart,
  MessageSquare,
  MapPin,
  Users,
  Crown,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Eye,
  Search,
  AlertTriangle,
  Zap,
  FileText,
} from 'lucide-react-native';

interface ProfileCardProps {
  profile: Profile;
  onLike?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  variant?: 'full' | 'compact';
}

const theme = {
  colors: {
    gradientStart: '#FF69B4',
    gradientEnd: '#FFC0CB',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    background: '#1A1A1A',
    card: '#2A2A2A',
    verifiedBadge: '#4CAF50',
    premiumBadge: '#FFD700',
    pink: '#FF69B4',
    purple: '#9B59B6',
    blue: '#3498DB',
    green: '#2ECC71',
    yellow: '#F1C40F',
    red: '#E74C3C',
    orange: '#E67E22',
    separator: 'rgba(255, 105, 180, 0.3)',
  },
};

const Badge = ({ children, style, textStyle }: { children: React.ReactNode; style?: any; textStyle?: any }) => (
  <View style={[styles.badge, style]}>
    <Text style={[styles.badgeText, textStyle]}>{children}</Text>
  </View>
);

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onMessage,
  variant = 'full',
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = profile.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const nextPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const getNameDisplay = () => {
    return profile.accountType === 'couple'
      ? `${profile.displayName || 'User'} & ${profile.displayName2 || 'Partner'}`
      : profile.displayName || 'User';
  };

  const renderFullCard = () => (
    <ScrollView style={styles.card}>
      <View style={styles.relative}>
        <Image
          source={{ uri: photos[currentPhotoIndex] || 'https://via.placeholder.com/400' }}
          style={styles.profileImage}
        />
        {hasMultiplePhotos && (
          <>
            <TouchableOpacity onPress={prevPhoto} style={[styles.photoNav, styles.leftNav]}>
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextPhoto} style={[styles.photoNav, styles.rightNav]}>
              <ChevronRight color="white" size={24} />
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.profileName}>{getNameDisplay()}</Text>
        {profile.location && (
          <View style={styles.infoRow}>
            <MapPin color={theme.colors.pink} size={16} />
            <Text style={styles.infoText}>{profile.location}</Text>
          </View>
        )}
        {profile.bio && (
            <View>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bioText}>
                {profile.bio}
              </Text>
            </View>
          )}
        {/* Add other sections here */}
      </View>
       {onMessage && onLike && (
        <View style={styles.actions}>
            <TouchableOpacity onPress={() => onMessage(profile.id!)} style={styles.messageButton}>
                <MessageSquare color="white" size={16} />
                <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onLike(profile.id!)} style={styles.likeButton}>
                <Heart color="white" size={16} />
            </TouchableOpacity>
        </View>
       )}
    </ScrollView>
  );

  const renderCompactCard = () => (
     <View style={[styles.card, styles.compactCard]}>
        <Image
            source={{ uri: photos[0] || 'https://via.placeholder.com/150' }}
            style={styles.compactImage}
        />
        <View style={styles.compactContent}>
            <Text style={styles.compactName}>{getNameDisplay()}</Text>
            <View style={styles.infoRow}>
                <Calendar color={theme.colors.textSecondary} size={12} />
                <Text style={styles.compactInfo}>{profile.age || '?'} yrs</Text>
            </View>
            {profile.location && (
                 <View style={styles.infoRow}>
                    <MapPin color={theme.colors.textSecondary} size={12} />
                    <Text style={styles.compactInfo}>{profile.location}</Text>
                </View>
            )}
        </View>
     </View>
  );

  return variant === 'compact' ? renderCompactCard() : renderFullCard();
};

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: 16, overflow: 'hidden' },
  relative: { position: 'relative' },
  profileImage: { width: '100%', height: 400 },
  photoNav: { position: 'absolute', top: '50%', transform: [{ translateY: -12 }], padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100 },
  leftNav: { left: 8 },
  rightNav: { right: 8 },
  content: { padding: 16 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  infoText: { color: theme.colors.textSecondary, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 },
  bioText: { color: theme.colors.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', padding: 16, gap: 8 },
  messageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.pink, padding: 12, borderRadius: 8, gap: 8 },
  likeButton: { padding: 12, backgroundColor: theme.colors.separator, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: theme.colors.separator },
  badgeText: { color: theme.colors.textPrimary, fontSize: 12 },
  compactCard: {flexDirection: 'row', padding: 8, alignItems: 'center', gap: 8},
  compactImage: {width: 64, height: 64, borderRadius: 8},
  compactContent: {flex: 1},
  compactName: {fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary},
  compactInfo: {color: theme.colors.textSecondary, fontSize: 12}
});

export default ProfileCard;
