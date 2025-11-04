import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';

export const PrivacyPolicyPage: React.FC = () => {
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
        <h1 className={`text-2xl ${spiceTheme.components.text.title} ml-4`}>Privacy Policy</h1>
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
                Welcome to SPICE. We are committed to protecting your privacy and ensuring your personal information is handled responsibly. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">1. Information We Collect</h2>
              <div className="space-y-3 text-white/80">
                <p><strong>Personal Information:</strong> Name, age, email address, photos, location, and profile details.</p>
                <p><strong>Usage Data:</strong> Information about how you use our platform, including pages visited, features used, and interactions.</p>
                <p><strong>Communication Data:</strong> Messages, posts, and other content you share on the platform.</p>
                <p><strong>Device Information:</strong> IP address, browser type, device type, and operating system.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>To provide, maintain, and improve our services</li>
                <li>To create and manage your account</li>
                <li>To facilitate connections between members</li>
                <li>To send you notifications, updates, and promotional materials</li>
                <li>To ensure platform safety and prevent fraud</li>
                <li>To comply with legal obligations</li>
                <li>To personalize your experience and show relevant content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">3. Information Sharing</h2>
              <div className="space-y-3 text-white/80">
                <p><strong>With Other Users:</strong> Your profile information is visible to other verified members based on your privacy settings.</p>
                <p><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist in operating our platform.</p>
                <p><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</p>
                <p className="text-pink-400 font-semibold">We do NOT sell your personal information to third parties.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">4. Data Security</h2>
              <p className="text-white/80">
                We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">5. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">6. Cookies and Tracking</h2>
              <p className="text-white/80">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">7. Age Restrictions</h2>
              <p className="text-white/80">
                SPICE is an adults-only platform. Users must be 18 years or older. We do not knowingly collect information from individuals under 18.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">8. International Users</h2>
              <p className="text-white/80">
                By using SPICE, you consent to the transfer and processing of your information in the United States and other countries where we operate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">9. Changes to This Policy</h2>
              <p className="text-white/80">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use of SPICE after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-400 mb-3">10. Contact Us</h2>
              <p className="text-white/80">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-white/5 rounded-lg">
                <p className="text-white/80">Email: privacy@spiceapp.com</p>
                <p className="text-white/80">Address: SPICE Privacy Team, [Your Address]</p>
              </div>
            </section>

            <div className="pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm italic">
                By using SPICE, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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
