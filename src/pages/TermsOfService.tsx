import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

export const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={`${spiceTheme.components.header} flex items-center`}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-pink-400 hover:bg-pink-500/10 p-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className={`text-2xl ${spiceTheme.components.text.title} ml-4`}>Terms of Service</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <Card className={spiceTheme.components.card}>
          <div className="p-6 space-y-6 text-white/90 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">SPICE Terms of Use</h2>
              <p className="text-white/60 text-xs mb-4">Last updated: August 25, 2025</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Welcome to SPICE</h3>
              <p>These Terms of Use ("Terms") govern your access to and use of the SPICE mobile application and website (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Eligibility</h3>
              <p>You must be at least 18 years old to use SPICE. By using our Services, you represent and warrant that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>You are at least 18 years of age</li>
                <li>You have the right, authority, and capacity to enter into these Terms</li>
                <li>You will comply with these Terms and all applicable laws and regulations</li>
                <li>You have not been previously banned from the Services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. Account Registration</h3>
              <p>To use SPICE, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Keep your password confidential and secure</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Community Guidelines</h3>
              <p>SPICE is a respectful community. You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Post or share content that is illegal, harmful, threatening, abusive, harassing, or offensive</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                <li>Use the Services for any commercial purposes without our prior written consent</li>
                <li>Engage in any form of harassment, hate speech, or discriminatory behavior</li>
                <li>Share explicit sexual content or solicitation in inappropriate contexts</li>
                <li>Use automated systems or bots to access the Services</li>
                <li>Attempt to gain unauthorized access to any portion of the Services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. Content</h3>
              <p><strong>Your Content:</strong> You retain ownership of the content you post on SPICE. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the Services.</p>
              <p className="mt-2"><strong>Content Standards:</strong> All content must comply with our community guidelines. We reserve the right to remove any content that violates these Terms or is otherwise objectionable.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. VIP Subscriptions</h3>
              <p>SPICE offers optional VIP subscriptions with enhanced features. Subscription terms:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Subscriptions automatically renew unless canceled before the renewal date</li>
                <li>Refunds are not provided for partial subscription periods</li>
                <li>We may change VIP features and pricing with reasonable notice</li>
                <li>You can cancel your subscription at any time through your account settings</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Safety and Reporting</h3>
              <p>Your safety is important to us. If you encounter inappropriate behavior:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Use the in-app reporting tools to report violations</li>
                <li>Block users who make you uncomfortable</li>
                <li>Contact our support team for assistance</li>
                <li>Report any illegal activity to appropriate authorities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Termination</h3>
              <p>We reserve the right to suspend or terminate your account at any time for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Behavior that harms other users or the community</li>
                <li>Extended periods of inactivity</li>
              </ul>
              <p className="mt-2">You may delete your account at any time through the app settings.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">8. Disclaimer of Warranties</h3>
              <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the Services will be uninterrupted, secure, or error-free. We are not responsible for the conduct of any user on or off the Services.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h3>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPICE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h3>
              <p>We may modify these Terms at any time. Material changes will be notified through the app or by email. Your continued use of the Services after changes indicates acceptance of the modified Terms.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">11. Contact Us</h3>
              <p>For questions about these Terms, contact us at:</p>
              <p className="mt-2">
                <a 
                  href="mailto:support@thespiceapp.com" 
                  className="text-pink-400 hover:text-pink-300 underline"
                >
                  support@thespiceapp.com
                </a>
              </p>
            </div>

            <div className="border-t border-pink-500/20 pt-4 mt-6">
              <p className="text-white/60 text-xs">
                By using SPICE, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
