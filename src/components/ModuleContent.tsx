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
        estimatedTime: '15-20 minutes',
        sections: [
          {
            heading: 'Welcome to Lifestyle Communication',
            content: 'Effective communication is the cornerstone of any successful relationship, especially in the lifestyle community. This comprehensive module will introduce you to the fundamental principles of open, honest, and respectful communication that form the foundation of healthy connections.\n\nWhether you\'re new to the lifestyle or have years of experience, mastering these communication skills will enhance every interaction you have. Throughout this course, we\'ll explore practical strategies, real-world scenarios, and proven techniques used by successful couples and individuals in the community.',
            type: 'normal'
          },
          {
            heading: 'Why Communication Matters in the Lifestyle',
            content: 'The lifestyle is built on trust, respect, and mutual understanding. Unlike traditional relationship dynamics, lifestyle interactions often involve:\n\n• Multiple partners or potential connections\n• Complex emotional landscapes\n• Diverse expectations and boundaries\n• Sensitive topics that require vulnerability\n• Time-sensitive decisions during social events\n\nWithout strong communication skills, these factors can lead to misunderstandings, hurt feelings, or uncomfortable situations. Conversely, excellent communication creates opportunities for deeper connections, more fulfilling experiences, and a supportive community.',
            type: 'normal'
          },
          {
            heading: 'The Four Pillars of Lifestyle Communication',
            content: '1. CLARITY: Using specific, unambiguous language\n2. HONESTY: Being truthful about feelings, desires, and limits\n3. RESPECT: Honoring others\' perspectives and boundaries\n4. CONSISTENCY: Following through on commitments and promises\n\nThese four pillars work together to create a communication framework that serves you in every lifestyle interaction, from first conversations to long-term connections.',
            type: 'key-point'
          },
          {
            heading: 'The Importance of Clarity',
            content: 'Vague communication is one of the leading causes of problems in lifestyle interactions. When you say "I\'m open to exploring," what exactly does that mean? Does it mean:\n\n• You\'re curious but need to take things slowly?\n• You\'re interested in specific activities only?\n• You\'re completely open to anything?\n• You need more information before deciding?\n\nWithout clarity, your partner or potential connections must guess at your meaning, which often leads to mismatched expectations.',
            type: 'normal'
          },
          {
            heading: 'How to Communicate Clearly',
            content: 'Instead of vague statements, practice using specific language:\n\n❌ VAGUE: "I\'m interested in that"\n✅ CLEAR: "I\'m interested in soft play but not full swap"\n\n❌ VAGUE: "Maybe we can try sometime"\n✅ CLEAR: "I\'d like to try that, but I need to discuss it with my partner first"\n\n❌ VAGUE: "I\'m not sure about this"\n✅ CLEAR: "I\'m feeling hesitant because I need to understand the expectations better"\n\nNotice how the clear versions leave no room for misinterpretation. They state exactly what you mean, what you need, and where you stand.',
            type: 'example'
          },
          {
            heading: 'Practical Exercise: Clarity in Action',
            content: 'Think about a recent conversation where there might have been confusion. How could you have been more specific? Practice rewriting these common vague phrases into clear statements:\n\n• "We\'ll see how the night goes" → ?\n• "I\'m comfortable with most things" → ?\n• "Let\'s just have fun" → ?\n\nThe clearer you are from the start, the better the outcome for everyone involved.',
            type: 'tip'
          },
          {
            heading: 'Active Listening: The Other Half of Communication',
            content: 'Communication is not just about speaking clearly—it\'s equally about listening effectively. Active listening involves:\n\n• Giving your full attention (put the phone away)\n• Making eye contact and using body language\n• Not interrupting or planning your response while they\'re talking\n• Asking clarifying questions\n• Paraphrasing to confirm understanding\n• Acknowledging emotions, not just facts',
            type: 'normal'
          },
          {
            heading: 'The Paraphrasing Technique',
            content: 'One of the most powerful listening tools is paraphrasing. After someone shares something important, repeat it back in your own words:\n\n"So what I\'m hearing is that you\'re interested in joining us, but you\'d prefer to start with just social interaction tonight. Is that right?"\n\nThis accomplishes three things:\n1. Confirms you understood correctly\n2. Shows them you\'re truly listening\n3. Gives them a chance to clarify if needed\n\nThis simple technique prevents countless misunderstandings.',
            type: 'example'
          },
          {
            heading: 'Common Listening Mistakes to Avoid',
            content: '🚫 Interrupting with your own story ("Oh, that reminds me of when I...")\n🚫 Immediately offering solutions instead of understanding\n🚫 Judging or criticizing what they\'re sharing\n🚫 Dismissing their feelings ("You shouldn\'t feel that way")\n🚫 Being distracted by your phone or surroundings\n🚫 Waiting for your turn to talk instead of truly listening\n\nRecognize these patterns in yourself and work to eliminate them. They destroy connection and trust.',
            type: 'warning'
          },
          {
            heading: 'Building Trust Through Consistent Communication',
            content: 'Trust in the lifestyle is everything. It\'s built through consistent, reliable communication over time. This means:\n\n• Saying what you mean and meaning what you say\n• Following through on plans and commitments\n• Being honest even when it\'s uncomfortable\n• Admitting mistakes and miscommunications\n• Maintaining confidentiality when agreed upon\n• Responding to messages in a reasonable timeframe\n\nEvery interaction either builds or erodes trust. Make each one count.',
            type: 'normal'
          },
          {
            heading: 'The 24-Hour Rule',
            content: 'A practical guideline used by many successful lifestyle participants:\n\nWhen you receive a message or invitation that requires a decision, respond within 24 hours—even if your response is "I need more time to think about this."\n\nThis shows respect for others\' time and demonstrates that you\'re a reliable communicator. It prevents the anxiety of wondering if your message was received or if you\'re being ignored.',
            type: 'tip'
          },
          {
            heading: 'Navigating Difficult Conversations',
            content: 'Not every conversation will be easy. Sometimes you need to:\n\n• Decline an invitation\n• Express that boundaries were crossed\n• Address hurt feelings or misunderstandings\n• End a connection that isn\'t working\n• Discuss changing interests or desires\n\nThese conversations are harder, but they\'re where strong communication skills matter most. Approach them with:\n\n1. Timing: Choose a private, calm moment\n2. Honesty: Be direct but kind\n3. Respect: Acknowledge their perspective\n4. Solutions: Offer constructive paths forward when possible',
            type: 'normal'
          },
          {
            heading: 'Real-World Scenario',
            content: 'SITUATION: You\'re at a lifestyle event and a couple approaches you with interest, but you\'re not attracted to them. How do you communicate this?\n\n❌ POOR: Avoiding them, giving fake numbers, or lying about having plans\n\n✅ GOOD: "Thank you so much for the interest! I appreciate you approaching us. We\'re looking for a slightly different connection tonight, but we wish you a wonderful evening."\n\nThis is honest, kind, clear, and respectful. It leaves no room for confusion while maintaining everyone\'s dignity.',
            type: 'example'
          },
          {
            heading: 'Digital Communication in the Lifestyle',
            content: 'Much of lifestyle communication happens digitally—messages, apps, video chats. Apply the same principles:\n\n• Be clear in texts (tone can be misread)\n• Use proper grammar and spelling (shows respect)\n• Respond within reasonable timeframes\n• Don\'t ghost—always close loops\n• Be cautious with explicit content until consent is clear\n• Remember: screenshots exist, be thoughtful\n\nDigital communication is permanent. Treat it with the same care as in-person conversations.',
            type: 'warning'
          },
          {
            heading: 'Cultural Differences and Communication',
            content: 'The lifestyle community is diverse, with people from different backgrounds, cultures, and communication styles. What\'s direct in one culture might be rude in another. What\'s polite in one context might be confusing in another.\n\nWhen in doubt:\n• Ask questions\n• Don\'t make assumptions\n• Be patient with language barriers\n• Appreciate different approaches\n• Find common ground through respect',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Clarity prevents misunderstandings—be specific\n✅ Active listening is as important as speaking\n✅ Trust is built through consistent, honest communication\n✅ Paraphrase to confirm understanding\n✅ Respond to messages within 24 hours when possible\n✅ Handle difficult conversations with honesty and respect\n✅ Digital communication requires the same care as in-person\n✅ Respect cultural differences in communication styles\n\nMastering these fundamentals will transform your lifestyle experience.',
            type: 'key-point'
          },
          {
            heading: 'Before You Continue to the Quiz',
            content: 'Take a moment to reflect:\n\n• Which communication skill do you most need to develop?\n• Can you think of a past situation where better communication would have helped?\n• What specific phrase or technique will you try first?\n\nThe quiz will test your understanding of these concepts. Make sure you\'ve absorbed the material before proceeding.',
            type: 'tip'
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
