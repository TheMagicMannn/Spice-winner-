import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Lightbulb, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModuleContentProps {
  moduleId: string;
  title: string;
  onClose: () => void;
  onComplete: () => void;
}

interface ContentSection {
  heading: string;
  content: string;
  type?: 'normal' | 'tip' | 'warning' | 'example' | 'key-point';
}

export const ModuleContent: React.FC<ModuleContentProps> = ({ 
  moduleId, 
  title, 
  onClose, 
  onComplete 
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollHeight = target.scrollHeight - target.clientHeight;
      const scrolled = target.scrollTop;
      const progress = (scrolled / scrollHeight) * 100;
      setScrollProgress(progress);
      
      // Enable complete button after scrolling 80%
      if (progress > 80) {
        setCanComplete(true);
      }
    };

    const contentEl = document.getElementById('module-content-scroll');
    contentEl?.addEventListener('scroll', handleScroll);
    return () => contentEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const getModuleContent = (id: string) => {
    const content: Record<string, { sections: Array<ContentSection>; estimatedTime: string }> = {
      'mod-1': {
        sections: [
          {
            heading: 'Welcome to Lifestyle Communication',
            content: 'Effective communication is the cornerstone of any successful relationship, especially in the lifestyle community. This module will introduce you to the fundamental principles of open, honest, and respectful communication.'
          },
          {
            heading: 'The Importance of Clarity',
            content: 'Clear communication helps prevent misunderstandings and ensures that all parties are on the same page. When expressing your desires, boundaries, or concerns, use specific language and avoid assumptions.'
          },
          {
            heading: 'Active Participation',
            content: 'Communication is a two-way street. Both speaking and listening are equally important. Make sure to give your full attention when someone is sharing with you, and encourage open dialogue.'
          },
          {
            heading: 'Building Trust Through Words',
            content: 'Trust is built through consistent, honest communication. Be authentic in your conversations and follow through on what you say. This creates a foundation of reliability and respect.'
          },
          {
            heading: 'Key Takeaways',
            content: '• Always communicate with clarity and specificity\n• Practice active listening\n• Be honest and authentic\n• Respect boundaries in all conversations\n• Follow through on your commitments'
          }
        ]
      },
      'mod-2': {
        sections: [
          {
            heading: 'Understanding Boundaries',
            content: 'Boundaries are personal limits that define what you are comfortable with in various situations. In the lifestyle, understanding and respecting boundaries is essential for creating safe, enjoyable experiences for everyone involved.'
          },
          {
            heading: 'Types of Boundaries',
            content: 'Physical Boundaries: What physical contact or activities you are comfortable with.\n\nEmotional Boundaries: What level of emotional intimacy you prefer.\n\nTime Boundaries: When and how often you are available for interactions.\n\nPrivacy Boundaries: What personal information you wish to share.'
          },
          {
            heading: 'Communicating Your Boundaries',
            content: 'Express your boundaries clearly and confidently. Use "I" statements like "I am comfortable with..." or "I need...". Remember, boundaries can change, and it is okay to adjust them as needed.'
          },
          {
            heading: 'Respecting Others\' Boundaries',
            content: 'When someone shares their boundaries with you, acknowledge them without judgment. Never pressure someone to change their boundaries. Respecting boundaries builds trust and shows maturity.'
          },
          {
            heading: 'Key Takeaways',
            content: '• Boundaries are personal and valid\n• Communicate boundaries clearly and early\n• Respect others\' boundaries without question\n• Boundaries can evolve over time\n• No explanation is needed for setting boundaries'
          }
        ]
      },
      'mod-3': {
        sections: [
          {
            heading: 'The Foundation: Consent',
            content: 'Consent is an enthusiastic, ongoing agreement to participate in any activity. In the lifestyle, consent is not just important—it is mandatory. Without clear consent, no activity should proceed.'
          },
          {
            heading: 'FRIES Model of Consent',
            content: 'Freely given: Consent must be given without pressure or coercion.\n\nReversible: Anyone can change their mind at any time.\n\nInformed: All parties understand what they are consenting to.\n\nEnthusiastic: Consent should be clear and positive.\n\nSpecific: Consent for one activity does not mean consent for all.'
          },
          {
            heading: 'Negotiation Basics',
            content: 'Before any interaction, discuss expectations, limits, and desires. This negotiation should cover what activities are on the table, what is off-limits, and any safety considerations. Use this time to ask questions and ensure everyone is comfortable.'
          },
          {
            heading: 'During and After',
            content: 'Check in regularly during activities to ensure ongoing consent. After the interaction, have a debrief conversation to discuss what went well and what could be improved for future experiences.'
          },
          {
            heading: 'Key Takeaways',
            content: '• Consent must be clear, enthusiastic, and ongoing\n• Use the FRIES model as a guide\n• Negotiate before any interaction\n• Check in during activities\n• Debrief afterwards to strengthen communication'
          }
        ]
      }
    };

    return content[id] || { sections: [] };
  };

  const content = getModuleContent(moduleId);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-pink-500/30">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-pink-500/30 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {content.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl font-semibold text-pink-400">{section.heading}</h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-pink-500/30 p-6">
          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-full"
          >
            Complete Module & Take Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
