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
          <div className="p-6 space-y-6 text-white">
            <div>
              <p className="text-white/70 mb-6">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-white/80 leading-relaxed">
                Welcome to SPICE. By creating an account and using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">1. Acceptance of Terms</h2>
              <p className="text-white/80">
                By accessing or using SPICE, you agree to comply with and be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not agree, you may not use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">2. Eligibility</h2>
              <div className="space-y-2 text-white/80">
                <p><strong>Age Requirement:</strong> You must be at least 18 years old to use SPICE.</p>
                <p><strong>Verification:</strong> We reserve the right to verify your age and identity.</p>
                <p><strong>Account Accuracy:</strong> You must provide accurate, current, and complete information.</p>
                <p className="text-pink-400 font-semibold">SPICE is an adults-only platform for mature, consenting individuals.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You may not transfer or sell your account to another person</li>
                <li>One person may only have one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">4. Prohibited Conduct</h2>
              <p className="text-white/80 mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Post false, misleading, or deceptive information</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, threaten, or intimidate other users</li>
                <li>Post content that is illegal, obscene, defamatory, or violates intellectual property rights</li>
                <li>Engage in any form of solicitation or commercial activity without permission</li>
                <li>Use automated systems (bots, scrapers) to access the platform</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Post content involving minors in any context</li>
                <li>Share or distribute another user's private information without consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">5. Content Guidelines</h2>
              <div className="space-y-3 text-white/80">
                <p><strong>Your Content:</strong> You retain ownership of content you post, but grant SPICE a license to use, display, and distribute it on the platform.</p>
                <p><strong>Content Standards:</strong> All content must comply with our community guidelines and applicable laws.</p>
                <p><strong>Consent:</strong> All photos and content must involve consenting adults only.</p>
                <p><strong>Moderation:</strong> We reserve the right to remove any content that violates these terms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">6. Privacy and Data</h2>
              <p className="text-white/80">
                Your use of SPICE is also governed by our Privacy Policy. By using the platform, you consent to our collection, use, and sharing of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">7. Safety and Security</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Always practice safe meeting practices when connecting with others</li>
                <li>Never share financial information with other users</li>
                <li>Report suspicious behavior or violations immediately</li>
                <li>Use discretion when sharing personal information</li>
                <li>SPICE is not responsible for offline interactions between users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">8. Membership and Payments</h2>
              <div className="space-y-2 text-white/80">
                <p><strong>Free and Premium Features:</strong> SPICE offers both free and premium subscription features.</p>
                <p><strong>Payment Terms:</strong> Premium subscriptions are billed according to the plan you select.</p>
                <p><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings.</p>
                <p><strong>Refunds:</strong> Refunds are handled on a case-by-case basis according to our refund policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">9. Intellectual Property</h2>
              <p className="text-white/80">
                All content, trademarks, logos, and intellectual property on SPICE are owned by or licensed to us. You may not use, reproduce, or distribute any content from the platform without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">10. Disclaimers and Limitations</h2>
              <div className="space-y-2 text-white/80">
                <p><strong>AS IS Basis:</strong> SPICE is provided "as is" without warranties of any kind.</p>
                <p><strong>No Guarantee:</strong> We do not guarantee that you will find matches or achieve specific outcomes.</p>
                <p><strong>User Responsibility:</strong> You are solely responsible for your interactions with other users.</p>
                <p><strong>Limitation of Liability:</strong> SPICE is not liable for any indirect, incidental, or consequential damages.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">11. Account Termination</h2>
              <p className="text-white/80 mb-3">We may suspend or terminate your account if:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>You violate these Terms of Service</li>
                <li>You engage in illegal or harmful activity</li>
                <li>Your account remains inactive for an extended period</li>
                <li>We believe termination is necessary for legal or safety reasons</li>
              </ul>
              <p className="text-white/80 mt-3">
                You may delete your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">12. Dispute Resolution</h2>
              <div className="space-y-2 text-white/80">
                <p><strong>Governing Law:</strong> These Terms are governed by the laws of [Your Jurisdiction].</p>
                <p><strong>Arbitration:</strong> Any disputes will be resolved through binding arbitration.</p>
                <p><strong>Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of a class action.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">13. Changes to Terms</h2>
              <p className="text-white/80">
                We may modify these Terms at any time. We will notify you of significant changes. Continued use of SPICE after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">14. Contact Us</h2>
              <p className="text-white/80">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-white/5 rounded-lg">
                <p className="text-white/80">Email: support@spiceapp.com</p>
                <p className="text-white/80">Address: SPICE Legal Team, [Your Address]</p>
              </div>
            </section>

            <div className="pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm italic">
                By creating an account and using SPICE, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
