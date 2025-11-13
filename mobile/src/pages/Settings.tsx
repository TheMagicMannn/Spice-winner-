import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Key,
  Users,
  Bell,
  Trash2,
  LogOut,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../hooks/useAuth'; // To be implemented

// Mock data
const mockSettings = {
  notificationsMessages: true,
  notificationsLikes: true,
  notificationsNewMatches: false,
  hideAccount: false,
  incognitoMode: true,
};

const SettingRow: React.FC<{ label: string, icon: React.ElementType, onPress?: () => void }> =
 ({ label, icon: Icon, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Icon color="white" size={20} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    <ChevronRight color="#b0b0b0" size={20} />
  </TouchableOpacity>
);

const SettingToggle: React.FC<{ label: string, value: boolean, onValueChange: (value: boolean) => void }> =
 ({ label, value, onValueChange }) => (
  <View style={styles.row}>
    <Bell color="white" size={20} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#767577", true: "#FF69B4" }} thumbColor={"#f4f3f4"}/>
  </View>
);

export const SettingsPage: React.FC = () => {
  const navigation = useNavigation();
  // const { user, logout } = useAuth();
  const user = { email: 'jules@example.com'};
  const [settings, setSettings] = useState(mockSettings);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 24}}/>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.row}>
            <Mail color="white" size={20} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user.email}</Text>
        </View>
        <SettingRow label="Associated Accounts" icon={Users} onPress={() => {}}/>
        <SettingRow label="Password" icon={Key} onPress={() => {}}/>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <SettingToggle label="Messages" value={settings.notificationsMessages} onValueChange={v => setSettings({...settings, notificationsMessages: v})} />
        <SettingToggle label="Likes" value={settings.notificationsLikes} onValueChange={v => setSettings({...settings, notificationsLikes: v})} />
        <SettingToggle label="New Matches" value={settings.notificationsNewMatches} onValueChange={v => setSettings({...settings, notificationsNewMatches: v})} />
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <SettingToggle label="Hide Account" value={settings.hideAccount} onValueChange={v => setSettings({...settings, hideAccount: v})} />
        <SettingToggle label="Incognito Mode" value={settings.incognitoMode} onValueChange={v => setSettings({...settings, incognitoMode: v})} />
      </View>

      {/* Account Actions */}
       <View style={styles.section}>
        <SettingRow label="Logout" icon={LogOut} onPress={() => {}}/>
        <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Trash2 color="#e74c3c" size={20} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, {color: '#e74c3c'}]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,105,180,0.3)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  section: { margin: 16 },
  sectionTitle: { color: '#FF69B4', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  rowIcon: { marginRight: 16 },
  rowLabel: { color: 'white', fontSize: 16, flex: 1 },
  rowValue: { color: '#b0b0b0', fontSize: 14 }
});
