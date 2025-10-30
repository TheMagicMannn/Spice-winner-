import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { SpiceBackground, SpiceButton } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { 
  HelpCircle, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Account Issues',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a link to reset your password. Make sure to check your spam folder if you don\'t see the email within a few minutes.'
  },
  {
    category: 'Account Issues',
    question: 'How do I update my profile information?',
    answer: 'Go to your Profile page and click the "Edit Profile" button. You can update your photos, bio, location, and other details. Make sure to save your changes before leaving the page.'
  },
  {
    category: 'Account Issues',
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account from the Settings page. Please note that this action is permanent and cannot be undone. All your data, matches, and messages will be permanently removed.'
  },
  {
    category: 'Matching & Discovery',
    question: 'How does the matching algorithm work?',
    answer: 'Our matching algorithm considers your preferences including age range, location, interests, and relationship goals. We also factor in compatibility scores based on your profile information and activity patterns to suggest the most compatible matches.'
  },
  {
    category: 'Matching & Discovery',
    question: 'Why am I not seeing any matches?',
    answer: 'This could be due to several reasons: your search criteria might be too restrictive, you may need to expand your distance range, or there might be limited users in your area. Try adjusting your match preferences in your profile settings.'
  },
  {
    category: 'Matching & Discovery',
    question: 'How do I adjust my match preferences?',
    answer: 'Visit your Profile page and click on "Match Preferences" in the Quick Actions section. Here you can adjust age ranges, distance, verification requirements, and other preferences to find better matches.'
  },
  {
    category: 'Privacy & Safety',
    question: 'How is my personal information protected?',
    answer: 'We take your privacy seriously. All data is encrypted and stored securely. We never share your personal information with third parties without your consent. You have full control over what information is visible on your profile.'
  },
  {
    category: 'Privacy & Safety',
    question: 'How do I report or block someone?',
    answer: 'If you encounter inappropriate behavior, you can report or block a user by visiting their profile and clicking the three-dot menu. Select "Report" to notify our moderation team or "Block" to prevent further contact.'
  },
  {
    category: 'Privacy & Safety',
    question: 'What is profile verification?',
    answer: 'Profile verification is a process where we confirm your identity through photo verification. Verified profiles get a blue checkmark badge, which helps build trust in the community. You can start the verification process from your Profile page.'
  },
  {
    category: 'Features & Usage',
    question: 'What are events and how do I join them?',
    answer: 'Events are community gatherings organized by users or the platform. You can browse events in the Events tab, see details, and RSVP to attend. Events range from social meetups to lifestyle-specific gatherings.'
  },
  {
    category: 'Features & Usage',
    question: 'What does ISO mean and how do I create a post?',
    answer: 'ISO stands for "In Search Of". It\'s a feature where you can post what you\'re looking for - whether it\'s new connections, specific experiences, or event companions. Create an ISO post from the Community or ISO page.'
  },
  {
    category: 'Features & Usage',
    question: 'How do messages work?',
    answer: 'Once you match with someone or connect, you can send messages through the Messages tab. Messages are private and encrypted. You\'ll receive notifications when you get new messages.'
  },
  {
    category: 'Troubleshooting',
    question: 'The app is running slow or freezing',
    answer: 'Try these steps: 1) Clear your browser cache and cookies, 2) Make sure you\'re using the latest version of your browser, 3) Check your internet connection, 4) Try logging out and back in. If the problem persists, contact our support team.'
  },
  {
    category: 'Troubleshooting',
    question: 'My photos are not uploading',
    answer: 'Ensure your photos meet our requirements: JPG, PNG, or WEBP format, under 5MB in size, and appropriate content. If you\'re still having issues, try using a different browser or compressing your images before uploading.'
  },
  {
    category: 'Troubleshooting',
    question: 'I\'m not receiving notifications',
    answer: 'Check your notification settings in both the app and your device settings. Make sure notifications are enabled for The Spice App. Also check that you\'ve verified your email address, as some notifications require email verification.'
  }
];

const categories = Array.from(new Set(faqData.map(faq => faq.category)));

export const HelpSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: ''
  });
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    description?: string;
  }>({});

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/support/submit-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', description: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      setSubmitError(error.message || 'Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
                Help & Support
              </h1>
              <p className={spiceTheme.components.text.subtitle}>We're here to help</p>
            </div>
          </div>
          <HelpCircle className="h-6 w-6 text-pink-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* FAQ Section */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-pink-400" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' 
                  ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                  : 'text-white border-pink-500/30 hover:bg-pink-500/10'
                }
                data-testid="filter-all-button"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                    : 'text-white border-pink-500/30 hover:bg-pink-500/10'
                  }
                  data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}-button`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-pink-500/20 rounded-lg overflow-hidden"
                  data-testid={`faq-item-${index}`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-black/30 hover:bg-pink-500/10 transition-colors"
                    data-testid={`faq-question-${index}`}
                  >
                    <span className="text-left text-white font-medium">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-pink-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-pink-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div 
                      className="px-4 py-3 bg-black/20 text-white/80 border-t border-pink-500/10"
                      data-testid={`faq-answer-${index}`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Ticket Form */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="h-5 w-5 mr-2 text-pink-400" />
              Submit a Support Ticket
            </CardTitle>
            <p className="text-white/60 text-sm mt-2">
              Can't find what you're looking for? Send us a message and we'll get back to you.
            </p>
          </CardHeader>
          <CardContent>
            {submitSuccess && (
              <div 
                className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3"
                data-testid="success-message"
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-100">
                  <p className="font-semibold mb-1">Ticket submitted successfully!</p>
                  <p>Allow 1 to 2 business days for our support team to review and respond to your ticket.</p>
                </div>
              </div>
            )}

            {submitError && (
              <div 
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
                data-testid="error-message"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-100">
                  <p className="font-semibold mb-1">Error</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                  className={`bg-black/30 border-pink-500/30 text-white placeholder:text-white/40 ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                  data-testid="input-name"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className={`bg-black/30 border-pink-500/30 text-white placeholder:text-white/40 ${
                    formErrors.email ? 'border-red-500' : ''
                  }`}
                  data-testid="input-email"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  className={`bg-black/30 border-pink-500/30 text-white placeholder:text-white/40 ${
                    formErrors.subject ? 'border-red-500' : ''
                  }`}
                  data-testid="input-subject"
                />
                {formErrors.subject && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide details about your issue..."
                  rows={6}
                  className={`bg-black/30 border-pink-500/30 text-white placeholder:text-white/40 resize-none ${
                    formErrors.description ? 'border-red-500' : ''
                  }`}
                  data-testid="textarea-description"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              <SpiceButton
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                data-testid="submit-ticket-button"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </SpiceButton>
            </form>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card className={`${spiceTheme.components.card} animate-fade-in`}>
          <CardContent className="p-4">
            <p className="text-white/70 text-sm text-center">
              For urgent matters, you can also email us directly at{' '}
              <a 
                href="mailto:support@thespiceapp.com" 
                className="text-pink-400 hover:text-pink-300 underline"
              >
                support@thespiceapp.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </SpiceBackground>
  );
};
