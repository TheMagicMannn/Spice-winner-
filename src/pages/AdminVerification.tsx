// src/pages/AdminVerification.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Users,
  Calendar,
  Mail,
  ExternalLink,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { verificationService } from '@/services/verificationService';
import { Spinner } from '@/components/Spinner';
import { useNavigate } from 'react-router-dom';

interface VerificationRequestWithProfile {
  id: string;
  user_id: string;
  method: 'selfie' | 'fetlife';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  email: string;
  selfie_photo_url?: string;
  verification_date?: string;
  fetlife_profile_url?: string;
  fetlife_screenshot_url?: string;
  partner2_email?: string;
  partner2_selfie_photo_url?: string;
  partner2_fetlife_profile_url?: string;
  partner2_fetlife_screenshot_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  profiles: {
    display_name?: string;
    display_name2?: string;
    account_type: 'individual' | 'couple';
    photos?: string[];
  };
}

export const AdminVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequestWithProfile[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestWithProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadVerifications();
    }
  }, [isAdmin, filterStatus]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const adminStatus = await verificationService.isAdmin(user.id);
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVerifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = filterStatus === 'pending'
        ? await verificationService.getPendingVerifications()
        : await verificationService.getAllVerifications();
      
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading verifications:', err);
      setError('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSignedUrl = async (path: string | undefined): Promise<string | null> => {
    if (!path) return null;
    
    // If already cached, return it
    if (signedUrls[path]) {
      return signedUrls[path];
    }

    try {
      // Extract path from full URL if needed
      const urlPath = path.includes('verification-uploads') 
        ? path.split('verification-uploads/')[1] 
        : path;
      
      const signedUrl = await verificationService.getVerificationPhotoUrl(urlPath);
      setSignedUrls(prev => ({ ...prev, [path]: signedUrl }));
      return signedUrl;
    } catch (err) {
      console.error('Error loading signed URL:', err);
      return null;
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await verificationService.approveVerification(
        selectedRequest.id,
        user.id,
        adminNotes || undefined
      );
      
      alert('Verification approved successfully!');
      setSelectedRequest(null);
      setAdminNotes('');
      loadVerifications();
    } catch (err: any) {
      console.error('Error approving verification:', err);
      setError('Failed to approve verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user || !rejectionReason) {
      setError('Please provide a rejection reason');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await verificationService.rejectVerification(
        selectedRequest.id,
        user.id,
        rejectionReason,
        adminNotes || undefined
      );
      
      alert('Verification rejected');
      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
      loadVerifications();
    } catch (err: any) {
      console.error('Error rejecting verification:', err);
      setError('Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageInNewTab = async (path: string | undefined) => {
    if (!path) return;
    const url = await loadSignedUrl(path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <Spinner />
      </SpiceBackground>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1 flex items-center`}>
              <Shield className="h-6 w-6 mr-2 text-pink-400" />
              Admin Verification Panel
            </h1>
            <p className={spiceTheme.components.text.subtitle}>Review and manage user verification requests</p>
          </div>
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className={spiceTheme.components.button.secondary}
          >
            Back to Profile
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-xs text-white/60">Pending</div>
            </CardContent>
          </Card>
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {requests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-xs text-white/60">Approved</div>
            </CardContent>
          </Card>
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">
                {requests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-xs text-white/60">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className={spiceTheme.components.card}>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button
                onClick={() => setFilterStatus('pending')}
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                className={filterStatus === 'pending' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-800 border-pink-500/30 text-white'}
              >
                Pending Only
              </Button>
              <Button
                onClick={() => setFilterStatus('all')}
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                className={filterStatus === 'all' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-800 border-pink-500/30 text-white'}
              >
                All Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Request List */}
        {requests.length === 0 ? (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-white/40 mb-3" />
              <p className="text-white/70">No verification requests found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                className={`${spiceTheme.components.card} cursor-pointer hover:border-pink-500/50 transition-colors ${
                  selectedRequest?.id === request.id ? 'border-pink-500' : ''
                }`}
                onClick={() => setSelectedRequest(request)}
                data-testid={`verification-request-${request.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Profile Photo */}
                      <div className="relative">
                        {request.profiles.account_type === 'couple' ? (
                          <Users className="h-12 w-12 text-pink-400" />
                        ) : (
                          <User className="h-12 w-12 text-pink-400" />
                        )}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-semibold">
                            {request.profiles.account_type === 'couple' && request.profiles.display_name2
                              ? `${request.profiles.display_name || 'User'} & ${request.profiles.display_name2}`
                              : request.profiles.display_name || 'User'}
                          </h3>
                          <Badge className={
                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {request.status}
                          </Badge>
                          <Badge className="bg-pink-500/20 text-pink-400">
                            {request.method === 'selfie' ? 'Selfie' : 'FetLife'}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {request.profiles.account_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-white/70 space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            {request.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            Submitted: {new Date(request.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div>
                      {request.status === 'pending' && <Clock className="h-6 w-6 text-yellow-400" />}
                      {request.status === 'approved' && <CheckCircle className="h-6 w-6 text-green-400" />}
                      {request.status === 'rejected' && <XCircle className="h-6 w-6 text-red-400" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedRequest && (
          <Card className={`${spiceTheme.components.card} border-2 border-pink-500`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Verification Details</span>
                <Button
                  onClick={() => setSelectedRequest(null)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="text-white font-medium mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Account Type:</span>
                    <span className="text-white font-medium">{selectedRequest.profiles.account_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Method:</span>
                    <span className="text-white font-medium">{selectedRequest.method === 'selfie' ? 'Selfie Verification' : 'FetLife Verification'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Email:</span>
                    <span className="text-white font-medium">{selectedRequest.email}</span>
                  </div>
                  {selectedRequest.verification_date && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Verification Date:</span>
                      <span className="text-white font-medium">{new Date(selectedRequest.verification_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-pink-500/30" />

              {/* Verification Content */}
              <div>
                <h4 className="text-white font-medium mb-3">
                  {selectedRequest.profiles.display_name || 'Partner 1'} Verification
                </h4>
                
                {selectedRequest.method === 'selfie' && selectedRequest.selfie_photo_url && (
                  <div className="space-y-2">
                    <Button
                      onClick={() => openImageInNewTab(selectedRequest.selfie_photo_url)}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                      data-testid="view-selfie-button"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Selfie Photo
                    </Button>
                  </div>
                )}

                {selectedRequest.method === 'fetlife' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 text-sm">FetLife Profile:</span>
                      <a
                        href={selectedRequest.fetlife_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                      >
                        {selectedRequest.fetlife_profile_url}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                    {selectedRequest.fetlife_screenshot_url && (
                      <Button
                        onClick={() => openImageInNewTab(selectedRequest.fetlife_screenshot_url)}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        data-testid="view-fetlife-screenshot-button"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View FetLife Screenshot
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Partner 2 for Couples */}
              {selectedRequest.profiles.account_type === 'couple' && selectedRequest.partner2_email && (
                <>
                  <Separator className="bg-pink-500/30" />
                  <div>
                    <h4 className="text-white font-medium mb-3">
                      {selectedRequest.profiles.display_name2 || 'Partner 2'} Verification
                    </h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white ml-2">{selectedRequest.partner2_email}</span>
                      </div>

                      {selectedRequest.method === 'selfie' && selectedRequest.partner2_selfie_photo_url && (
                        <Button
                          onClick={() => openImageInNewTab(selectedRequest.partner2_selfie_photo_url)}
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                          data-testid="view-partner2-selfie-button"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Partner 2 Selfie Photo
                        </Button>
                      )}

                      {selectedRequest.method === 'fetlife' && (
                        <>
                          <div>
                            <span className="text-white/60 text-sm">FetLife Profile:</span>
                            <a
                              href={selectedRequest.partner2_fetlife_profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                            >
                              {selectedRequest.partner2_fetlife_profile_url}
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                          {selectedRequest.partner2_fetlife_screenshot_url && (
                            <Button
                              onClick={() => openImageInNewTab(selectedRequest.partner2_fetlife_screenshot_url)}
                              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                              data-testid="view-partner2-fetlife-screenshot-button"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Partner 2 FetLife Screenshot
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Admin Actions (only for pending requests) */}
              {selectedRequest.status === 'pending' && (
                <>
                  <Separator className="bg-pink-500/30" />
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Admin Review</h4>
                    
                    {/* Admin Notes */}
                    <div>
                      <label className="block text-sm text-white/80 mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this verification..."
                        className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500 min-h-[80px]"
                        data-testid="admin-notes-textarea"
                      />
                    </div>

                    {/* Rejection Reason (shown when rejecting) */}
                    <div>
                      <label className="block text-sm text-white/80 mb-2">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Rejection Reason (Required if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500 min-h-[80px]"
                        data-testid="rejection-reason-textarea"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        data-testid="reject-verification-button"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Rejecting...' : 'Reject'}
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        data-testid="approve-verification-button"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Approving...' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Review Info (for approved/rejected) */}
              {selectedRequest.status !== 'pending' && (
                <>
                  <Separator className="bg-pink-500/30" />
                  <div className="space-y-2 text-sm">
                    <h4 className="text-white font-medium mb-2">Review Information</h4>
                    {selectedRequest.reviewed_at && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Reviewed At:</span>
                        <span className="text-white">{new Date(selectedRequest.reviewed_at).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedRequest.admin_notes && (
                      <div>
                        <span className="text-white/60">Admin Notes:</span>
                        <p className="text-white mt-1">{selectedRequest.admin_notes}</p>
                      </div>
                    )}
                    {selectedRequest.rejection_reason && (
                      <div>
                        <span className="text-white/60">Rejection Reason:</span>
                        <p className="text-red-400 mt-1">{selectedRequest.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </SpiceBackground>
  );
};
