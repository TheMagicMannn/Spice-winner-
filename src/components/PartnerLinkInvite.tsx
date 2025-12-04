// Partner Link Invite Component
import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { PartnerLink, Visibility } from '../types/profile';
import { partnerLinkService } from '../services/partnerLinkService';

interface PartnerLinkInviteProps {
  onInviteSent: (link: PartnerLink) => void;
  onSkip: () => void;
}

const RELATIONSHIP_TYPES = ['primary', 'secondary', 'anchor', 'casual'];
const VISIBILITY_OPTIONS: Visibility[] = ['public', 'matches_only', 'private'];

export const PartnerLinkInvite: React.FC<PartnerLinkInviteProps> = ({ onInviteSent, onSkip }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [relationshipType, setRelationshipType] = useState('primary');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = async () => {
    if (!emailOrUsername.trim()) {
      setError('Please enter an email or username');
      return;
    }

    setSearching(true);
    setError(null);

    const result = await partnerLinkService.searchUser(emailOrUsername);

    setSearching(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!result.found || !result.user) {
      setError('No user found with that email or username');
      return;
    }

    setSearchResults(result.user);
  };

  const handleSendInvite = async () => {
    if (!selectedPartner) {
      setError('Please select a partner to invite');
      return;
    }

    setSending(true);
    setError(null);

    const result = await partnerLinkService.sendInvite(
      selectedPartner.id,
      relationshipType,
      visibility
    );

    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.link) {
      setSuccess(true);
      setTimeout(() => {
        onInviteSent(result.link!);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Link a Partner</h3>
        <p className="text-text-secondary text-sm">
          Invite an existing SPICE user to link as your partner
        </p>
      </div>

      {!success ? (
        <>
          {/* Search Section */}
          <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
            <div className="space-y-2">
              <Label>Partner's Email or Username</Label>
              <Input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter email or username"
                disabled={searching || selectedPartner}
              />
            </div>

            {!selectedPartner && (
              <Button
                onClick={handleSearch}
                isLoading={searching}
                variant="outline"
                className="w-full"
              >
                {searching ? 'Searching...' : 'Search User'}
              </Button>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedPartner && (
            <div className="space-y-2">
              <Label>Select Partner</Label>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedPartner(user)}
                  className="w-full p-3 bg-black/50 border border-brand-primary/50 rounded-lg text-left hover:bg-brand-primary/20 transition-colors"
                >
                  <div className="font-semibold text-white">{user.displayName}</div>
                  {user.email && (
                    <div className="text-sm text-text-secondary">{user.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Selected Partner & Relationship Details */}
          {selectedPartner && (
            <div className="space-y-4 p-4 border border-brand-primary rounded-lg bg-brand-primary/10">
              <div>
                <Label>Selected Partner</Label>
                <div className="mt-1 p-2 bg-black/50 rounded">
                  <div className="font-semibold text-white">{selectedPartner.displayName}</div>
                  {selectedPartner.email && (
                    <div className="text-sm text-text-secondary">{selectedPartner.email}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPartner(null);
                    setSearchResults([]);
                  }}
                  className="text-sm text-brand-secondary hover:underline mt-2"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Link Visibility</Label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
                >
                  <option value="public">Public - Visible to everyone</option>
                  <option value="matches_only">Matches Only - Only your matches can see</option>
                  <option value="private">Private - Only you can see</option>
                </select>
              </div>

              <Button
                onClick={handleSendInvite}
                isLoading={sending}
                className="w-full"
              >
                {sending ? 'Sending Invite...' : 'Send Partner Invite'}
              </Button>
            </div>
          )}

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-text-secondary hover:text-white text-sm transition-colors"
            >
              Skip for now (you can add partners later)
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-green-400 mb-2">Invite Sent!</h3>
          <p className="text-text-secondary">
            Your partner will receive a notification to accept the link.
          </p>
        </div>
      )}
    </div>
  );
};
