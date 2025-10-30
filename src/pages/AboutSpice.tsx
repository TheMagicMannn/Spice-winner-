import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { ArrowLeft, Shield, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AboutSpicePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-pink-500/10 -ml-2"
              data-testid="back-to-profile-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>
                About SPICE
              </h1>
              <p className={spiceTheme.components.text.subtitle}>Your lifestyle community</p>
            </div>
          </div>
          <Info className="h-6 w-6 text-pink-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/30">
                <TabsTrigger 
                  value="privacy" 
                  className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white/60"
                  data-testid="tab-privacy"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </TabsTrigger>
                <TabsTrigger 
                  value="terms"
                  className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white/60"
                  data-testid="tab-terms"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Use
                </TabsTrigger>
                <TabsTrigger 
                  value="about"
                  className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-white/60"
                  data-testid="tab-about"
                >
                  <Info className="h-4 w-4 mr-2" />
                  About Us
                </TabsTrigger>
              </TabsList>

              {/* Privacy Policy Tab */}
              <TabsContent value="privacy" className="mt-6">
                <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6 text-white/90 text-sm leading-relaxed">
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
                </CardContent>
              </TabsContent>

              {/* Terms of Use Tab */}
              <TabsContent value="terms" className="mt-6">
                <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6 text-white/90 text-sm leading-relaxed">
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
                </CardContent>
              </TabsContent>

              {/* About Us Tab */}
              <TabsContent value="about" className="mt-6">
                <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6 text-white/90 text-sm leading-relaxed">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">About SPICE</h2>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Our Mission</h3>
                      <p>SPICE is a premium lifestyle dating platform designed for open-minded adults seeking meaningful connections in the alternative lifestyle community. We believe in creating a safe, respectful, and judgment-free space where individuals and couples can explore their interests, build genuine relationships, and connect with like-minded people.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">What We Offer</h3>
                      <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                        <li><strong>Verified Community:</strong> Our photo verification system helps ensure authentic profiles and builds trust within our community</li>
                        <li><strong>Smart Matching:</strong> Advanced matching algorithm based on preferences, location, interests, and compatibility</li>
                        <li><strong>Privacy First:</strong> Your discretion matters. Control what you share and who sees your profile</li>
                        <li><strong>Events & ISO:</strong> Discover local events and use our "In Search Of" feature to find specific connections</li>
                        <li><strong>Safe Space:</strong> Comprehensive reporting and blocking tools to maintain a respectful community</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Our Values</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-white">Respect & Consent</h4>
                          <p className="text-white/80 mt-1">We prioritize mutual respect and enthusiastic consent in all interactions within our community.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Authenticity</h4>
                          <p className="text-white/80 mt-1">Be yourself. We encourage genuine connections and honest communication.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Inclusivity</h4>
                          <p className="text-white/80 mt-1">SPICE welcomes people of all orientations, identities, and relationship styles.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Privacy & Discretion</h4>
                          <p className="text-white/80 mt-1">Your privacy is paramount. We use industry-leading security to protect your data.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Safety</h4>
                          <p className="text-white/80 mt-1">We're committed to maintaining a safe environment through verification, moderation, and user tools.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Who We Serve</h3>
                      <p>SPICE is designed for:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                        <li>Singles exploring alternative lifestyles</li>
                        <li>Couples seeking to expand their social and romantic connections</li>
                        <li>Individuals interested in ethical non-monogamy</li>
                        <li>Open-minded adults looking for genuine connections</li>
                        <li>Members of the swinging and lifestyle communities</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Our Commitment</h3>
                      <p>We're continuously working to improve SPICE based on user feedback and community needs. Our team is dedicated to:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                        <li>Enhancing safety features and verification processes</li>
                        <li>Improving matching algorithms for better connections</li>
                        <li>Adding new features that serve our community</li>
                        <li>Providing responsive customer support</li>
                        <li>Fostering a positive and respectful community culture</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Get in Touch</h3>
                      <p>We'd love to hear from you! Whether you have feedback, questions, or need support:</p>
                      <div className="mt-3 space-y-2">
                        <p>
                          <strong>Email:</strong>{' '}
                          <a 
                            href="mailto:support@thespiceapp.com" 
                            className="text-pink-400 hover:text-pink-300 underline"
                          >
                            support@thespiceapp.com
                          </a>
                        </p>
                        <p>
                          <strong>Support:</strong> Use the Help & Support section in your profile for quick assistance
                        </p>
                      </div>
                    </div>

                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-white mb-2">Join Our Community</h4>
                      <p className="text-white/80">
                        Ready to spice up your life? Download the SPICE app and start connecting with like-minded individuals in your area. Your journey to authentic connections starts here.
                      </p>
                    </div>

                    <div className="border-t border-pink-500/20 pt-4 mt-6">
                      <p className="text-white/60 text-xs text-center">
                        SPICE - Where authentic connections happen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </SpiceBackground>
  );
};