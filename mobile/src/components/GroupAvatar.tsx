import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface Participant {
  id: string;
  name: string;
  photo?: string;
}

interface GroupAvatarProps {
  participants: Participant[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

const sizeConfig = {
  sm: { avatarSize: 24, offset: -8 },
  md: { avatarSize: 32, offset: -12 },
  lg: { avatarSize: 40, offset: -16 },
};

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  participants,
  size = 'md',
  maxDisplay = 3,
}) => {
  const config = sizeConfig[size];
  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  if (participants.length === 0) {
    return (
      <View style={[styles.avatar, { width: config.avatarSize, height: config.avatarSize, backgroundColor: '#c0c0c0' }]}>
        <Text style={styles.fallbackText}>G</Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {displayParticipants.map((participant, index) => (
        <Image
          key={participant.id}
          source={{ uri: participant.photo || 'https://via.placeholder.com/150' }}
          style={[
            styles.avatar,
            {
              width: config.avatarSize,
              height: config.avatarSize,
              marginLeft: index > 0 ? config.offset : 0,
              zIndex: displayParticipants.length - index,
            },
          ]}
        />
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.avatar,
            styles.remainingCount,
            {
              width: config.avatarSize,
              height: config.avatarSize,
              marginLeft: config.offset,
              zIndex: 0,
            },
          ]}
        >
          <Text style={styles.remainingText}>+{remainingCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#333333',
    fontWeight: 'bold',
  },
  remainingCount: {
    backgroundColor: '#a0a0a0',
  },
  remainingText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
