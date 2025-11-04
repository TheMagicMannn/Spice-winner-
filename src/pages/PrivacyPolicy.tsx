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
          <div className="p-6 space-y-6 text-white/90 text-sm leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">SPICE Privacy Notice</h2>
              <p className="text-white/60 text-xs mb-4">Last updated: August 25, 2025</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Privacy Notice</h3>
              <p>Welcome to SPICE's Privacy Notice. Thank you for taking the time to read it.</p>
              <p className="mt-2">Please read this Privacy Notice carefully before accessing or using our services. If you have any questions about this Privacy Notice or how we use your personal information, please contact us using the contact details set out below.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">What this Privacy Notice covers</h3>
              <p>This Privacy Notice applies to websites, apps, events and other services that post or link to this Privacy Notice or are operated by SPICE ("SPICE", "we", "us" or "our"). For simplicity, we refer to all of these as our "services" in this Privacy Notice.</p>
              <p className="mt-2">This Privacy Notice sets out how we collect, store, transfer, share and use information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, to a person ("personal information") when you sign up to, access and use the services.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. Information we collect and how we use it</h3>
              <p>We collect information that you provide to us when you set up your profile on our services, sign up for VIP access, and use our services to interact with other users. We also collect certain information automatically about how you use our services and your device.</p>
              
              <h4 className="text-md font-semibold text-white mt-4 mb-2">Information you provide when you set up your profile</h4>
              <p>We will collect the following information from you when you set up your account and profile on our services:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Contact information, including your email address or phone number</li>
                <li>Basic profile information, including your username and profile picture</li>
                <li>Additional and verification pictures</li>
                <li>Your date of birth</li>
                <li>Your sex and gender</li>
                <li>Your bio and preferences</li>
                <li>Your sexual orientation and relationship preferences</li>
                <li>Information about your partner (if joining as a couple)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. How we use your personal information</h3>
              <p>The main reason we use your information is to operate, maintain and deliver our services, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Allowing you to view and match with other users</li>
                <li>Enabling other users to view your profile and match with you</li>
                <li>Personalizing your experience on our services</li>
                <li>Facilitating communications between users</li>
                <li>Ensuring safety and security for all users</li>
                <li>Preventing fraud and unauthorized activities</li>
                <li>Improving our services and developing new features</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. Photo Verification</h3>
              <p>If you choose to verify your profile photo, we will review your verification photo and compare it to the other photos you submit to help ensure that you are who you say you are. We do not add the verification photos to your profile.</p>
              <p className="mt-2">With your consent, we will use facial recognition AI technology to compare your verification photo against the photos you upload. We do not retain your biometric template after completing the photo verification process.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. How we share information</h3>
              <p>We may share your personal information as follows:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>With other users:</strong> You share information when you voluntarily disclose it on the services, including your public profile</li>
                <li><strong>With our service providers:</strong> We use third parties to help us operate and improve our services</li>
                <li><strong>For legal compliance:</strong> When required by law or to protect the safety of any person</li>
                <li><strong>For corporate transactions:</strong> If we are involved in a merger, sale, or acquisition</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. Control over your information</h3>
              <p>You can control how your personal information is used:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>In-app settings:</strong> Update privacy settings, access, rectify or delete information directly within the service</li>
                <li><strong>Device permissions:</strong> Control access to your phone book and location through your device settings</li>
                <li><strong>Modifying and deleting:</strong> Review, amend or delete your personal information or entire account</li>
                <li><strong>Email preferences:</strong> Unsubscribe from promotional emails at any time</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Right of access:</strong> Obtain confirmation of whether we are processing your personal information</li>
                <li><strong>Right of portability:</strong> Receive a copy of your personal information in a machine-readable format</li>
                <li><strong>Right to rectification:</strong> Obtain rectification of any inaccurate personal information</li>
                <li><strong>Right to deletion:</strong> Require us to erase your personal information</li>
                <li><strong>Right to restriction:</strong> Limit the purposes for which we process your information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. Data Retention</h3>
              <p>We will normally keep your personal information for as long as you are an active user of our services. If you delete your account, your profile will no longer be visible to others, but we will retain your personal information for one month (or three months for VIP users), after which it will be deleted or anonymized.</p>
              <p className="mt-2">We will also delete or anonymize your personal information if you are inactive for a continuous period of two years.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">8. Children's Privacy</h3>
              <p>Our services are restricted to users who are 18 years of age or older. We do not permit users under the age of 18 on our platform and we do not knowingly collect personal information from anyone under the age of 18.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">9. Contact Us</h3>
              <p>If you have questions about this Privacy Notice or our privacy practices, you can contact us at:</p>
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
                This Privacy Notice may change over time. When we make changes, we will update the "Last Updated" date at the beginning of this notice. Material changes will be communicated through email or prominent posting on our services.
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
