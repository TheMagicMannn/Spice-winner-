import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft,
  ChevronRight,
  Mail,
  Key,
  Users,
  Bell,
  Shield,
  MapPin,
  Ruler,
  AppWindow,
  MessageSquare,
  List,
  Image,
  RotateCcw,
  Info,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  UserX,
  Activity,
  FileText
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { settingsService, UserSettings } from '@/services/settingsService';
import { Spinner } from '@/components/Spinner';
import { PasswordChangeModal } from '@/components/PasswordChangeModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { BlockedUsersModal } from '@/components/BlockedUsersModal';
import { PrivatePhotosModal } from '@/components/PrivatePhotosModal';
import { FeedbackModal } from '@/components/FeedbackModal';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isBlockedUsersModalOpen, setIsBlockedUsersModalOpen] = useState(false);
  const [isPrivatePhotosModalOpen, setIsPrivatePhotosModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLocationDisplayModalOpen, setIsLocationDisplayModalOpen] = useState(false);
  const [isMeasurementSystemModalOpen, setIsMeasurementSystemModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userSettings = await settingsService.getUserSettings(user.id);
      setSettings(userSettings);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!user || !settings) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedSettings = await settingsService.updateSettings(user.id, {
        [key]: value
      });
      setSettings(updatedSettings);
      setSuccessMessage('Setting updated successfully');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      console.error('Error updating setting:', err);
      setError('Failed to update setting');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <Spinner />
      </SpiceBackground>
    );
  }

  if (!user || !settings) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p>Unable to load settings</p>
          <Button onClick={() => navigate('/profile')} className="mt-4">
            Back to Profile
          </Button>
        </div>
      </SpiceBackground>
    );
  }

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={`${spiceTheme.components.header} sticky top-0 z-10 backdrop-blur-xl bg-black/60`}>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="mr-3 text-white hover:bg-pink-500/10"
            data-testid="back-to-profile-button"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className={`text-2xl ${spiceTheme.components.text.title}`}>Settings</h1>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6">
        
        {/* Account Info Section */}
        <div>
          <h2 className="text-red-400 font-bold text-lg mb-4">Account Info</h2>
          
          <div className="space-y-1">
            {/* Email Display */}
            <div 
              className="flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors"
              data-testid="account-email-display"
            >
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-white/70" />
                <div>
                  <div className="text-white text-sm font-medium">Email</div>
                  <div className="text-white/60 text-xs">{user.email}</div>
                </div>
              </div>
            </div>

            <Separator className="bg-pink-500/20" />

            {/* Associated Accounts (Placeholder) */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="associated-accounts-button"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Associated Accounts</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>

            <Separator className="bg-pink-500/20" />

            {/* Password */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="change-password-button"
            >
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Password</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
          </div>
        </div>

        {/* Push Notifications Section */}
        <div>
          <h2 className="text-red-400 font-bold text-lg mb-4">Push Notifications</h2>
          
          <div className="space-y-1">
            <SettingToggle
              label="Messages"
              checked={settings.notificationsMessages}
              onChange={(checked) => updateSetting('notificationsMessages', checked)}
              disabled={isSaving}
              dataTestId="notification-messages-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Priority Messages"
              checked={settings.notificationsPriorityMessages}
              onChange={(checked) => updateSetting('notificationsPriorityMessages', checked)}
              disabled={isSaving}
              dataTestId="notification-priority-messages-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Likes"
              checked={settings.notificationsLikes}
              onChange={(checked) => updateSetting('notificationsLikes', checked)}
              disabled={isSaving}
              dataTestId="notification-likes-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="New Matches"
              checked={settings.notificationsNewMatches}
              onChange={(checked) => updateSetting('notificationsNewMatches', checked)}
              disabled={isSaving}
              dataTestId="notification-new-matches-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Email Notifications"
              checked={settings.notificationsEmail}
              onChange={(checked) => updateSetting('notificationsEmail', checked)}
              disabled={isSaving}
              dataTestId="notification-email-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Activity Notifications"
              checked={settings.notificationsActivity}
              onChange={(checked) => updateSetting('notificationsActivity', checked)}
              disabled={isSaving}
              dataTestId="notification-activity-toggle"
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div>
          <h2 className="text-red-400 font-bold text-lg mb-4">Privacy</h2>
          
          <div className="space-y-1">
            <SettingToggle
              label="Hide Account"
              description="Turning it on means you are hidden from Discovery, but people you liked may still see and match with you."
              checked={settings.hideAccount}
              onChange={(checked) => updateSetting('hideAccount', checked)}
              disabled={isSaving}
              dataTestId="privacy-hide-account-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Incognito Mode"
              description="Enable Incognito Mode to browse privately. Only people you've liked can see you."
              checked={settings.incognitoMode}
              onChange={(checked) => updateSetting('incognitoMode', checked)}
              disabled={isSaving}
              dataTestId="privacy-incognito-mode-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Touch/Face ID Protection"
              description="Coming soon"
              checked={settings.touchFaceIdProtection}
              onChange={(checked) => updateSetting('touchFaceIdProtection', checked)}
              disabled={true}
              dataTestId="privacy-biometric-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <SettingToggle
              label="Don't Show My Distance"
              checked={!settings.showDistance}
              onChange={(checked) => updateSetting('showDistance', !checked)}
              disabled={isSaving}
              dataTestId="privacy-hide-distance-toggle"
            />
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => setIsBlockedUsersModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="block-contacts-button"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Block Contacts</div>
                <div className="text-white/60 text-xs mt-1">
                  Select people from your contact list that you don't want to see or be seen by on SPICE.
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 ml-2" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="activity-settings-button"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Activity Settings</div>
                <div className="text-white/60 text-xs mt-1">
                  Your updated profile details will show up in Activity, which only your matches can see.
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 ml-2" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="privacy-preferences-button"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Privacy Preferences</div>
                <div className="text-white/60 text-xs mt-1">
                  We use this to comply with GDPR and CCPA.
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 ml-2" />
            </button>
          </div>
        </div>

        {/* Others Section */}
        <div>
          <h2 className="text-red-400 font-bold text-lg mb-4">Others</h2>
          
          <div className="space-y-1">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="location-distance-button"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Show My Location with</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">{settings.locationDistance}</span>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="measurement-system-button"
            >
              <div className="flex items-center space-x-3">
                <Ruler className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">System of Measurement</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">{settings.measurementSystem}</span>
                <ChevronRight className="h-5 w-5 text-white/40" />
              </div>
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="app-icon-button"
            >
              <div className="flex items-center space-x-3">
                <AppWindow className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">App Icon</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="send-feedback-button"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Send Feedback</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => setIsBlockedUsersModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="block-list-button"
            >
              <div className="flex items-center space-x-3">
                <UserX className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Block List</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => setIsPrivatePhotosModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="private-content-button"
            >
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Private Content Sharing List</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="restore-purchases-button"
            >
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Restore Purchases</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => navigate('/about-spice')}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="about-spice-button"
            >
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">About SPICE</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors text-left"
              data-testid="logout-button"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-white/70" />
                <span className="text-white text-sm">Logout</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </button>
            <Separator className="bg-pink-500/20" />
            
            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 rounded-lg transition-colors text-left"
              data-testid="delete-account-button"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Delete Account</span>
              </div>
              <ChevronRight className="h-5 w-5 text-red-400/40" />
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center text-white/40 text-sm py-4">
          SPICE v1.0.0
        </div>
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />

      <BlockedUsersModal
        isOpen={isBlockedUsersModalOpen}
        onClose={() => setIsBlockedUsersModalOpen(false)}
      />

      <PrivatePhotosModal
        isOpen={isPrivatePhotosModalOpen}
        onClose={() => setIsPrivatePhotosModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </SpiceBackground>
  );
};

// Setting Toggle Component
interface SettingToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  dataTestId?: string;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  dataTestId
}) => {
  return (
    <div 
      className="flex items-center justify-between p-4 hover:bg-pink-500/5 rounded-lg transition-colors"
      data-testid={dataTestId}
    >
      <div className="flex-1 mr-4">
        <div className="text-white text-sm font-medium">{label}</div>
        {description && (
          <div className="text-white/60 text-xs mt-1">{description}</div>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-pink-500"
      />
    </div>
  );
};

export default SettingsPage;
