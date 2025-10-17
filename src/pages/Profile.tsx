import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, MapPin, LogOut, Edit3, Settings, HelpCircle, Shield } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user || !user.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const { email, profile } = user;
  const { displayName, photos, bio, age, location } = profile;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-white/70 text-sm">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card className="bg-black/50 border-pink-500/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photos?.[0]} />
                <AvatarFallback className="bg-pink-500/20 text-pink-400 text-xl">
                  {displayName?.[0] || email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  {displayName || 'Complete your profile'}
                </h2>
                <div className="text-white/70 text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{email}</span>
                  </div>
                  {location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                data-testid="button-edit-profile"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {bio && (
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white">About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">{bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-black/50 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-pink-500/10"
            >
              <User className="h-4 w-4 mr-3" />
              Edit Profile
            </Button>
            <Separator className="bg-pink-500/30" />
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-pink-500/10"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            <Separator className="bg-pink-500/30" />
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-pink-500/10"
            >
              <Shield className="h-4 w-4 mr-3" />
              Privacy & Safety
            </Button>
            <Separator className="bg-pink-500/30" />
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-pink-500/10"
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & Support
            </Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
