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
        estimatedTime: '20-25 minutes',
        sections: [
          {
            heading: 'Understanding Boundaries: Your Personal Blueprint',
            content: 'Boundaries are personal limits that define what you are comfortable with in various situations. Think of them as your personal blueprint for healthy interactions—they protect your physical, emotional, and mental well-being while allowing you to connect authentically with others.\n\nIn the lifestyle, boundaries aren\'t restrictions—they\'re the framework that makes authentic connection possible. Without clear boundaries, you risk resentment, burnout, or experiences that leave you feeling uncomfortable or violated. With strong boundaries, you create space for genuine pleasure, trust, and growth.',
            type: 'normal'
          },
          {
            heading: 'Why Boundaries Matter in the Lifestyle',
            content: 'The lifestyle involves unique situations that don\'t exist in traditional relationships:\n\n• Physical intimacy with people you may have just met\n• Navigating attractions while honoring existing relationships\n• Balancing multiple connections and schedules\n• Managing privacy and discretion\n• Exploring desires that may push your comfort zone\n\nWithout clear boundaries, these situations become chaotic and potentially harmful. With them, they become opportunities for incredible experiences.',
            type: 'normal'
          },
          {
            heading: 'The Six Types of Lifestyle Boundaries',
            content: '1. PHYSICAL BOUNDARIES\n   What physical activities, contact, and intimacy you\'re comfortable with\n\n2. EMOTIONAL BOUNDARIES\n   The level of emotional connection and vulnerability you\'re open to\n\n3. TIME BOUNDARIES\n   When and how often you\'re available for lifestyle activities\n\n4. PRIVACY BOUNDARIES\n   What personal information you share and with whom\n\n5. RELATIONSHIP BOUNDARIES\n   Rules and agreements within your primary relationship\n\n6. SOCIAL BOUNDARIES\n   How you interact in lifestyle spaces and who you connect with\n\nEach type requires separate consideration and clear communication.',
            type: 'key-point'
          },
          {
            heading: 'Deep Dive: Physical Boundaries',
            content: 'Physical boundaries are often what people think of first, but they\'re more nuanced than you might expect. Consider:\n\n• What types of touch are you comfortable with?\n• Are there specific activities that are off-limits?\n• Do your boundaries change based on attraction level?\n• Are there activities you\'ll do with some partners but not others?\n• Do you have boundaries around safer sex practices?\n• Are there body parts or zones that are not okay to touch?\n• Do your boundaries differ in group settings vs. one-on-one?\n\nBe specific. "I\'m okay with most things" is not a boundary—it\'s an invitation for confusion.',
            type: 'normal'
          },
          {
            heading: 'Emotional Boundaries: The Often-Overlooked Dimension',
            content: 'Physical boundaries get a lot of attention, but emotional boundaries are equally important. In the lifestyle, emotional boundaries might include:\n\n• Not sharing deeply personal life details with casual connections\n• Limiting communication frequency with play partners\n• Keeping certain activities exclusive to your primary relationship\n• Not developing romantic feelings for play partners\n• Maintaining appropriate relationship expectations\n• Protecting your primary relationship\'s emotional primacy\n\nEmotional boundaries prevent situations where play partners develop unexpected attachment or where your primary relationship feels threatened.',
            type: 'normal'
          },
          {
            heading: 'Common Emotional Boundary Mistakes',
            content: '🚫 Texting play partners more frequently than your primary partner\n🚫 Sharing relationship problems with play partners\n🚫 Seeking emotional support from connections instead of your partner\n🚫 Comparing partners or making one feel inferior\n🚫 Keeping secrets from your primary partner\n🚫 Allowing new connections to interfere with existing commitments\n\nThese patterns erode primary relationships and create complicated situations. Set clear emotional boundaries from the start.',
            type: 'warning'
          },
          {
            heading: 'Time Boundaries: Protecting Your Life Balance',
            content: 'The lifestyle can be exciting and all-consuming, but it shouldn\'t take over your life. Time boundaries help you maintain balance:\n\n• Designate specific days/times for lifestyle activities\n• Protect date nights with your primary partner\n• Maintain boundaries around work and family time\n• Set limits on messaging and app usage\n• Don\'t let lifestyle activities interfere with responsibilities\n• Schedule breaks to reconnect with your partner\n\nWithout time boundaries, the lifestyle can become overwhelming and damage your primary relationship.',
            type: 'normal'
          },
          {
            heading: 'Privacy Boundaries in the Digital Age',
            content: 'Privacy is crucial in the lifestyle. Consider what you share:\n\n📱 PROFILE INFORMATION\n• Do you use real names or lifestyle names?\n• Do you show your face in photos?\n• What personal details do you include?\n• Where do you mention you live?\n\n💬 CONVERSATIONS\n• How much about your vanilla life do you share?\n• Do you discuss your workplace or profession?\n• Do you share photos of your home or identifying locations?\n\n🤝 IN-PERSON MEETINGS\n• Do you give out your real phone number?\n• Do you meet in your own neighborhood?\n• Do you share your social media accounts?\n\nYour privacy boundaries should reflect your comfort level with potential exposure.',
            type: 'example'
          },
          {
            heading: 'Discovering Your Boundaries',
            content: 'Many people don\'t know their boundaries until they\'re crossed. Here\'s how to identify them proactively:\n\n1. REFLECT on past experiences\n   What felt good? What didn\'t?\n\n2. VISUALIZE scenarios\n   Imagine different situations—how do they make you feel?\n\n3. DISCUSS with your partner\n   What are their boundaries? Where do yours align?\n\n4. START CONSERVATIVE\n   It\'s easier to expand boundaries than heal from crossing them\n\n5. CHECK IN with yourself\n   How do you feel before, during, and after experiences?\n\nBoundaries aren\'t always obvious—they require self-awareness and honest self-reflection.',
            type: 'tip'
          },
          {
            heading: 'Communicating Your Boundaries Effectively',
            content: 'Knowing your boundaries is only half the battle—you must communicate them clearly:\n\n✅ BE DIRECT: "I\'m not comfortable with..." not "I don\'t think I want to..."\n✅ BE SPECIFIC: "No full swap" not "Let\'s take it slow"\n✅ BE CONFIDENT: State them as facts, not apologies\n✅ BE EARLY: Share boundaries before situations arise\n✅ BE CONSISTENT: Don\'t waffle or send mixed signals\n\nUse "I" statements:\n• "I need to check in with my partner first"\n• "I\'m not comfortable with that activity"\n• "I need to take a break"\n• "I\'d prefer to keep this interaction social tonight"',
            type: 'key-point'
          },
          {
            heading: 'When to Communicate Boundaries',
            content: 'TIMING IS EVERYTHING. Share boundaries:\n\n🕐 BEFORE MEETING\nIn initial messages, establish basic boundaries and expectations\n\n🕑 AT THE START OF DATES\n"Before we get too far, let\'s talk about what we\'re all comfortable with tonight"\n\n🕒 WHEN THINGS SHIFT\nIf the energy or activity level changes, check in\n\n🕓 IMMEDIATELY IF UNCOMFORTABLE\nDon\'t wait—speak up the moment something feels wrong\n\nNever assume others know your boundaries. Always communicate them explicitly.',
            type: 'normal'
          },
          {
            heading: 'Real-World Scenario: Boundary Communication',
            content: 'SITUATION: You\'re at a meet-and-greet and a couple invites you back to their place. You\'re attracted but not ready for play on a first meeting.\n\n❌ POOR RESPONSE:\n"Um, maybe... I\'ll see how I feel..."\n(Vague, unclear, leads to confusion)\n\n✅ GOOD RESPONSE:\n"We\'re definitely attracted and would love to get to know you better! Our boundary is that we don\'t play on first meetings—it helps us make sure the connection is right. Could we exchange numbers and plan something for next week?"\n\nThis is clear, confident, and leaves the door open while maintaining your boundary.',
            type: 'example'
          },
          {
            heading: 'Respecting Others\' Boundaries',
            content: 'When someone shares a boundary with you:\n\n✅ ACCEPT IT IMMEDIATELY\n   Don\'t question, negotiate, or ask for explanations\n\n✅ THANK THEM\n   "Thanks for being clear about that"\n\n✅ REMEMBER IT\n   Don\'t make them repeat their boundaries\n\n✅ HONOR IT COMPLETELY\n   Don\'t test or push boundaries\n\n✅ CHECK UNDERSTANDING\n   If unclear, ask clarifying questions\n\nRespecting boundaries isn\'t just about being a good person—it\'s about being a safe person to play with. Your reputation in the lifestyle depends on it.',
            type: 'key-point'
          },
          {
            heading: 'Red Flags: Boundary Violations to Watch For',
            content: '🚩 Someone asks you to keep secrets from your partner\n🚩 They pressure you after you\'ve said no\n🚩 They act hurt or angry when you set boundaries\n🚩 They "forget" boundaries you\'ve clearly stated\n🚩 They test boundaries to see what they can get away with\n🚩 They make you feel guilty for having boundaries\n🚩 They proceed with activities without clear consent\n\nThese behaviors indicate someone who doesn\'t respect boundaries. End the interaction immediately.',
            type: 'warning'
          },
          {
            heading: 'Boundaries Can Change—And That\'s Okay',
            content: 'Your boundaries aren\'t set in stone. They can and should evolve as you:\n\n• Gain experience and confidence\n• Discover new interests\n• Process past experiences\n• Change life circumstances\n• Grow in your relationships\n\nWhat\'s NOT okay:\n• Changing boundaries mid-scene without discussion\n• Feeling pressured to change boundaries\n• Ignoring your gut feelings to please others\n• Expanding boundaries before you\'re ready\n\nRegular check-ins with yourself and your partner help you understand when boundaries are naturally evolving vs. when you\'re compromising them under pressure.',
            type: 'normal'
          },
          {
            heading: 'Boundary Maintenance: The Ongoing Work',
            content: 'Setting boundaries once isn\'t enough. You must maintain them:\n\n1. REGULAR CHECK-INS\n   With yourself and your partner—are boundaries still serving you?\n\n2. AFTER-ACTION REVIEWS\n   After lifestyle experiences, discuss what worked and what didn\'t\n\n3. ADJUSTMENT AS NEEDED\n   If something doesn\'t feel right, it\'s okay to adjust\n\n4. CLEAR COMMUNICATION\n   If boundaries change, communicate the changes\n\n5. ACCOUNTABILITY\n   Hold yourself and your partner accountable to stated boundaries',
            type: 'tip'
          },
          {
            heading: 'When Boundaries Are Crossed',
            content: 'If your boundary is violated:\n\n1. STOP IMMEDIATELY\n   Use your safe word or clearly say "stop"\n\n2. REMOVE YOURSELF\n   Leave the situation if needed\n\n3. PROCESS YOUR FEELINGS\n   Talk to your partner about what happened\n\n4. ADDRESS IT DIRECTLY\n   Communicate with the person who crossed your boundary\n\n5. LEARN FROM IT\n   What can you do differently next time?\n\n6. CUT CONTACT IF NEEDED\n   If someone intentionally violated boundaries, end the connection\n\nYou are never wrong for enforcing your boundaries, even if it creates awkwardness or disappointment.',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Boundaries protect your well-being and enable authentic connection\n✅ Six types: Physical, Emotional, Time, Privacy, Relationship, Social\n✅ Communicate boundaries clearly, specifically, and confidently\n✅ Share boundaries early and often\n✅ Respect others\' boundaries without question or negotiation\n✅ Boundaries can evolve—that\'s healthy and normal\n✅ Red flags indicate people who don\'t respect boundaries—walk away\n✅ If boundaries are crossed, address it immediately\n✅ No explanation or justification needed for your boundaries\n\nMastering boundaries is essential for safe, fulfilling lifestyle experiences.',
            type: 'key-point'
          },
          {
            heading: 'Reflection Exercise',
            content: 'Before proceeding to the quiz, take 2-3 minutes to answer:\n\n• What are your three most important boundaries?\n• Have you communicated them clearly to your partner?\n• What boundary do you most struggle to enforce?\n• How will you handle it if someone crosses your boundary?\n\nWrite these down. Clear boundaries require conscious thought and commitment.',
            type: 'tip'
          }
        ]
      },
      'mod-3': {
        estimatedTime: '25-30 minutes',
        sections: [
          {
            heading: 'The Foundation: Consent',
            content: 'Consent is an enthusiastic, ongoing agreement to participate in any activity. In the lifestyle, consent isn\'t just important—it\'s the absolute foundation of everything we do. Without clear, genuine consent, no activity should proceed, period.\n\nThis module goes deep into the nuances of consent, negotiation, and ensuring everyone involved is truly on board—not just saying yes, but enthusiastically agreeing. We\'ll explore the FRIES model, practical negotiation techniques, and how to handle consent in real-time situations.',
            type: 'normal'
          },
          {
            heading: 'Why Consent Is Non-Negotiable',
            content: 'The lifestyle community is built on trust and mutual respect. Consent violations don\'t just harm individuals—they harm the entire community by:\n\n• Creating unsafe spaces\n• Destroying trust between community members\n• Giving the lifestyle a bad reputation\n• Potentially involving legal consequences\n• Causing lasting psychological harm\n\nOn the flip side, a culture of clear, enthusiastic consent creates:\n• Safe, exciting experiences\n• Deeper connections\n• Increased trust\n• Better experiences for everyone\n• A thriving, welcoming community',
            type: 'normal'
          },
          {
            heading: 'Common Myths About Consent',
            content: 'Let\'s clear up dangerous misconceptions:\n\n❌ MYTH: "If they\'re in a lifestyle space, they consent to activities"\n✅ TRUTH: Being in a space is not consent to anything\n\n❌ MYTH: "They consented last time, so it\'s okay now"\n✅ TRUTH: Consent must be obtained every single time\n\n❌ MYTH: "They didn\'t say no"\n✅ TRUTH: Only yes means yes. Silence or absence of no is not consent\n\n❌ MYTH: "They seemed into it"\n✅ TRUTH: Assumptions don\'t count. Verbal consent is required\n\n❌ MYTH: "It\'s too awkward to ask"\n✅ TRUTH: Asking for consent is sexy and shows respect\n\nThese myths have caused real harm. Know the truth.',
            type: 'warning'
          },
          {
            heading: 'The FRIES Model of Consent',
            content: 'FRIES is an acronym that defines the key elements of true consent:\n\nF - FREELY GIVEN\nConsent must be given without pressure, coercion, manipulation, or under the influence of substances that impair judgment\n\nR - REVERSIBLE\nAnyone can withdraw consent at any time, for any reason, without explanation or penalty\n\nI - INFORMED\nAll parties must fully understand what they\'re consenting to, including risks and implications\n\nE - ENTHUSIASTIC\nConsent should be clear, positive, and actively given—not reluctant or pressured\n\nS - SPECIFIC\nConsent to one activity doesn\'t mean consent to others. Each action requires separate consent',
            type: 'key-point'
          },
          {
            heading: 'Deep Dive: Freely Given Consent',
            content: 'Consent is NOT freely given when:\n\n🚫 Someone feels pressured or obligated\n🚫 There\'s a power imbalance (boss/employee, host/guest at party)\n🚫 Someone is intoxicated or under influence\n🚫 They\'re worried about consequences of saying no\n🚫 They\'re trying to please their partner\n🚫 They fear being judged or ostracized\n🚫 They\'ve been worn down by repeated asking\n\nTrue consent comes from a place of genuine desire and free choice. If someone seems hesitant, pause and check in. Better to have an awkward conversation than to proceed without true consent.',
            type: 'normal'
          },
          {
            heading: 'Understanding Reversible Consent',
            content: 'One of the most important aspects of consent: it can be withdrawn at ANY time.\n\nExamples of reversible consent:\n• Someone can say yes, then change their mind\n• You can be in the middle of an activity and stop\n• Previous consent doesn\'t mean automatic future consent\n• Being aroused doesn\'t mean you can\'t stop\n\nWhen someone withdraws consent:\n✅ STOP IMMEDIATELY\n✅ Don\'t ask why or try to convince them\n✅ Thank them for being honest\n✅ Don\'t make them feel guilty\n✅ Respect their decision completely\n\nAnyone who gets upset when consent is withdrawn is not safe to play with.',
            type: 'normal'
          },
          {
            heading: 'Informed Consent: Full Disclosure Required',
            content: 'People can\'t truly consent to something they don\'t fully understand. Informed consent requires disclosing:\n\n• What activities you want to engage in\n• Any potential risks or discomforts\n• Your STI status and safer sex practices\n• If others will be present or joining\n• If you\'ll be recording or taking photos\n• Any relationship status or commitments\n• Relevant health information\n• What happens if someone changes their mind\n\nWithholding information that could affect someone\'s decision is a violation of consent, even if they technically said yes.',
            type: 'key-point'
          },
          {
            heading: 'Case Study: Informed Consent Violation',
            content: 'SCENARIO:\nA couple agrees to play with another couple. During the encounter, the husband of the second couple reveals he and his wife have a "don\'t ask, don\'t tell" policy—she doesn\'t actually know about this encounter.\n\nWHY THIS IS WRONG:\nThe first couple consented to play with a consensual foursome. They did not consent to participate in cheating or deception. This is an informed consent violation because critical information was withheld.\n\nRIGHT APPROACH:\nFull disclosure before any interaction begins. If someone is hiding the encounter from a partner, that\'s a red flag and you should decline.',
            type: 'example'
          },
          {
            heading: 'Enthusiastic Consent: Yes Means YES',
            content: 'Enthusiastic consent is:\n\n✅ "Yes! I\'d love to"\n✅ "That sounds amazing"\n✅ "I\'ve been hoping you\'d ask"\n✅ Eager body language and engagement\n✅ Active participation\n\nEnthusiastic consent is NOT:\n\n❌ "I guess so"\n❌ "If you want to"\n❌ "I don\'t know..."\n❌ Silence or lack of resistance\n❌ Passive acceptance\n❌ Reluctant agreement\n\nIf someone doesn\'t seem enthusiastic, pause and check in. Aim for "Hell yes!" not "Well, okay..."',
            type: 'normal'
          },
          {
            heading: 'Specific Consent: Each Activity Requires Permission',
            content: 'Consent is not a blanket agreement. Just because someone consents to one thing doesn\'t mean they consent to everything.\n\nExamples:\n• Consenting to kissing ≠ consenting to sex\n• Consenting to soft play ≠ consenting to full swap\n• Consenting to photos in underwear ≠ consenting to nude photos\n• Consenting to a threesome ≠ consenting to a gangbang\n• Consenting Monday ≠ automatic consent on Tuesday\n\nEach escalation in activity requires explicit, verbal consent. Never assume.',
            type: 'warning'
          },
          {
            heading: 'The Art of Negotiation',
            content: 'Before any lifestyle interaction, negotiation should happen. This is where you discuss:\n\n1. DESIRES & INTERESTS\n   What activities interest everyone?\n\n2. BOUNDARIES & LIMITS\n   What\'s off the table?\n\n3. SAFER SEX PRACTICES\n   What protection will be used?\n\n4. RELATIONSHIP RULES\n   Any relationship-specific boundaries?\n\n5. CHECK-IN SIGNALS\n   How will people communicate during play?\n\n6. AFTER-CARE NEEDS\n   What does everyone need afterward?\n\nThis conversation should happen before clothes come off and emotions run high.',
            type: 'key-point'
          },
          {
            heading: 'Negotiation Framework: The Pre-Play Conversation',
            content: 'Here\'s a practical framework for lifestyle negotiations:\n\nSTEP 1: ESTABLISH COMFORT\n"Let\'s take a few minutes to make sure we\'re all on the same page"\n\nSTEP 2: DISCUSS INTERESTS\n"What activities sound fun to everyone?"\n\nSTEP 3: CLARIFY BOUNDARIES\n"Is there anything that\'s off-limits or that you need us to know?"\n\nSTEP 4: AGREE ON SAFER SEX\n"Let\'s talk about protection and safer sex practices"\n\nSTEP 5: CONFIRM ONGOING CONSENT\n"Remember, anyone can pause or stop at any time"\n\nSTEP 6: ESTABLISH SIGNALS\n"How should we check in with each other during play?"\n\nThis may feel formal, but it prevents 99% of consent issues.',
            type: 'tip'
          },
          {
            heading: 'Body Language and Nonverbal Cues',
            content: 'While verbal consent is required, pay attention to body language:\n\nENGAGED & CONSENTING:\n• Relaxed posture\n• Making eye contact\n• Smiling and laughing\n• Leaning in\n• Active participation\n• Reciprocating touch\n\nUNCOMFORTABLE OR UNSURE:\n• Tense body\n• Avoiding eye contact\n• Fake smiling\n• Pulling away\n• Passive or frozen\n• Distracted or distant\n\nIf you notice discomfort, STOP and check in verbally. Don\'t proceed based on assumptions.',
            type: 'normal'
          },
          {
            heading: 'Check-Ins During Play',
            content: 'Consent isn\'t just for the beginning—it\'s ongoing throughout. Check in regularly:\n\n💬 "Is this still feeling good?"\n💬 "Are you comfortable with this?"\n💬 "Should we keep going or pause?"\n💬 "How are you doing?"\n💬 "Do you want to continue?"\n\nThese micro-check-ins:\n• Ensure ongoing consent\n• Show you care about their experience\n• Create opportunities to adjust or stop\n• Build trust\n• Enhance the experience for everyone\n\nRegular check-ins don\'t ruin the mood—they enhance it by ensuring everyone is present and engaged.',
            type: 'tip'
          },
          {
            heading: 'Safe Words and Signals',
            content: 'Establish clear communication tools before play:\n\n🟢 GREEN: "I\'m good, keep going"\n🟡 YELLOW: "Slow down, I need a moment"\n🔴 RED: "Stop immediately"\n\nOr use a simple safe word that anyone can say to stop everything immediately.\n\nIMPORTANT:\n• Everyone must know and agree to the safe word/signals\n• Safe words must be respected IMMEDIATELY\n• Never shame someone for using a safe word\n• Check in if someone goes quiet or seems off\n\nSafe words are a critical safety tool—treat them seriously.',
            type: 'key-point'
          },
          {
            heading: 'Consent and Substances',
            content: 'Alcohol and substances complicate consent significantly:\n\n⚠️ GOLDEN RULE:\nIf someone is intoxicated, they cannot give valid consent to new activities or new partners.\n\n✅ SAFER APPROACH:\n• Negotiate while sober\n• Keep alcohol consumption light\n• Never initiate new activities when drunk\n• If someone is clearly intoxicated, decline respectfully\n• Wait for a sober encounter\n\nMany lifestyle venues have strict rules about intoxication for this exact reason. Your reputation depends on making safe choices.',
            type: 'warning'
          },
          {
            heading: 'What To Do If Consent Is Unclear',
            content: 'When in doubt, STOP and clarify:\n\n"Hey, I want to make sure you\'re comfortable. Are you good with this?"\n\n"You seem hesitant. Do you want to pause and talk?"\n\n"I\'m not sure if you\'re into this. Can we check in?"\n\nIt\'s better to break the momentum than to proceed without clear consent. Always err on the side of caution.\n\nIf someone can\'t give clear, enthusiastic consent, the answer is no—even if they\'re not explicitly saying no.',
            type: 'normal'
          },
          {
            heading: 'After-Play: The Debrief',
            content: 'After lifestyle interactions, debrief with your partner and, if appropriate, with play partners:\n\n✅ What went well?\n✅ What could be improved?\n✅ Did anyone feel uncomfortable at any point?\n✅ Were boundaries respected?\n✅ Is everyone feeling good emotionally?\n✅ What would you want to do differently next time?\n\nThis debrief:\n• Processes the experience\n• Identifies any issues\n• Strengthens communication\n• Improves future encounters\n• Ensures everyone is okay\n\nMake debriefing a standard practice.',
            type: 'normal'
          },
          {
            heading: 'Consent Violations: What They Look Like',
            content: '🚩 Proceeding after someone said no or seems uncertain\n🚩 Pressuring or guilting someone into activities\n🚩 Ignoring safe words or signals to stop\n🚩 Escalating activities without asking\n🚩 Removing protection without consent\n🚩 Including others without prior consent\n🚩 Recording or photographing without explicit permission\n🚩 Continuing when someone is clearly uncomfortable\n🚩 Taking advantage of intoxication\n🚩 Lying or withholding information\n\nAny of these is serious and disqualifying. Report violations to event organizers or community leaders.',
            type: 'warning'
          },
          {
            heading: 'If Your Consent Is Violated',
            content: 'If someone violates your consent:\n\n1. PRIORITIZE YOUR SAFETY\n   Leave the situation immediately if needed\n\n2. TELL YOUR PARTNER\n   Share what happened with your partner or trusted friend\n\n3. DOCUMENT\n   Write down what happened while it\'s fresh\n\n4. REPORT IF APPROPRIATE\n   Tell event organizers, venue owners, or community leaders\n\n5. SEEK SUPPORT\n   Process with your partner, friends, or a therapist\n\n6. CUT CONTACT\n   Block the person who violated your consent\n\nYou are not overreacting. Consent violations are serious and it\'s okay to take action.',
            type: 'normal'
          },
          {
            heading: 'Building a Consent Culture',
            content: 'You contribute to consent culture by:\n\n✅ Always asking explicitly for consent\n✅ Respecting "no" immediately and gracefully\n✅ Checking in during activities\n✅ Calling out consent violations when you see them\n✅ Supporting people who report violations\n✅ Educating others about consent\n✅ Making consent sexy and normal\n✅ Setting a good example\n\nEvery positive interaction strengthens the community. Every violation weakens it. Choose to be part of the solution.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Consent is mandatory—no exceptions\n✅ Use FRIES model: Freely given, Reversible, Informed, Enthusiastic, Specific\n✅ Each activity requires explicit consent\n✅ Negotiate before play—discuss desires, boundaries, safety\n✅ Check in regularly during activities\n✅ Use safe words and respect them immediately\n✅ Intoxication invalidates consent\n✅ When unclear, stop and clarify\n✅ Debrief after interactions\n✅ Report violations and support survivors\n\nMastering consent makes you a safe, trusted community member.',
            type: 'key-point'
          },
          {
            heading: 'Final Reflection',
            content: 'Before the quiz, consider:\n\n• Have you ever proceeded without enthusiastic consent?\n• How will you negotiate before your next interaction?\n• What will you do if you notice someone seems uncomfortable?\n• Are you prepared to stop immediately if needed?\n\nConsent is the foundation of everything. Take it seriously.',
            type: 'tip'
          }
        ]
      },
      'mod-4': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Why Difficult Conversations Matter',
            content: 'Not every conversation in the lifestyle is easy. Sometimes you need to address uncomfortable topics, deliver disappointing news, or navigate conflicts. These difficult conversations are where most people struggle—but they\'re also where strong communication skills have the biggest impact.\n\nAvoiding difficult conversations doesn\'t make problems go away. It makes them worse. Learning to handle these moments with grace, honesty, and respect is one of the most valuable skills you can develop.',
            type: 'normal'
          },
          {
            heading: 'Common Difficult Conversations in the Lifestyle',
            content: '• Declining an invitation or connection\n• Addressing boundary violations\n• Expressing hurt feelings or disappointment\n• Ending a play partnership\n• Discussing jealousy or insecurity\n• Addressing performance issues\n• Confronting dishonesty or rule-breaking\n• Discussing changing interests or desires\n• Managing expectations mismatches\n• Addressing hygiene or safety concerns\n\nEach of these requires courage, tact, and clear communication.',
            type: 'normal'
          },
          {
            heading: 'The Five Principles of Difficult Conversations',
            content: '1. TIMING: Choose the right moment and setting\n2. HONESTY: Be direct but compassionate\n3. RESPECT: Honor the other person\'s dignity\n4. CLARITY: Be specific about the issue\n5. SOLUTION-FOCUS: When possible, offer constructive paths forward\n\nThese principles ensure difficult conversations are productive rather than destructive.',
            type: 'key-point'
          },
          {
            heading: 'Choosing the Right Time and Place',
            content: 'Never have difficult conversations:\n❌ In public or at parties\n❌ In the heat of emotion\n❌ Late at night when tired\n❌ Via text or social media\n❌ When rushed or distracted\n\nInstead, choose:\n✅ Private, neutral settings\n✅ When both parties are calm\n✅ When you have adequate time\n✅ Face-to-face or video call\n✅ When you\'re prepared and composed\n\nTiming and setting significantly impact the outcome.',
            type: 'tip'
          },
          {
            heading: 'The "I" Statement Formula',
            content: 'Use this structure for addressing issues:\n\n"When [specific behavior], I felt [emotion], because [reason]. I need [request]."\n\nExamples:\n\n✅ "When you didn\'t check in during play last week, I felt uncomfortable, because we agreed on regular check-ins. I need us to stick to that agreement."\n\n✅ "When you shared details about our private life, I felt betrayed, because we agreed on discretion. I need you to respect our privacy boundaries."\n\nThis format is non-accusatory while being clear and specific.',
            type: 'example'
          },
          {
            heading: 'Scenario: Declining an Unwanted Invitation',
            content: 'THE SITUATION:\nA couple keeps inviting you to play, but you\'re not attracted. They\'re persistent.\n\n❌ BAD APPROACH:\n"We\'re busy" (vague excuse)\n"Maybe another time" (false hope)\nGhosting them\n\n✅ GOOD APPROACH:\n"We appreciate your interest and think you\'re wonderful people. We\'re looking for a different connection type, so we don\'t think we\'re the right match. We wish you the best in finding the right connections!"\n\nThis is clear, kind, and final. No room for misinterpretation.',
            type: 'example'
          },
          {
            heading: 'Addressing Boundary Violations',
            content: 'If someone crosses your boundaries, address it immediately:\n\n1. STATE THE VIOLATION\n"You touched me without asking, which crossed my boundary"\n\n2. EXPLAIN THE IMPACT\n"That made me uncomfortable and broke my trust"\n\n3. SET EXPECTATIONS\n"I need clear consent before any touch moving forward"\n\n4. CONSEQUENCES\n"If this happens again, we won\'t continue playing"\n\nBe firm and direct. Boundary violations are serious.',
            type: 'warning'
          },
          {
            heading: 'Managing Your Emotions',
            content: 'Before difficult conversations, manage your emotional state:\n\n• Take time to process your feelings first\n• Write down your thoughts to organize them\n• Practice what you want to say\n• Breathe deeply before starting\n• Remind yourself of your goal\n• Prepare for various responses\n\nEmotional regulation helps you stay clear and constructive, even when the topic is charged.',
            type: 'normal'
          },
          {
            heading: 'Listening During Difficult Conversations',
            content: 'These conversations aren\'t just about delivering your message—you must also listen:\n\n• Let them respond fully\n• Don\'t interrupt with rebuttals\n• Ask clarifying questions\n• Acknowledge their perspective\n• Look for common ground\n• Stay open to their experience\n\nEven when you disagree, make space for their viewpoint.',
            type: 'normal'
          },
          {
            heading: 'De-Escalation Techniques',
            content: 'If the conversation becomes heated:\n\n🔹 Lower your voice instead of raising it\n🔹 Slow down your speech\n🔹 Take breaks if needed\n🔹 Acknowledge their emotions\n🔹 Focus on the issue, not personal attacks\n🔹 Return to facts and specific behaviors\n🔹 Suggest continuing later if too emotional\n\nThe goal is resolution, not winning an argument.',
            type: 'tip'
          },
          {
            heading: 'Ending Play Partnerships Gracefully',
            content: 'Sometimes connections don\'t work out. End them with respect:\n\n"We\'ve enjoyed getting to know you, but we feel like the connection isn\'t quite right for what we\'re looking for. We wanted to be honest rather than ghost or fade away. We appreciate the experiences we\'ve shared and wish you well!"\n\nBe:\n• Honest but kind\n• Clear about the ending\n• Appreciative of positive moments\n• Firm in your decision\n• Brief (don\'t over-explain)',
            type: 'example'
          },
          {
            heading: 'When You\'re On the Receiving End',
            content: 'If someone brings a difficult topic to you:\n\n✅ Thank them for their honesty\n✅ Listen without interrupting\n✅ Ask for clarification if needed\n✅ Acknowledge their feelings\n✅ Take responsibility if appropriate\n✅ Work toward resolution\n✅ Don\'t get defensive\n\nHow you receive difficult feedback defines your character.',
            type: 'key-point'
          },
          {
            heading: 'Red Flags: Poor Handling of Difficult Conversations',
            content: '🚩 Becoming aggressive or threatening\n🚩 Making personal attacks\n🚩 Gaslighting or denying your experience\n🚩 Refusing to listen or engage\n🚩 Playing the victim\n🚩 Bringing up unrelated grievances\n🚩 Refusing to take any responsibility\n🚩 Storming off without resolution\n\nThese behaviors indicate someone who can\'t handle adult communication. Consider ending the connection.',
            type: 'warning'
          },
          {
            heading: 'The Follow-Up',
            content: 'After a difficult conversation:\n\n• Check in with your partner about how it went\n• Reflect on what you learned\n• Follow through on any commitments made\n• Give the other party space to process\n• Monitor if behavior changes as discussed\n• Be prepared to have follow-up conversations\n\nDifficult conversations are often just the start of resolving an issue.',
            type: 'normal'
          },
          {
            heading: 'Module Summary',
            content: '✅ Don\'t avoid difficult conversations—they don\'t go away\n✅ Choose appropriate timing and settings\n✅ Use "I" statements to express concerns\n✅ Be direct but compassionate\n✅ Listen as much as you speak\n✅ De-escalate when emotions run high\n✅ End connections gracefully when needed\n✅ Receive feedback with gratitude, not defensiveness\n\nMastering difficult conversations builds respect and trust.',
            type: 'key-point'
          }
        ]
      },
      'mod-5': {
        estimatedTime: '15 minutes',
        sections: [
          {
            heading: 'Active Listening: The Foundation of Connection',
            content: 'Active listening is the most underrated skill in the lifestyle. Most people think they\'re good listeners, but they\'re actually just waiting for their turn to talk. True active listening creates deeper connections, prevents misunderstandings, and shows respect.\n\nThis module teaches you how to become an exceptional listener—the kind of person others feel heard and understood by.',
            type: 'normal'
          },
          {
            heading: 'Why Active Listening Matters',
            content: 'In the lifestyle, active listening:\n\n• Builds trust and intimacy\n• Uncovers desires and boundaries\n• Prevents miscommunication\n• Makes others feel valued\n• Enhances every interaction\n• Deepens connections\n• Improves consent and safety\n\nPeople remember how you make them feel. Great listeners create unforgettable experiences.',
            type: 'normal'
          },
          {
            heading: 'The Components of Active Listening',
            content: '1. FULL ATTENTION: Eliminate distractions, be present\n2. EYE CONTACT: Show engagement with your gaze\n3. BODY LANGUAGE: Face them, lean in, nod\n4. NO INTERRUPTING: Let them finish completely\n5. PARAPHRASING: Reflect back what you heard\n6. ASKING QUESTIONS: Dig deeper with curiosity\n7. ACKNOWLEDGING EMOTIONS: Recognize how they feel\n8. WITHHOLDING JUDGMENT: Stay open and accepting',
            type: 'key-point'
          },
          {
            heading: 'The Phone Rule',
            content: 'THE RULE:\nWhen someone is sharing something important, your phone should be:\n\n📱 Face down\n📱 On silent\n📱 Not in your hand\n📱 Not checked "just quickly"\n📱 Completely ignored\n\nNothing says "you don\'t matter" like checking your phone mid-conversation. Your undivided attention is a gift.',
            type: 'tip'
          },
          {
            heading: 'The Power of Paraphrasing',
            content: 'Paraphrasing confirms understanding:\n\n"So what I\'m hearing is..."\n"Let me make sure I understand..."\n"It sounds like you\'re saying..."\n\nExample:\nThem: "I\'m nervous about full swap because my last experience was uncomfortable."\n\nYou: "So you\'re open to the idea but you want to make sure we\'re attentive to your comfort level since you had a bad experience before?"\n\nThis shows you truly listened and gives them a chance to clarify.',
            type: 'example'
          },
          {
            heading: 'Asking Powerful Questions',
            content: 'Move beyond surface level with deeper questions:\n\n❌ SURFACE: "So what are you into?"\n✅ DEEPER: "What draws you to the lifestyle?"\n\n❌ SURFACE: "Have you done this before?"\n✅ DEEPER: "What experiences have shaped your interests?"\n\n❌ SURFACE: "Are you having fun?"\n✅ DEEPER: "What\'s been the highlight of your experience so far?"\n\nDeeper questions show genuine interest and create meaningful conversations.',
            type: 'example'
          },
          {
            heading: 'Reading Between the Lines',
            content: 'Listen not just to words, but to:\n\n• Tone of voice\n• Pauses and hesitations\n• What\'s NOT being said\n• Energy shifts\n• Body language changes\n• Emotional undertones\n\nExample:\nIf someone says "I\'m fine with that" but their voice is flat and they\'re not making eye contact, they\'re probably NOT fine. Check in deeper.',
            type: 'normal'
          },
          {
            heading: 'Common Listening Mistakes',
            content: '❌ INTERRUPTING: Cutting them off to share your story\n❌ FIXING: Immediately offering solutions\n❌ MINIMIZING: "That\'s not a big deal"\n❌ ONE-UPPING: "You think that\'s bad? Listen to this..."\n❌ DISTRACTED: Looking around, multitasking\n❌ JUDGING: Visibly disapproving\n❌ INTERROGATING: Rapid-fire questions\n❌ PROJECTING: Assuming they feel like you would\n\nCatch yourself doing these and stop.',
            type: 'warning'
          },
          {
            heading: 'The 80/20 Rule',
            content: 'In initial conversations, aim to listen 80% of the time and talk 20%. This:\n\n• Helps you understand the other person\n• Shows you\'re interested in them\n• Builds rapport and trust\n• Uncovers compatibility\n• Makes them feel heard\n\nThe person who asks great questions and listens deeply is always more memorable than the person who dominates the conversation.',
            type: 'tip'
          },
          {
            heading: 'Reflective Listening for Emotions',
            content: 'When someone shares feelings, reflect them back:\n\nThem: "I felt embarrassed when that happened"\nYou: "That must have been really uncomfortable for you"\n\nThem: "I\'m excited but also nervous"\nYou: "So you\'re feeling a mix of anticipation and some anxiety?"\n\nThis validates their emotions and shows you\'re not just hearing words—you\'re understanding feelings.',
            type: 'example'
          },
          {
            heading: 'Module Summary',
            content: '✅ Active listening creates connection and trust\n✅ Give full attention—put away distractions\n✅ Use body language to show engagement\n✅ Paraphrase to confirm understanding\n✅ Ask deeper questions with genuine curiosity\n✅ Listen to emotions, not just words\n✅ Avoid common mistakes like interrupting or fixing\n✅ Follow the 80/20 rule—listen more than you talk\n\nBecoming a great listener transforms your lifestyle experience.',
            type: 'key-point'
          }
        ]
      },
      'mod-6': {
        estimatedTime: '35 minutes',
        sections: [
          {
            heading: 'Congratulations on Reaching the Final Module!',
            content: 'You\'ve learned the fundamentals of lifestyle communication, from clarity and honesty to boundaries, consent, difficult conversations, and active listening. This final module brings it all together with advanced techniques that will make you an exceptional communicator.\n\nThese advanced strategies separate good communicators from great ones. They\'ll help you navigate complex situations, build deeper connections, and become a respected member of the lifestyle community.',
            type: 'normal'
          },
          {
            heading: 'Advanced Communication Framework',
            content: 'The three-layer communication model:\n\n🎯 LAYER 1: CONTENT (What you say)\nThe actual words and information you communicate\n\n🎯 LAYER 2: EMOTION (How you say it)\nYour tone, energy, and emotional expression\n\n🎯 LAYER 3: INTENTION (Why you say it)\nYour underlying motive and desired outcome\n\nMastery means aligning all three layers. When they conflict, people sense inauthenticity.',
            type: 'key-point'
          },
          {
            heading: 'Reading Social Dynamics',
            content: 'At lifestyle events, reading the room is crucial:\n\n• Who\'s open to conversation vs. focused on their partner?\n• What\'s the energy level—playful, serious, intimate?\n• Who seems interested in you vs. being polite?\n• What are the unspoken rules of this particular space?\n• When is it appropriate to approach vs. wait to be approached?\n\nDevelop this social intelligence through observation and practice.',
            type: 'normal'
          },
          {
            heading: 'The Art of the Approach',
            content: 'Approaching others at lifestyle events:\n\n1. OBSERVE FIRST: Are they open to conversation?\n2. MAKE EYE CONTACT: Gauge interest through non-verbal signals\n3. APPROACH RESPECTFULLY: "Hi, is it okay if we join you?"\n4. READ RECEPTIVENESS: Warm welcome vs. polite but distant?\n5. ENGAGE GENUINELY: Ask questions, listen actively\n6. RESPECT CUES: Exit gracefully if interest isn\'t mutual\n\nThe approach sets the tone for everything that follows.',
            type: 'example'
          },
          {
            heading: 'Handling Rejection Gracefully',
            content: 'Not every approach will lead to connection. Handle rejection with class:\n\n✅ "Thanks for your time, enjoy your evening!"\n✅ "We appreciate you being direct—have a great night!"\n✅ "No worries at all, best of luck tonight!"\n\nDON\'T:\n❌ Ask "why not?" or argue\n❌ Get visibly upset or hurt\n❌ Make negative comments\n❌ Bad-mouth them to others\n❌ Keep trying after they\'ve declined\n\nHow you handle rejection demonstrates maturity and respect.',
            type: 'tip'
          },
          {
            heading: 'Creating Comfort Through Communication',
            content: 'Make others feel safe and comfortable through:\n\n• Clear communication about expectations\n• Respecting boundaries without question\n• Regular check-ins during interactions\n• Reading and responding to non-verbal cues\n• Matching their energy and pace\n• Giving them control and choices\n• Being consistent and reliable\n\nPeople who feel safe with you will be more open and authentic.',
            type: 'normal'
          },
          {
            heading: 'The Check-In Conversation Structure',
            content: 'For ongoing play relationships, regular check-ins are vital:\n\n1. RECENT POSITIVE: "What went well in our last encounter?"\n2. AREAS FOR IMPROVEMENT: "Is there anything we could do differently?"\n3. BOUNDARY UPDATES: "Have any boundaries changed?"\n4. DESIRES EXPLORATION: "Are there new interests you want to explore?"\n5. RELATIONSHIP HEALTH: "How are you feeling about our connection?"\n6. SCHEDULING: "What works for getting together next?"\n\nThis structure keeps communication flowing and prevents issues from building up.',
            type: 'key-point'
          },
          {
            heading: 'Managing Group Communication',
            content: 'When communicating with multiple people (group play, poly dynamics):\n\n• Address everyone, not just one person\n• Make sure all voices are heard\n• Check that everyone consents to decisions\n• Avoid side conversations that exclude others\n• Be aware of power dynamics\n• Ensure everyone feels included\n• Have separate one-on-one check-ins too\n\nGroup communication requires extra attention to fairness and inclusion.',
            type: 'normal'
          },
          {
            heading: 'Digital Communication Mastery',
            content: 'Advanced digital communication tips:\n\n📱 Response Time: Reply within 24 hours, or say you need more time\n📱 Message Quality: Put thought into your messages\n📱 Flirting vs. Planning: Know when to be playful vs. logistical\n📱 Photo Sharing: Get explicit consent before sending intimate images\n📱 Video Chats: Meet face-to-face before in-person meetings\n📱 Privacy: Use apps with good security features\n📱 Closing Loops: Always conclude conversations clearly\n\nYour digital communication reflects your overall communication quality.',
            type: 'tip'
          },
          {
            heading: 'The Art of Flirtation',
            content: 'Effective flirting in the lifestyle:\n\n• Be playful without being pushy\n• Compliment specifically and authentically\n• Create intrigue through conversation\n• Match their energy and reciprocation\n• Read signals—are they flirting back?\n• Know when flirting crosses into negotiation\n• Always leave them wanting more\n\nExample:\n"I love how you described that—you clearly have a thoughtful approach to the lifestyle" (specific compliment)\n\nvs.\n\n"You\'re hot" (generic, low-effort)',
            type: 'example'
          },
          {
            heading: 'Building Long-Term Connections',
            content: 'For ongoing play partnerships:\n\n• Consistent communication between meetings\n• Remembering details they\'ve shared\n• Celebrating milestones and special occasions\n• Being reliable with plans and commitments\n• Evolving together as interests change\n• Maintaining appropriate boundaries\n• Keeping things fresh and exciting\n\nLong-term lifestyle friendships are built on consistent, quality communication.',
            type: 'normal'
          },
          {
            heading: 'Cross-Cultural Communication',
            content: 'The lifestyle community is diverse. Navigate cultural differences:\n\n• Don\'t assume everyone shares your communication style\n• Ask about preferences and norms\n• Be patient with language barriers\n• Avoid culture-specific slang or references\n• Show extra care in seeking consent and checking understanding\n• Appreciate different approaches to intimacy and relationships\n• Learn from diverse perspectives\n\nCultural sensitivity enhances your ability to connect with a wider range of people.',
            type: 'normal'
          },
          {
            heading: 'Conflict Resolution Mastery',
            content: 'When conflicts arise:\n\n1. PAUSE: Don\'t react immediately in anger\n2. IDENTIFY THE CORE ISSUE: What\'s really bothering you?\n3. CHOOSE THE RIGHT TIME: When both parties are calm\n4. USE "I" STATEMENTS: Focus on your experience\n5. LISTEN TO UNDERSTAND: Not to counter-argue\n6. FIND COMMON GROUND: What do you both want?\n7. COLLABORATE ON SOLUTIONS: Work together\n8. FOLLOW UP: Check that the resolution is working\n\nEvery conflict successfully resolved strengthens the relationship.',
            type: 'key-point'
          },
          {
            heading: 'Your Communication Reputation',
            content: 'In the lifestyle, your reputation is everything. Build it through:\n\n✅ Consistent, honest communication\n✅ Respecting boundaries and consent\n✅ Following through on commitments\n✅ Handling difficult situations with grace\n✅ Being discreet and trustworthy\n✅ Treating everyone with respect\n✅ Contributing positively to the community\n\nYour reputation will precede you—make it a good one.',
            type: 'normal'
          },
          {
            heading: 'The Path Forward',
            content: 'You\'ve completed the Communication Fundamentals path! You\'ve learned:\n\n✅ Clear, honest communication basics\n✅ How to establish and maintain boundaries\n✅ Consent and negotiation mastery\n✅ Handling difficult conversations\n✅ Active listening skills\n✅ Advanced communication techniques\n\nBut learning doesn\'t end here. Every interaction is an opportunity to practice and refine these skills. Be patient with yourself as you apply what you\'ve learned.',
            type: 'key-point'
          },
          {
            heading: 'Final Module Summary',
            content: '✅ Align content, emotion, and intention in your communication\n✅ Read social dynamics at events\n✅ Approach respectfully and handle rejection gracefully\n✅ Create comfort through clear, consistent communication\n✅ Master both digital and in-person interaction\n✅ Build long-term connections through reliability\n✅ Navigate cultural differences with sensitivity\n✅ Resolve conflicts constructively\n✅ Build a reputation as a trusted communicator\n\nCongratulations on completing the Communication Fundamentals path! You\'re now equipped with the skills to navigate the lifestyle confidently and respectfully.',
            type: 'key-point'
          }
        ]
      },
      // Safety & Privacy Path Modules
      'mod-7': {
        estimatedTime: '20 minutes',
        sections: [
          {
            heading: 'Welcome to Digital Privacy Basics',
            content: 'In the lifestyle community, protecting your privacy and digital identity is paramount. This module will teach you essential strategies to maintain your anonymity, protect your personal information, and navigate the digital lifestyle world safely.\n\nWhether you\'re concerned about professional discretion, family privacy, or general safety, mastering digital privacy will give you confidence and peace of mind as you explore the lifestyle.',
            type: 'normal'
          },
          {
            heading: 'Why Digital Privacy Matters in the Lifestyle',
            content: 'The lifestyle community requires a unique level of discretion. Many participants:\n\n• Have professional careers that require privacy\n• Have family situations that necessitate discretion\n• Live in communities where lifestyle participation could cause issues\n• Value their privacy as a fundamental right\n• Want to control who knows about their lifestyle involvement\n\nPoor digital privacy can lead to unwanted exposure, professional consequences, relationship complications, or safety concerns.',
            type: 'normal'
          },
          {
            heading: 'The Five Pillars of Digital Privacy',
            content: '1. SEPARATION: Keep lifestyle and vanilla identities separate\n2. ANONYMITY: Use privacy-focused practices in all lifestyle platforms\n3. SECURITY: Protect accounts with strong passwords and 2FA\n4. DISCRETION: Be mindful of what you share and where\n5. CONTROL: Manage your digital footprint actively\n\nThese five pillars work together to create a comprehensive privacy strategy.',
            type: 'key-point'
          },
          {
            heading: 'Creating Your Lifestyle Identity',
            content: 'Establish a separate identity for lifestyle activities:\n\n📧 EMAIL: Create a dedicated email address for lifestyle sites\n• Use a privacy-focused provider (ProtonMail, Tutanota)\n• Never use your work or primary personal email\n• Choose a username unrelated to your real identity\n\n📱 PHONE NUMBER: Consider a separate number\n• Use Google Voice, Burner app, or similar services\n• Gives you control over who has your real number\n• Can be easily changed if needed\n\n👤 USERNAME: Choose carefully\n• No connection to your real name\n• Don\'t reuse usernames from other platforms\n• Avoid identifying details (city, profession, birth year)',
            type: 'example'
          },
          {
            heading: 'Profile Photo Privacy',
            content: 'Your photos can reveal more than you think:\n\n🚫 AVOID:\n• Photos used on other social media accounts\n• Images with identifiable backgrounds (your home, workplace)\n• Photos with visible tattoos, unique jewelry, or distinguishing features\n• Images that show your car license plate or house number\n• Pictures with other people without their consent\n\n✅ SAFE PRACTICES:\n• Use photos taken specifically for lifestyle profiles\n• Crop out identifying backgrounds\n• Consider blurring faces until you\'re comfortable\n• Use lifestyle-specific photos that don\'t appear elsewhere\n• Be mindful of EXIF data (location info embedded in photos)\n\nMany apps strip EXIF data automatically, but verify this.',
            type: 'warning'
          },
          {
            heading: 'Location Privacy',
            content: 'Never share your exact location publicly:\n\n• List your city or region, not specific neighborhoods\n• Meet in public places for first meetings, never at home\n• Be vague about where you work\n• Don\'t post geo-tagged photos from home\n• Turn off location services for lifestyle apps\n• Use general descriptors ("north side of the city")\n\nThe lifestyle community is often smaller than you think—specific location details make it easy to identify you.',
            type: 'normal'
          },
          {
            heading: 'Password Security Essentials',
            content: 'Protect your accounts with strong security:\n\n🔐 PASSWORD RULES:\n• Use unique passwords for each lifestyle site\n• Minimum 12 characters, mix of letters, numbers, symbols\n• Never use personal information (names, birthdays)\n• Use a password manager (1Password, Bitwarden, LastPass)\n• Change passwords if you suspect any compromise\n\n🔐 TWO-FACTOR AUTHENTICATION (2FA):\n• Enable 2FA on all lifestyle accounts that offer it\n• Use authenticator apps (Google Authenticator, Authy)\n• Avoid SMS-based 2FA if possible (less secure)\n\nYour accounts contain private conversations, photos, and connections—protect them.',
            type: 'key-point'
          },
          {
            heading: 'Social Media Separation',
            content: 'Keep your vanilla and lifestyle worlds separate:\n\n❌ DON\'T:\n• Connect your lifestyle profiles to Facebook/Instagram\n• Use "Login with Facebook/Google" on lifestyle sites\n• Friend lifestyle connections on personal social media\n• Post lifestyle content on vanilla accounts\n• Use the same profile pictures across platforms\n\n✅ DO:\n• Keep accounts completely separate\n• Use different email addresses\n• Maintain distinct online personas\n• Be cautious about what you "like" or comment on\n• Consider separate devices if you\'re very privacy-conscious',
            type: 'warning'
          },
          {
            heading: 'Reverse Image Search Awareness',
            content: 'Anyone can reverse search your photos to find other accounts:\n\n🔍 HOW IT WORKS:\nSomeone can take your lifestyle photo and search Google Images, TinEye, or other services to see if it appears elsewhere online.\n\n🛡️ PROTECTION:\n• Never use the same photos across lifestyle and vanilla platforms\n• Take separate photos specifically for lifestyle use\n• Regularly check your photos using reverse image search yourself\n• If you find your photos appearing where they shouldn\'t, take action\n\nThis is one of the most common ways people\'s lifestyle involvement is discovered.',
            type: 'tip'
          },
          {
            heading: 'Digital Communication Security',
            content: 'When chatting with lifestyle connections:\n\n💬 SECURE MESSAGING:\n• Use apps with end-to-end encryption (Signal, Telegram)\n• Be cautious with photos and videos sent via message\n• Assume anything you send could be screenshot\n• Use disappearing messages when available\n• Don\'t share intimate content until you trust someone\n\n📧 EMAIL SAFETY:\n• Use your dedicated lifestyle email only\n• Be cautious about clicking links in emails\n• Watch for phishing attempts\n• Never send sensitive info via unencrypted email',
            type: 'normal'
          },
          {
            heading: 'The Screenshot Reality',
            content: 'CRITICAL TRUTH: Anything you send digitally can be captured and shared.\n\n• Messages can be screenshot\n• Photos can be saved\n• Videos can be recorded\n• Voice messages can be recorded\n\nBefore sending anything ask yourself: "Would I be okay if this was shared beyond this person?" If the answer is no, don\'t send it.\n\nThis doesn\'t mean don\'t trust anyone—it means be thoughtful about what you share and with whom.',
            type: 'warning'
          },
          {
            heading: 'Managing Your Digital Footprint',
            content: 'Actively manage what\'s out there about you:\n\n🔍 REGULAR AUDITS:\n• Google your lifestyle username periodically\n• Search your photos using reverse image search\n• Check if your information appears on lifestyle forums\n• Monitor where your profile might be linked\n\n🧹 CLEANUP:\n• Delete old profiles you no longer use\n• Remove photos from sites you\'ve left\n• Request removal from forums if your info appears without consent\n• Update privacy settings regularly\n\nYour digital footprint grows over time—regular maintenance is essential.',
            type: 'tip'
          },
          {
            heading: 'Device Security',
            content: 'Your devices contain your lifestyle activity:\n\n📱 PHONE SECURITY:\n• Use strong passcode/biometric lock\n• Enable "require password immediately" after lock\n• Use private browsing for lifestyle sites\n• Clear browser history regularly\n• Use separate apps for lifestyle email/messaging\n• Consider app-locking sensitive apps (AppLock, Norton App Lock)\n\n💻 COMPUTER SECURITY:\n• Use private/incognito browsing mode\n• Clear cookies and cache regularly\n• Don\'t save passwords in shared browsers\n• Log out of lifestyle sites when done\n• Use encrypted folders for sensitive files\n\nIf you share devices, be extra cautious.',
            type: 'example'
          },
          {
            heading: 'Public Wi-Fi Risks',
            content: 'Public Wi-Fi is convenient but risky:\n\n⚠️ DANGERS:\n• Unencrypted networks allow others to see your activity\n• "Man-in-the-middle" attacks can intercept data\n• Fake Wi-Fi networks can steal information\n\n🛡️ PROTECTION:\n• Avoid accessing lifestyle sites on public Wi-Fi\n• Use a VPN (Virtual Private Network) if you must\n• Stick to cellular data for sensitive activities\n• Never enter passwords on public networks\n\nWait until you\'re on a secure network for lifestyle activities.',
            type: 'warning'
          },
          {
            heading: 'VPN Basics for Lifestyle Privacy',
            content: 'A VPN (Virtual Private Network) adds an extra layer of privacy:\n\n✅ BENEFITS:\n• Hides your IP address and location\n• Encrypts your internet traffic\n• Prevents ISP from seeing your browsing\n• Useful when traveling or on public networks\n\n🔍 CHOOSING A VPN:\n• Use reputable paid services (ExpressVPN, NordVPN, ProtonVPN)\n• Avoid free VPNs (often sell your data)\n• Check for no-logs policy\n• Ensure it works on all your devices\n\nVPNs aren\'t perfect, but they significantly increase privacy.',
            type: 'tip'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Separate your lifestyle and vanilla digital identities completely\n✅ Use dedicated email and phone number for lifestyle activities\n✅ Never reuse photos across lifestyle and vanilla platforms\n✅ Protect accounts with strong passwords and 2FA\n✅ Be mindful of location information in profiles and photos\n✅ Assume anything you send digitally can be captured\n✅ Regularly audit your digital footprint\n✅ Secure your devices with locks and private browsing\n✅ Avoid public Wi-Fi for lifestyle activities\n✅ Consider using a VPN for additional privacy\n\nDigital privacy requires ongoing attention, but these practices will protect your identity and give you confidence to enjoy the lifestyle safely.',
            type: 'key-point'
          }
        ]
      },
      'mod-8': {
        estimatedTime: '25 minutes',
        sections: [
          {
            heading: 'Meeting Safely: Your Essential Guide',
            content: 'First meetings in the lifestyle are exciting but require careful safety planning. This module covers best practices for meeting new connections safely, from initial contact through the first face-to-face encounter.\n\nYour safety is non-negotiable. Following these guidelines significantly reduces risk while allowing you to explore connections with confidence.',
            type: 'normal'
          },
          {
            heading: 'The Three Phases of Safe Meeting',
            content: '🔹 PHASE 1: Digital Vetting (Before Meeting)\nThorough conversation and verification online\n\n🔹 PHASE 2: Public First Meeting (The Meet & Greet)\nMeeting in a safe public location\n\n🔹 PHASE 3: Private Encounters (Only After Trust)\nProgressing to private settings once safety is established\n\nNever skip phases—each builds trust and assesses safety.',
            type: 'key-point'
          },
          {
            heading: 'Phase 1: Digital Vetting',
            content: 'Before agreeing to meet, thoroughly vet potential connections:\n\n✅ ADEQUATE CONVERSATION:\n• Exchange messages over several days/weeks\n• Have multiple conversations on different topics\n• Ask questions about their lifestyle experience\n• Discuss expectations, boundaries, and interests\n• Video chat before meeting in person\n\n✅ VERIFICATION:\n• Request a live video chat (not just photos)\n• Ask for a "verification photo" with specific pose/sign\n• Check if their profile seems authentic vs. catfish\n• Trust your instincts—if something feels off, it probably is\n\n🚩 RED FLAGS DURING VETTING:\n• Rushing to meet in person\n• Refusing video verification\n• Inconsistent stories or information\n• Pressuring for explicit content\n• Unwilling to discuss boundaries or safety',
            type: 'example'
          },
          {
            heading: 'Setting Up the First Meeting',
            content: 'When planning your first in-person meeting:\n\n📍 LOCATION CHOICE:\n• Always meet in PUBLIC first\n• Choose busy, well-lit venues (restaurant, coffee shop, bar)\n• Pick neutral territory (not near anyone\'s home/work)\n• Familiar location where you know the area\n• Place with easy exits and parking\n\n⏰ TIMING:\n• Daytime or early evening preferred for first meetings\n• Avoid late night meetings initially\n• Choose a time when the venue will be reasonably busy\n\n🚗 TRANSPORTATION:\n• Drive yourself or use your own transportation\n• Never get in someone\'s car on first meeting\n• Park in well-lit, visible areas\n• Have a clear exit strategy',
            type: 'key-point'
          },
          {
            heading: 'The Safety Plan: Essential Steps',
            content: 'EVERY first meeting should include a safety plan:\n\n1️⃣ TELL SOMEONE:\n• Share who you\'re meeting (name, photos, profile)\n• Provide the location and time\n• Share license plate number if you have it\n• Give expected return time\n\n2️⃣ SCHEDULED CHECK-INS:\n• Arrange to text a friend at specific times\n• Use code words for "I\'m fine" vs "I need help"\n• Set up "if you don\'t hear from me by X time" protocol\n\n3️⃣ KEEP YOUR PHONE:\n• Fully charged before the meeting\n• Keep it on you at all times\n• Have emergency contacts easily accessible\n• Location sharing turned on with trusted friend\n\n4️⃣ PLAN YOUR EXIT:\n• Have a pre-planned excuse to leave if needed\n• Keep your car keys accessible\n• Know where exits are located\n• Have backup transportation option',
            type: 'warning'
          },
          {
            heading: 'The Meet & Greet: Best Practices',
            content: 'During your first face-to-face meeting:\n\n✅ ARRIVAL:\n• Arrive separately (don\'t be picked up)\n• Get there a few minutes early to scope the venue\n• Let your safety contact know you\'ve arrived\n• Sit in a visible, central area\n\n✅ DURING:\n• Stay in the public space—don\'t go to cars, homes, or private areas\n• Keep your drink in sight at all times\n• Watch your alcohol consumption\n• Pay attention to your instincts\n• Watch for red flag behaviors\n\n✅ DEPARTURE:\n• Leave separately\n• Don\'t share which car is yours initially\n• Let your safety contact know you\'re leaving\n• Don\'t invite them to follow you home',
            type: 'normal'
          },
          {
            heading: 'Substance Safety',
            content: 'Alcohol and substances require extra caution:\n\n🍷 ALCOHOL AWARENESS:\n• Set a limit before you arrive and stick to it\n• Never leave your drink unattended\n• Order drinks yourself directly from staff\n• Decline drinks that you didn\'t see poured\n• Watch for signs your drink may be tampered with (unexpected effects)\n\n🚫 DRUGS:\n• Never accept recreational drugs from people you just met\n• Be aware that impairment affects judgment and safety\n• If you choose to use substances, ensure you\'re with trusted people\n• Have a sober safety person with you\n\nImpairment makes you vulnerable—stay in control, especially on first meetings.',
            type: 'warning'
          },
          {
            heading: 'Reading the Room: Safety Intuition',
            content: 'Trust your instincts—your gut feeling exists for a reason:\n\n🚩 CONCERNING BEHAVIORS:\n• They seem very different from their online persona\n• Inappropriate touching or boundary testing\n• Pressuring you to drink more or go somewhere private\n• Getting aggressive or overly sexual in public\n• Disrespecting your boundaries or requests\n• Making you feel uncomfortable or unsafe\n• Talking badly about previous partners\n• Showing signs of jealousy or possessiveness\n\nIf something feels off, trust that feeling and end the meeting. You don\'t owe anyone an explanation.',
            type: 'warning'
          },
          {
            heading: 'Ending a Meeting Safely',
            content: 'How to conclude a first meeting:\n\n👍 IF IT WENT WELL:\n• Thank them for the meeting\n• Discuss next steps if interested\n• Exchange additional contact info if comfortable\n• Plan future meetings appropriately\n• Still leave separately\n\n👎 IF YOU\'RE NOT INTERESTED:\n• Be polite but clear\n• "Thank you for meeting me, but I don\'t think we\'re the right match"\n• Don\'t make false promises or leave hope\n• It\'s okay to be direct—honesty is respectful\n\n🚨 IF YOU FEEL UNSAFE:\n• Make an excuse and leave immediately\n• "I\'m not feeling well, I need to go"\n• Go to staff if you need help\n• Call your safety contact\n• Don\'t worry about being rude—prioritize your safety',
            type: 'example'
          },
          {
            heading: 'After the First Meeting',
            content: 'Once you\'re home safely:\n\n✅ CHECK IN:\n• Text your safety contact that you\'re home\n• Debrief with your partner about the meeting\n• Process your impressions and feelings\n\n✅ FOLLOW UP:\n• Send a polite message thanking them\n• Be honest about your interest level\n• If you\'re interested, plan next steps\n• If not interested, communicate clearly\n\n✅ DOCUMENT:\n• Keep records of conversations\n• Note any red flags or concerns\n• Save their contact info and profile details\n• Trust your gut on whether to proceed',
            type: 'normal'
          },
          {
            heading: 'Progressing to Private Meetings',
            content: 'Only progress to private settings after establishing trust:\n\n⏳ TIMELINE:\n• Meet multiple times in public first\n• Video chat between public meetings\n• Verify they are who they claim to be\n• Ensure no red flags have appeared\n• Feel genuinely comfortable and safe\n\n🏠 PRIVATE MEETING SAFETY:\n• Still tell someone where you\'ll be\n• Share the address with your safety contact\n• Maintain check-in schedule\n• Have transportation arranged\n• Meet at a hotel for first private meeting (neutral ground)\n• Don\'t host at your home initially\n• Keep your safety plan active',
            type: 'key-point'
          },
          {
            heading: 'Hotel Safety for Lifestyle Meets',
            content: 'If meeting at a hotel:\n\n✅ BOOKING:\n• Book the room yourself when possible\n• Use a hotel in a safe area\n• Choose reputable hotel chains\n• Don\'t share the room number until you\'re there\n\n✅ ARRIVAL:\n• Check in yourself\n• Have your safety contact know the hotel and room number\n• Do a quick check of the room when you arrive\n• Keep phone charged and accessible\n• Know where exits are located\n\n✅ SAFETY MEASURES:\n• Keep the door unlocked if it makes you feel safer (know exit path)\n• Maintain your check-in schedule\n• Don\'t be afraid to end things if uncomfortable\n• Have your own transportation',
            type: 'example'
          },
          {
            heading: 'Couple Safety Dynamics',
            content: 'For couples in the lifestyle:\n\n👫 TOGETHER IS SAFER:\n• Meet as a couple when possible\n• Look out for each other\n• Have private check-in signals between you\n• Discuss boundaries before meeting\n• Debrief together afterward\n\n🚨 SEPARATION CONCERNS:\n• If playing separately, use all the same safety measures\n• More frequent check-ins with partner\n• Clear boundaries about timing and contact\n• Immediate communication if anything feels wrong\n\nYour partner is your built-in safety person—utilize that.',
            type: 'normal'
          },
          {
            heading: 'When Things Go Wrong',
            content: 'If you experience a safety issue:\n\n🚨 IMMEDIATE DANGER:\n• Leave immediately\n• Go to a safe public place\n• Call 911 if threatened or assaulted\n• Contact your safety person\n• Don\'t worry about being polite\n\n📢 AFTER THE FACT:\n• Report to lifestyle event organizers/site admins\n• Document everything that happened\n• Block the person on all platforms\n• Warn trusted community members if appropriate\n• Consider reporting to authorities if laws were broken\n• Seek support from community or professionals\n\nYour experience matters, and reporting helps protect others.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Never skip the digital vetting phase—verify before meeting\n✅ First meetings always in public, busy locations\n✅ Create and follow a safety plan for every meeting\n✅ Tell someone where you\'re going and check in regularly\n✅ Control your alcohol/substance intake\n✅ Trust your instincts—leave if something feels off\n✅ Take your own transportation\n✅ Progress slowly to private meetings only after trust is built\n✅ Use hotels for first private encounters\n✅ Report safety concerns to protect yourself and others\n\nSafe meeting practices protect you while allowing you to explore connections with confidence.',
            type: 'key-point'
          }
        ]
      },
      'mod-9': {
        estimatedTime: '20 minutes',
        sections: [
          {
            heading: 'Recognizing Red Flags: Your Early Warning System',
            content: 'Red flags are warning signs that someone may be unsafe, dishonest, or problematic. Learning to recognize these signs early can prevent uncomfortable situations, bad experiences, or even dangerous encounters.\n\nThis module teaches you to identify red flags at every stage of interaction—from online profiles through in-person meetings—so you can make informed decisions about who to trust.',
            type: 'normal'
          },
          {
            heading: 'Why Red Flag Recognition Matters',
            content: 'The lifestyle community is generally wonderful, but like any community, it has people who:\n\n• Don\'t respect boundaries\n• Are dishonest about their situation\n• Have harmful intentions\n• Lack emotional maturity\n• Are unreliable or inconsistent\n\nRecognizing red flags early allows you to:\n✅ Avoid unsafe situations\n✅ Save time and emotional energy\n✅ Protect yourself and your partner\n✅ Focus on positive connections\n✅ Build a better lifestyle experience',
            type: 'normal'
          },
          {
            heading: 'Profile Red Flags',
            content: 'Warning signs in online profiles:\n\n🚩 VAGUE OR INCOMPLETE PROFILES:\n• No face photo or all blurry photos\n• Very little written information\n• Contradictory information\n• No mention of boundaries or expectations\n\n🚩 SEXUAL AGGRESSION:\n• Overtly sexual profile without substance\n• Crude or disrespectful language\n• Focus solely on physical acts\n• No mention of connection or compatibility\n\n🚩 UNREALISTIC PHOTOS:\n• All photos look professional/model quality\n• Photos appear stolen from internet\n• Inconsistent appearance across photos\n• Only group photos (unclear who they are)',
            type: 'warning'
          },
          {
            heading: 'Initial Communication Red Flags',
            content: '🚩 RUSHING THE PROCESS:\n"Let\'s meet tonight"\n"Send me nude photos right away"\n"I don\'t do video calls, let\'s just meet"\n\n🚩 BOUNDARY TESTING:\n• Asking personal questions too soon\n• Requesting explicit content immediately\n• Pushing against stated boundaries\n• Getting upset when you maintain boundaries\n\n🚩 COMMUNICATION PATTERNS:\n• Only available at odd hours (may be hiding from partner)\n• Sporadic responses with no explanation\n• Avoiding direct answers to questions\n• Becoming defensive when asked reasonable questions\n• Love bombing (excessive flattery immediately)\n\n🚩 REFUSING VERIFICATION:\n• Won\'t video chat\n• Won\'t send verification photo\n• Makes excuses about why they can\'t verify\n• Gets angry when asked to verify',
            type: 'warning'
          },
          {
            heading: 'Relationship Status Red Flags',
            content: '🚩 DISHONESTY ABOUT RELATIONSHIP STATUS:\n"My partner doesn\'t need to know"\n"We have a don\'t ask, don\'t tell arrangement"\n"I\'m working on getting permission"\n"My partner is okay with it, I just can\'t prove it"\n\n🚩 CHEATING INDICATORS:\n• Only available at specific times\n• Reluctant to introduce you to their partner\n• Partner never appears in photos or conversations\n• Asks you to keep the connection secret\n• Can\'t meet during normal hours\n• Becomes defensive about partner questions\n\nNEVER participate in cheating—it harms the community and puts you at risk.',
            type: 'warning'
          },
          {
            heading: 'Behavioral Red Flags',
            content: '🚩 DISRESPECT:\n• Rude to service staff (shows true character)\n• Makes derogatory comments about others\n• Speaks badly about previous partners\n• Displays racist, sexist, or discriminatory attitudes\n• Dismissive of your opinions or feelings\n\n🚩 AGGRESSION:\n• Quick to anger\n• Aggressive communication style\n• Intimidating behavior\n• Punching walls, throwing objects\n• "Jokes" about violence\n• Road rage or similar outbursts\n\n🚩 JEALOUSY/POSSESSIVENESS:\n• Uncomfortable with you talking to others\n• Wants to know where you are constantly\n• Makes possessive comments\n• Displays jealousy in swinging context (ironic but problematic)\n• Tries to isolate you from others',
            type: 'warning'
          },
          {
            heading: 'Consent and Boundary Red Flags',
            content: '🚩 BOUNDARY VIOLATIONS:\n• Touching without permission\n• Escalating activities without asking\n• "Accidentally" crossing stated boundaries\n• Trying to negotiate boundaries\n• Making you feel bad for having boundaries\n• Testing limits to see what they can get away with\n\n🚩 CONSENT ISSUES:\n• Pressuring for activities after you\'ve said no\n• "Just this once" or "You\'ll like it"\n• Continuing after you\'ve asked to stop\n• Ignoring safe words\n• Proceeding when you\'re intoxicated\n• Assuming silence means yes\n\nThese are SERIOUS red flags—end the interaction immediately.',
            type: 'warning'
          },
          {
            heading: 'Financial Red Flags',
            content: '🚩 MONEY REQUESTS:\n• Asking for money\n• Wanting you to pay for everything\n• "Can you help me with rent/bills?"\n• Selling content or services (if you\'re not seeking that)\n• MLM or business pitches\n• "Investment opportunities"\n\n🚩 SCAM INDICATORS:\n• Story seems rehearsed or familiar\n• Sudden emergency requiring money\n• Asks for gift cards or wire transfers\n• Too good to be true\n• Pressures for quick decisions\n\nThe lifestyle isn\'t transactional—legitimate connections don\'t involve money requests.',
            type: 'warning'
          },
          {
            heading: 'Safety and Health Red Flags',
            content: '🚩 SAFER SEX RESISTANCE:\n• Reluctant to use protection\n• "I\'m clean, don\'t worry"\n• Pressures for unprotected activities\n• Removes condom without consent (stealthing)\n• Unclear about STI testing status\n• Dismissive of sexual health discussions\n\n🚩 SUBSTANCE ISSUES:\n• Excessive drinking\n• Pressure you to drink or use substances\n• Impaired judgment\n• Substance use affecting behavior\n• Can\'t enjoy lifestyle without substances\n\n🚩 PHYSICAL SAFETY CONCERNS:\n• Suggests isolated meeting locations\n• Wants to pick you up (control of transportation)\n• Tries to get you alone quickly\n• Makes you feel physically unsafe\n• Aggressive physicality',
            type: 'warning'
          },
          {
            heading: 'Online Scams and Catfishing',
            content: '🚩 CATFISH INDICATORS:\n• Photos look too perfect or model-like\n• Reverse image search finds photos elsewhere\n• Refuses to video chat\n• Stories don\'t add up\n• Always has excuses for not meeting\n• Asks for explicit content but won\'t reciprocate\n\n🚩 COMMON SCAMS:\n• "Verification fee" scams\n• "I need you to sign up on this site"\n• Phishing links\n• Blackmail attempts\n• Identity theft attempts\n\nLegitimate lifestyle members don\'t ask for money, fees, or personal information like SSN.',
            type: 'warning'
          },
          {
            heading: 'Social and Community Red Flags',
            content: '🚩 REPUTATION ISSUES:\n• Other community members warn about them\n• Banned from events or sites\n• Multiple people have had problems with them\n• Dismissive of community concerns\n• "Everyone else is the problem"\n\n🚩 DRAMA PATTERNS:\n• Constant conflict with others\n• Always has drama or crisis\n• Speaks badly about entire community\n• Burned bridges everywhere\n• Takes no responsibility for conflicts\n\nPay attention when the community warns you—they\'re often protecting you.',
            type: 'warning'
          },
          {
            heading: 'Gut Feeling: The Ultimate Red Flag',
            content: 'Your intuition is powerful:\n\n🎯 TRUST YOUR GUT:\n"Something feels off but I can\'t explain it"\n"I feel uncomfortable around them"\n"This doesn\'t feel right"\n"I\'m making excuses for their behavior"\n"I feel pressured or anxious"\n\nYour subconscious picks up on details you might not consciously notice. If something feels wrong, honor that feeling—even if you can\'t articulate exactly why.\n\nYou don\'t need a logical reason to end an interaction. "I\'m not comfortable" is enough.',
            type: 'key-point'
          },
          {
            heading: 'What to Do When You See Red Flags',
            content: '1️⃣ ACKNOWLEDGE IT:\nDon\'t ignore or rationalize red flags away\n\n2️⃣ ASSESS SEVERITY:\n• Minor flag: Proceed cautiously, watch for more\n• Major flag: End the interaction\n• Safety flag: End immediately and protect yourself\n\n3️⃣ COMMUNICATE:\n• Tell your partner\n• Discuss concerns with trusted friends\n• Report serious issues to site admins/event organizers\n\n4️⃣ TAKE ACTION:\n• End communication if appropriate\n• Block on all platforms\n• Warn others if it\'s a safety concern\n• Report to authorities if laws broken\n\n5️⃣ DON\'T SECOND-GUESS:\n• You don\'t owe anyone a chance\n• Better safe than sorry\n• Your safety > their feelings',
            type: 'example'
          },
          {
            heading: 'Green Flags: What to Look For',
            content: 'Positive signs of safe, healthy connections:\n\n✅ RESPECT:\n• Respects boundaries immediately\n• Communicates clearly and honestly\n• Values consent\n• Treats everyone well\n\n✅ TRANSPARENCY:\n• Open about their situation\n• Partner is aware and involved\n• Willing to verify identity\n• Consistent information\n\n✅ PATIENCE:\n• Willing to take time to build trust\n• No pressure or rushing\n• Understanding of safety concerns\n• Respects your pace\n\n✅ COMMUNITY STANDING:\n• Good reputation in community\n• Referenced positively by others\n• Active in lifestyle events\n• Long-term presence\n\nGreen flags indicate someone worth investing time in.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Red flags are warning signs—don\'t ignore them\n✅ Watch for profile inconsistencies and vague information\n✅ Rushing, boundary testing, and consent issues are serious red flags\n✅ Relationship dishonesty puts you at risk—avoid it\n✅ Behavioral issues like aggression and jealousy are disqualifying\n✅ Financial requests and scams are common—never send money\n✅ Trust your gut feeling even if you can\'t explain it\n✅ End interactions when you see red flags—you don\'t owe anyone a chance\n✅ Report serious safety concerns to protect the community\n✅ Look for green flags that indicate healthy connections\n\nRecognizing red flags early protects you and helps you focus energy on positive, safe connections.',
            type: 'key-point'
          }
        ]
      },
      'mod-10': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Physical Safety Protocols: Your Comprehensive Guide',
            content: 'Physical safety in the lifestyle requires preparation, awareness, and clear protocols. This module covers everything from safer sex practices to personal safety during encounters, ensuring you can enjoy the lifestyle while minimizing physical risks.\n\nThese protocols should become second nature—automatic practices that protect you in every lifestyle interaction.',
            type: 'normal'
          },
          {
            heading: 'The Foundation: Sexual Health and Safer Sex',
            content: 'Sexual health is the cornerstone of physical safety:\n\n🎯 REGULAR TESTING:\n• Get tested for STIs every 3-6 months\n• More frequent if you have multiple partners\n• Test after any unprotected exposure\n• Full panel: HIV, Syphilis, Gonorrhea, Chlamydia, Hepatitis\n• Know your status and share honestly\n\n🎯 KNOWING YOUR STATUS:\n• Keep dated test results accessible\n• Share status with potential partners before play\n• Update regularly\n• Disclose any positive results immediately\n\nHonesty about sexual health protects everyone and is required in the lifestyle community.',
            type: 'key-point'
          },
          {
            heading: 'Barrier Protection: Essential Practices',
            content: '🛡️ CONDOM USE:\n• Use condoms for all penetrative activities\n• New condom for each partner and each act\n• Check expiration dates\n• Store properly (not in wallet or hot car)\n• Bring your own—don\'t rely on others\n• Know how to use properly\n\n🛡️ OTHER BARRIERS:\n• Dental dams for oral-vaginal or oral-anal contact\n• Female condoms as alternative\n• Gloves for manual stimulation\n• Consider barriers even for oral sex\n\n🛡️ PROPER USAGE:\n• Check for damage before use\n• Use water or silicone-based lube (not oil)\n• Hold base when removing\n• Dispose properly after single use\n\nBarrier protection significantly reduces STI transmission.',
            type: 'example'
          },
          {
            heading: 'When Barriers Fail',
            content: 'Despite best efforts, condoms can break or slip:\n\n🚨 IMMEDIATE STEPS:\n1. STOP immediately\n2. Inspect for breakage\n3. Communicate with all parties\n4. Assess need for emergency contraception\n5. Consider PEP (Post-Exposure Prophylaxis) for HIV if high risk\n6. Get tested at appropriate intervals\n7. Inform other partners\n\n⏰ TESTING TIMELINE AFTER EXPOSURE:\n• 2 weeks: Early STI screening\n• 4-6 weeks: HIV antibody test\n• 3 months: Confirmatory HIV test\n• Follow medical advice for specific concerns\n\nKnow where to access emergency services in advance.',
            type: 'warning'
          },
          {
            heading: 'Substance Safety in Lifestyle Settings',
            content: '🍷 ALCOHOL GUIDELINES:\n• Set a limit before you arrive\n• Alternate alcoholic and non-alcoholic drinks\n• Eat before and during drinking\n• Stay hydrated with water\n• Never leave drinks unattended\n• Don\'t accept drinks you didn\'t see prepared\n• Know your limits and stick to them\n\n🚫 DRUGS AND CONSENT:\n• Impairment affects consent capacity\n• Never accept drugs from strangers\n• If you choose to use, know what you\'re taking\n• Have a sober safety person\n• Start with small amounts\n• Know signs of overdose and how to respond\n\nIMPORTANT: Consent cannot be given when significantly impaired. Impairment also increases all other risks.',
            type: 'warning'
          },
          {
            heading: 'Physical Boundaries During Play',
            content: 'Maintain physical safety through clear boundaries:\n\n✅ BEFORE PLAY:\n• Discuss hard limits (activities you absolutely won\'t do)\n• Establish soft limits (maybes, proceed with caution)\n• Agree on safe words/signals\n• Discuss intensity preferences\n• Clarify who can touch where\n• Set time boundaries\n\n✅ DURING PLAY:\n• Check in regularly\n• Watch for non-verbal discomfort\n• Respect safe words immediately\n• Adjust intensity based on response\n• Stop if anyone seems distressed\n• Maintain awareness of surroundings\n\n✅ PHYSICAL SAFETY CHECKS:\n• Adequate space for activities\n• No sharp objects or hazards nearby\n• Comfortable temperature\n• Access to water\n• First aid kit available\n• Clear path to exit',
            type: 'key-point'
          },
          {
            heading: 'Safe Words and Communication Systems',
            content: 'Establish clear communication before any physical activity:\n\n🚦 TRAFFIC LIGHT SYSTEM:\n• GREEN: "I\'m good, continue"\n• YELLOW: "Slow down, approaching my limit"\n• RED: "Stop immediately"\n\n📢 VERBAL SAFE WORDS:\n• Choose an unusual word ("pineapple," "Nebraska")\n• Easy to remember and say\n• Something you wouldn\'t say normally\n• All participants must know it\n\n🤝 NON-VERBAL SIGNALS:\n• Important if mouth is occupied\n• Hand signals (three taps, specific gesture)\n• Dropping a held object\n• Shaking head vigorously\n\n⚠️ SAFE WORD RULES:\n• Anyone can use it at any time\n• Everything stops IMMEDIATELY\n• No questions or negotiations\n• Check in with the person who used it\n• Only resume if everyone agrees\n• Never shame someone for using safe words',
            type: 'key-point'
          },
          {
            heading: 'Personal Safety During Group Activities',
            content: 'Group play has additional safety considerations:\n\n👥 BEFORE GROUP PLAY:\n• Know who will be present\n• Discuss everyone\'s boundaries\n• Establish group safe word\n• Assign someone to monitor safety\n• Agree on safer sex protocols\n• Know where exits are\n• Have clear end time\n\n👥 DURING GROUP PLAY:\n• Stay aware of your surroundings\n• Keep belongings secure\n• Know where your partner is\n• Check in with partner regularly\n• Watch for boundary violations (yours or others\')  \n• Don\'t be afraid to speak up\n• Help enforce others\' boundaries\n\n👥 AFTER GROUP PLAY:\n• Account for all your belongings\n• Check in with partner\n• Debrief the experience\n• Address any concerns immediately',
            type: 'example'
          },
          {
            heading: 'Physical Safety in Lifestyle Venues',
            content: '🏢 AT CLUBS AND PARTIES:\n• Tour the venue when you arrive\n• Locate all exits\n• Know where security/staff are\n• Stay aware of who\'s around you\n• Keep valuables secure\n• Stay in well-lit areas\n• Use buddy system\n• Don\'t go to isolated areas alone\n• Watch your drinks\n• Know the venue\'s rules and safety protocols\n\n🚨 VENUE RED FLAGS:\n• No visible staff or security\n• Poor lighting\n• Dirty or unsanitary\n• No clear safety rules\n• Staff doesn\'t enforce boundaries\n• No safe words respected\n• Pressure to participate\n• Can\'t easily leave\n\nTrust your comfort level—leave if a venue feels unsafe.',
            type: 'warning'
          },
          {
            heading: 'Hotel and Private Location Safety',
            content: '🏨 HOTEL SAFETY:\n• Book your own room when possible\n• Choose reputable hotels\n• Check room upon arrival\n• Know emergency exits\n• Keep door unlocked if preferred (know exit route)\n• Keep phone charged and accessible\n• Have car keys ready\n• Maintain check-in schedule with safety contact\n\n🏠 PRIVATE HOME SAFETY:\n• Only visit after multiple public meetings\n• Tell someone exact address\n• Share check-in schedule\n• Scout exit routes when you arrive\n• Keep shoes on for quick exit\n• Stay near exits\n• Have your own transportation\n• Meet partners at the location (don\'t get picked up)\n• Consider neutral location for first private meetings',
            type: 'example'
          },
          {
            heading: 'Handling Physical Emergencies',
            content: '🚑 MEDICAL EMERGENCIES:\n• Stop all activity immediately\n• Assess the situation\n• Call 911 if serious\n• Provide first aid if trained\n• Don\'t move someone with possible injury\n• Stay calm and supportive\n• Follow emergency responders\' instructions\n\n💊 WHAT TO KEEP ACCESSIBLE:\n• First aid kit (bandages, antiseptic, etc.)\n• Emergency contacts\n• List of allergies/medical conditions\n• Current medications\n• EpiPen if allergies present\n• Naloxone (Narcan) if drugs may be present\n\n📱 EMERGENCY INFO:\n• Know location address\n• Have phone fully charged\n• Know nearest hospital\n• Have emergency contact numbers\n• Don\'t be afraid to call 911\n• Honesty with responders (helps treatment)',
            type: 'warning'
          },
          {
            heading: 'Aftercare: Physical and Emotional',
            content: 'Aftercare is crucial for physical and emotional well-being:\n\n💚 PHYSICAL AFTERCARE:\n• Rehydrate (water, electrolyte drinks)\n• Eat light snacks (blood sugar recovery)\n• Temperature regulation (blankets if cold)\n• Tend to any physical marks or soreness\n• Rest and recovery time\n• Gentle movement or stretching\n• Shower/clean up when ready\n\n💚 EMOTIONAL AFTERCARE:\n• Check in verbally\n• Provide comfort and reassurance\n• Process the experience together\n• Address any concerns\n• Cuddle or physical comfort if desired\n• Respect need for space if preferred\n• Follow up in the following days\n\n💚 SUB-DROP/TOP-DROP AWARENESS:\nAfter intense experiences, hormones drop and can cause:\n• Emotional sensitivity\n• Sadness or anxiety\n• Physical exhaustion\n• Need for reassurance\n\nThis is normal—provide extra care and check-ins.',
            type: 'normal'
          },
          {
            heading: 'Self-Defense and De-Escalation',
            content: '🥊 BASIC SELF-DEFENSE AWARENESS:\n• Take a self-defense class\n• Practice awareness of surroundings\n• Trust your instincts about danger\n• Know vulnerable points if needed\n• Carry personal safety items if legal (alarm, pepper spray)\n• Primary goal is always escape, not fight\n\n🗣️ DE-ESCALATION TECHNIQUES:\n• Stay calm and speak calmly\n• Use non-threatening body language\n• Create physical distance\n• Look for exits\n• Call for help if needed\n• Prioritize getting away safely\n\n🚨 WHEN TO ESCALATE:\nIf you feel immediately threatened:\n• Make noise/yell for help\n• Use your phone to call 911\n• Use self-defense only as last resort\n• Get to safety as quickly as possible\n• Report to authorities',
            type: 'warning'
          },
          {
            heading: 'Documentation and Reporting',
            content: 'If a physical safety incident occurs:\n\n📝 DOCUMENT:\n• Write down what happened immediately\n• Include dates, times, locations\n• Note witnesses\n• Take photos of any injuries\n• Save all messages and communications\n• Get medical examination if needed (preserves evidence)\n\n📢 REPORT:\n• Tell your partner immediately\n• Report to venue management if applicable\n• File police report for assault or serious violations\n• Report to lifestyle site/event organizers\n• Warn trusted community members\n• Seek medical attention and documentation\n\n🆘 SUPPORT:\n• Talk to trusted friends\n• Consider professional counseling\n• Join support groups\n• Don\'t blame yourself\n• Take time to process\n• Focus on your healing',
            type: 'normal'
          },
          {
            heading: 'Building a Physical Safety Culture',
            content: 'Everyone\'s responsibility to maintain safety:\n\n✅ PERSONAL RESPONSIBILITY:\n• Follow all safety protocols\n• Respect everyone\'s boundaries\n• Speak up when you see violations\n• Take care of your health\n• Be honest about status and limits\n• Support others\' safety needs\n\n✅ COMMUNITY RESPONSIBILITY:\n• Call out unsafe behavior\n• Support people who report issues\n• Share safety information\n• Maintain standards\n• Exclude people who violate safety\n• Educate newcomers\n• Lead by example\n\nA strong safety culture protects everyone and makes the lifestyle better for all.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Get tested regularly and know your STI status\n✅ Use barrier protection consistently and correctly\n✅ Set clear limits and stay within your comfort zone\n✅ Establish and respect safe words/signals\n✅ Control alcohol/substance use—impairment affects safety\n✅ Maintain situational awareness in all settings\n✅ Keep emergency contacts and supplies accessible\n✅ Provide proper aftercare for physical and emotional well-being\n✅ Document and report safety violations\n✅ Support community safety culture\n\nPhysical safety protocols protect you and everyone you interact with. Make them automatic.',
            type: 'key-point'
          }
        ]
      },
      'mod-11': {
        estimatedTime: '15 minutes',
        sections: [
          {
            heading: 'Understanding Community Safety Standards',
            content: 'The lifestyle community thrives when everyone follows shared safety standards and expectations. These community norms exist to protect all participants and create an environment where people can explore safely.\n\nThis module covers the unwritten and written rules that govern lifestyle spaces and how you can contribute to a safer community.',
            type: 'normal'
          },
          {
            heading: 'Core Community Values',
            content: 'The lifestyle community is built on fundamental values:\n\n🎯 CONSENT: Everything requires enthusiastic consent\n🎯 RESPECT: All people and boundaries are respected\n🎯 DISCRETION: Privacy is protected\n🎯 HONESTY: Transparency about status and intentions\n🎯 SAFETY: Physical and emotional well-being prioritized\n🎯 INCLUSION: Welcoming of diverse people and expressions\n🎯 RESPONSIBILITY: Accountability for actions\n\nThese values guide all interactions and expectations.',
            type: 'key-point'
          },
          {
            heading: 'Standard Community Expectations',
            content: '✅ WHAT\'S EXPECTED OF EVERYONE:\n\n• Obtain clear consent before any activity\n• Respect "no" immediately without question\n• Honor stated boundaries\n• Practice safer sex\n• Know and disclose STI status\n• Be honest about relationship arrangements\n• Maintain discretion about others\n• Follow venue rules\n• Treat everyone with respect\n• Report safety concerns\n• Support survivors of violations\n• Welcome and educate newcomers\n• Take responsibility for mistakes\n\nThese aren\'t optional—they\'re requirements for community participation.',
            type: 'normal'
          },
          {
            heading: 'Venue-Specific Rules',
            content: 'Different lifestyle venues have specific rules:\n\n🏢 COMMON CLUB RULES:\n• Dress code requirements\n• No photography without explicit consent\n• Consent culture (ask before touching)\n• Designated play areas\n• No single males (at some venues)\n• Alcohol policies\n• Drug prohibitions\n• Age verification required\n• Respect for staff and security\n• Cleanliness standards\n\n📋 ALWAYS:\n• Read venue rules before attending\n• Ask questions if anything is unclear\n• Follow rules even if you disagree\n• Respect that each venue sets their own standards\n• Leave if you\'re uncomfortable with venue practices',
            type: 'example'
          },
          {
            heading: 'Online Community Standards',
            content: '💻 LIFESTYLE SITE/APP EXPECTATIONS:\n\n• Authentic profiles (real photos, honest information)\n• Respectful communication\n• No harassment or unwanted contact\n• Report violations to site administrators\n• No solicitation (prostitution, trafficking)\n• Respect privacy settings\n• Follow site-specific rules\n• Don\'t screenshot/share private messages\n• Age verification compliance\n• Appropriate content in public areas\n\n🚫 BEHAVIORS THAT GET YOU BANNED:\n• Fake profiles or catfishing\n• Harassment\n• Sharing others\' information\n• Revenge porn or non-consensual sharing\n• Spam or commercial activity\n• Violating consent\n• Threatening behavior\n• Underage content',
            type: 'warning'
          },
          {
            heading: 'Consent Culture in Practice',
            content: 'How consent culture works in lifestyle spaces:\n\n✅ THE ASK:\n• "May I touch you?"\n• "Would you like to dance?"\n• "Are you interested in joining us?"\n• Always ask, never assume\n\n✅ THE RESPONSE:\n• "Yes" means yes (and can be withdrawn)\n• "No" means no (and doesn\'t require explanation)\n• "Maybe" means no (don\'t pressure)\n• Silence means no\n\n✅ THE RESPECT:\n• Accept answers gracefully\n• Don\'t ask repeatedly\n• Don\'t try to negotiate a "no"\n• Thank them for being clear\n• Move on without resentment\n\nThis creates an environment where everyone feels safe to participate honestly.',
            type: 'key-point'
          },
          {
            heading: 'Discretion and Privacy Standards',
            content: '🤫 COMMUNITY DISCRETION RULES:\n\n• What happens in lifestyle spaces stays private\n• Don\'t share who you saw at events/venues\n• Don\'t gossip about others\' lifestyle involvement\n• Don\'t post about others on social media\n• Protect real identities of lifestyle connections\n• Don\'t "out" people as lifestyle participants\n• Respect privacy boundaries\n• Delete/don\'t share others\' photos without permission\n\n⚖️ WHY THIS MATTERS:\nMany people face serious consequences if their lifestyle involvement is exposed:\n• Job loss\n• Family estrangement\n• Custody battles\n• Social stigma\n• Housing discrimination\n\nProtecting privacy protects people\'s lives.',
            type: 'warning'
          },
          {
            heading: 'Supporting Newcomers',
            content: 'Experienced members help create a welcoming community:\n\n🤝 HOW TO SUPPORT NEWCOMERS:\n• Be friendly and welcoming\n• Offer to answer questions\n• Share resources and information\n• Introduce them to others\n• Respect that they\'re learning\n• Don\'t pressure or take advantage\n• Model good behavior\n• Protect them from predatory people\n• Be patient with mistakes\n• Celebrate their growth\n\n🚫 DON\'T:\n• Assume they\'re "easy targets"\n• Pressure them into activities\n• Mock their nervousness\n• Share their information\n• Treat them as lesser members\n\nHow we treat newcomers determines the community\'s future.',
            type: 'normal'
          },
          {
            heading: 'Handling Conflicts and Concerns',
            content: '⚖️ WHEN CONFLICTS ARISE:\n\n1. ADDRESS DIRECTLY (when safe):\n"I felt uncomfortable when..."\n"That crossed my boundary..."\n"I need this to stop..."\n\n2. INVOLVE VENUE STAFF:\n• Report to management\n• Ask for assistance\n• They\'re trained to handle issues\n\n3. DOCUMENT:\n• Write down what happened\n• Note witnesses\n• Save messages\n• Take photos if relevant\n\n4. REPORT TO ORGANIZERS:\n• Event coordinators\n• Website administrators\n• Community leaders\n• They need to know to protect others\n\n5. SERIOUS VIOLATIONS:\n• Contact law enforcement if applicable\n• Seek support from community\n• Don\'t minimize what happened',
            type: 'example'
          },
          {
            heading: 'Community Accountability',
            content: 'The community self-regulates through accountability:\n\n✅ WHEN SOMEONE VIOLATES STANDARDS:\n• Call out the behavior\n• Report to appropriate people\n• Support the person harmed\n• Don\'t make excuses for violators\n• Remove them from community if serious\n• Believe reporters, investigate claims\n• Take action to prevent repeat incidents\n\n✅ WHEN YOU MAKE A MISTAKE:\n• Acknowledge it immediately\n• Apologize sincerely\n• Make amends\n• Change your behavior\n• Accept consequences\n• Learn from it\n• Don\'t make excuses\n\nAccountability maintains community standards.',
            type: 'key-point'
          },
          {
            heading: 'Your Role in Community Safety',
            content: 'Every member contributes to community safety:\n\n👁️ BE AN ACTIVE BYSTANDER:\n• Watch for consent violations\n• Check on people who seem uncomfortable\n• Intervene when you see problems\n• Report concerning behavior\n• Support people who speak up\n• Don\'t ignore red flags\n\n🗣️ SPEAK UP:\n• Call out inappropriate behavior\n• Share safety information\n• Report violations\n• Support safety initiatives\n• Advocate for better standards\n• Educate others\n\n🤝 BE THE CHANGE:\n• Model excellent behavior\n• Treat everyone with respect\n• Follow all safety protocols\n• Support community leaders\n• Mentor newcomers\n• Contribute positively\n\nSafety is everyone\'s responsibility.',
            type: 'normal'
          },
          {
            heading: 'Building Reputation and Trust',
            content: 'Your community reputation matters:\n\n✅ BUILD POSITIVE REPUTATION:\n• Consistent respectful behavior\n• Following through on commitments\n• Respecting boundaries\n• Being honest and transparent\n• Supporting community values\n• Handling conflicts maturely\n• Being vouched for by others\n\n📈 REPUTATION IMPACTS:\n• Who wants to connect with you\n• Invitations to events\n• Trust from community\n• Quality of connections\n• Access to venues/groups\n\n⚠️ PROTECT YOUR REPUTATION:\n• One serious violation can end it\n• Gossip spreads quickly\n• The community has a long memory\n• Recovery from mistakes is possible but difficult\n\nYour reputation is your most valuable asset in the lifestyle.',
            type: 'tip'
          },
          {
            heading: 'Contributing to Positive Culture',
            content: '🌟 CREATE THE COMMUNITY YOU WANT:\n\n• Be kind and welcoming\n• Share knowledge generously\n• Support community events\n• Volunteer when possible\n• Give constructive feedback\n• Celebrate others\' successes\n• Advocate for improvements\n• Lead by example\n• Foster inclusivity\n• Maintain high standards\n\nEvery positive interaction strengthens the community. Every violation weakens it. Choose to be a positive force.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Community is built on consent, respect, discretion, and honesty\n✅ Follow venue-specific rules and community expectations\n✅ Practice consent culture in all interactions\n✅ Protect others\' privacy and discretion always\n✅ Welcome and support newcomers to the community\n✅ Report violations and support those harmed\n✅ Hold yourself and others accountable\n✅ Be an active bystander—intervene when needed\n✅ Build positive reputation through consistent good behavior\n✅ Contribute to the culture you want to see\n\nCommunity safety standards protect everyone. Follow them, enforce them, and help others understand them.',
            type: 'key-point'
          }
        ]
      },
      // Relationship Dynamics Path Modules
      'mod-12': {
        estimatedTime: '20 minutes',
        sections: [
          {
            heading: 'Welcome to Understanding Relationship Types',
            content: 'The lifestyle encompasses a diverse range of relationship structures, each with unique dynamics, expectations, and boundaries. This module introduces you to the various types of relationships you\'ll encounter, helping you understand your own preferences and respect others\' choices.\n\nUnderstanding different relationship types is essential for navigating the lifestyle successfully and finding connections that align with your values and desires.',
            type: 'normal'
          },
          {
            heading: 'Why Relationship Structure Matters',
            content: 'In the lifestyle, relationship structures affect:\n\n• Expectations and boundaries\n• Available time and energy\n• Emotional availability\n• Decision-making processes\n• Jealousy and insecurity management\n• Communication patterns\n• Long-term possibilities\n\nUnderstanding someone\'s relationship type helps you:\n✅ Set appropriate expectations\n✅ Respect their boundaries\n✅ Communicate effectively\n✅ Avoid misunderstandings\n✅ Find compatible connections',
            type: 'normal'
          },
          {
            heading: 'Traditional Swinging: Same Room Play',
            content: '👫 DEFINITION:\nCouples who play together, in the same space, with mutual awareness and participation.\n\n✅ CHARACTERISTICS:\n• Both partners always present\n• Visual contact maintained\n• Shared experiences\n• Strong couple bond emphasis\n• Lower jealousy triggers for many\n• Feels like "doing it together"\n\n🎯 TYPICAL BOUNDARIES:\n• No separate play\n• Check-ins during play\n• Either can stop at any time\n• Emotional connection stays primary\n\n💭 BEST FOR:\nCouples who want to explore together while maintaining constant connection and reassurance.',
            type: 'example'
          },
          {
            heading: 'Separate Room Play',
            content: '🚪 DEFINITION:\nCouples who are comfortable playing with others in separate spaces or at different times.\n\n✅ CHARACTERISTICS:\n• Trust in partner without visual supervision\n• More individual freedom\n• Requires higher trust and communication\n• Each partner has autonomous experiences\n• Jealousy management is crucial\n\n🎯 TYPICAL BOUNDARIES:\n• Pre-agreed time limits\n• Check-ins via text\n• Certain activities may be off-limits\n• Post-play debriefs\n• Right to stop at any time\n\n💭 BEST FOR:\nCouples with solid trust, minimal jealousy, and desire for more independent experiences.',
            type: 'example'
          },
          {
            heading: 'Soft Swap vs Full Swap',
            content: '🔄 SOFT SWAP:\nLimited sexual activities with others, typically excluding intercourse.\n\n• Kissing, touching, oral sex ✅\n• Intercourse ❌\n• Allows exploration with boundaries\n• Common starting point for new swingers\n\n🔄 FULL SWAP:\nAll sexual activities are on the table (within personal boundaries).\n\n• All activities including intercourse ✅\n• Requires strong trust and communication\n• More common with experienced swingers\n• Individual boundaries still apply\n\n📊 THE SPECTRUM:\nMany couples exist between soft and full swap, with personalized boundaries about specific acts.',
            type: 'key-point'
          },
          {
            heading: 'Polyamory: Multiple Loving Relationships',
            content: '💕 DEFINITION:\nThe practice of having multiple romantic and/or sexual relationships simultaneously, with the knowledge and consent of everyone involved.\n\n✅ KEY PRINCIPLES:\n• Emotional connections encouraged\n• Multiple committed relationships possible\n• Everyone knows about everyone\n• Focus on love, not just sex\n• Long-term orientation\n• Relationship autonomy\n\n🎯 DIFFERS FROM SWINGING:\n• Emotional connections are central (not just physical)\n• Longer-term relationships\n• May involve dating, romance, love\n• More complex time management\n• Different jealousy dynamics\n\n💭 COMMON STRUCTURES:\n• "V" relationships (one person dating two who aren\'t dating each other)\n• Triads/Throuples (three people all together)\n• Polycules (complex interconnected networks)\n• Parallel poly (partners don\'t interact much)\n• Kitchen table poly (everyone\'s friendly)',
            type: 'normal'
          },
          {
            heading: 'Open Relationships',
            content: '🌐 DEFINITION:\nA primary committed relationship with permission for sexual or romantic connections with others.\n\n✅ CHARACTERISTICS:\n• Primary partnership remains central\n• Outside connections are secondary\n• Rules negotiated by primary couple\n• Can include emotions or be sex-only\n• Varies widely in structure\n\n🎯 COMMON VARIATIONS:\n• Monogamish (mostly monogamous with occasional exceptions)\n• One-sided open (only one partner dates others)\n• Open with restrictions (specific rules about outside partners)\n• Fully open (minimal restrictions)\n\n⚖️ BOUNDARIES VARY:\n• Who you can see (friends? strangers?)\n• What activities are allowed\n• How much information is shared\n• Time limitations\n• Veto power\n\nOpen relationships require crystal-clear communication.',
            type: 'example'
          },
          {
            heading: 'Relationship Anarchy',
            content: '🔓 DEFINITION:\nRejecting traditional relationship hierarchies and labels, allowing each connection to develop naturally without prescribed rules.\n\n✅ PRINCIPLES:\n• No primary/secondary hierarchy\n• Each relationship stands on its own\n• Minimal predetermined rules\n• Autonomy is paramount\n• No relationship "escalator" (progression assumptions)\n• Customized agreements per relationship\n\n💭 PHILOSOPHY:\n"This relationship is what we make it, not what society expects it to be."\n\n⚠️ CHALLENGES:\n• Requires exceptional communication\n• No built-in structure\n• Everything must be negotiated\n• Can feel unstable\n• Not compatible with people who need hierarchy\n\n✅ BENEFITS:\n• Maximum freedom and flexibility\n• Authentic to individual needs\n• No prescribed expectations\n• Each relationship is unique',
            type: 'normal'
          },
          {
            heading: 'Hierarchical vs Non-Hierarchical',
            content: '📊 HIERARCHICAL:\nRelationships have clear rankings (primary, secondary, tertiary).\n\n• Primary relationship has priority\n• Primary has veto power\n• Primary\'s needs come first\n• Secondary partners have limitations\n• Clear structure and security\n• Common in lifestyle\n\n🤝 NON-HIERARCHICAL:\nAll relationships are valued equally based on their unique qualities.\n\n• No ranking system\n• Each relationship develops naturally\n• No built-in veto power\n• Time and energy allocated by needs, not rank\n• More complex to manage\n• Requires high autonomy\n\n💭 NEITHER IS BETTER:\nBoth work for different people. Know which you\'re practicing and be honest about it.',
            type: 'key-point'
          },
          {
            heading: 'Solo Polyamory',
            content: '🏠 DEFINITION:\nPolyamorous individuals who don\'t have or want a primary partner.\n\n✅ CHARACTERISTICS:\n• Independent living (don\'t cohabitate)\n• Self as primary\n• Multiple connections without hierarchy\n• Autonomy is key\n• May have serious relationships without "primary" label\n• Own life is the center\n\n💭 PHILOSOPHY:\n"I\'m complete on my own, and I have multiple meaningful connections."\n\n🎯 CONSIDERATIONS FOR COUPLES:\n• Solo poly individuals won\'t prioritize you\n• They have their own autonomy\n• Don\'t expect traditional escalation\n• Respect their independence\n• Good for casual-to-moderate connections',
            type: 'normal'
          },
          {
            heading: 'Closed vs Open Structures',
            content: '🔒 CLOSED (POLYFIDELITY):\nA group of people in a committed, closed relationship together.\n\n• Example: A triad where all three are exclusive to each other\n• No outside partners\n• Like monogamy, but with more than two\n• High security, lower variety\n• All members must agree to new people\n\n🔓 OPEN:\nFreedom to add new partners as desired.\n\n• Ongoing ability to meet new people\n• More variety, less security\n• Requires constant communication\n• Compersion becomes important\n• More common in lifestyle\n\n⚖️ SEMI-CLOSED:\nOpen to new people but with restrictions or slow additions.',
            type: 'example'
          },
          {
            heading: 'Identifying Your Relationship Type',
            content: '🤔 QUESTIONS TO ASK YOURSELF:\n\n1. Do I want my partner present for all encounters?\n2. Am I comfortable with emotional connections outside my primary relationship?\n3. How much time do I want to invest in additional relationships?\n4. What level of autonomy do I need/want?\n5. How do I handle jealousy?\n6. What structure provides me security?\n7. What are my non-negotiables?\n8. What am I hoping to gain from the lifestyle?\n\n💡 YOUR ANSWERS GUIDE YOUR PATH:\nThere\'s no "right" relationship type—only what works for you and your partners.',
            type: 'tip'
          },
          {
            heading: 'Communicating Your Relationship Type',
            content: '📢 BE CLEAR IN PROFILES AND CONVERSATIONS:\n\n"We\'re a same-room couple looking for soft swap"\n"I practice solo polyamory and am open to ongoing connections"\n"We\'re full swap but prefer to play together"\n"I\'m in an open relationship; my partner isn\'t involved"\n\n✅ INCLUDE:\n• Your structure\n• Your boundaries\n• Your expectations\n• Your availability\n• Your flexibility (or lack thereof)\n\n⚠️ AVOID ASSUMPTIONS:\n• "Lifestyle" means different things to different people\n• "Open" is vague\n• "Poly" has many interpretations\n• Always clarify specifics',
            type: 'key-point'
          },
          {
            heading: 'Respecting Different Relationship Types',
            content: '✅ BEST PRACTICES:\n\n• Don\'t judge others\' choices\n• Don\'t pressure people to change their structure\n• Respect boundaries even if you don\'t understand them\n• Don\'t claim your way is "better"\n• Accept incompatibility gracefully\n• Learn about structures you\'re unfamiliar with\n• Ask questions respectfully\n• Understand that different structures have different needs\n\n🚫 DON\'T:\n• "You\'re not REALLY poly if..."\n• "Why don\'t you just..."\n• "That\'s too restrictive/too open"\n• "My way is more evolved"\n\nDiversity of relationship types strengthens the community.',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Multiple valid relationship structures exist in the lifestyle\n✅ Swinging, polyamory, and open relationships have key differences\n✅ Same room vs separate room is about trust and comfort\n✅ Soft swap vs full swap defines physical boundaries\n✅ Hierarchical vs non-hierarchical affects priorities\n✅ Solo poly individuals prioritize their autonomy\n✅ Clearly communicate your relationship type\n✅ Respect all relationship structures\n✅ Find what works for you—there\'s no "right" way\n✅ Your structure may evolve over time\n\nUnderstanding relationship types helps you navigate the lifestyle with clarity and respect.',
            type: 'key-point'
          }
        ]
      },
      'mod-13': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Polyamory Fundamentals: Introduction to Ethical Non-Monogamy',
            content: 'Polyamory—the practice of having multiple loving, committed relationships simultaneously with the knowledge and consent of everyone involved—represents a growing relationship paradigm. This module explores the foundations, challenges, and rewards of polyamorous relationships.\n\nWhether you\'re considering polyamory, currently practicing it, or connecting with polyamorous individuals, understanding these fundamentals will help you navigate this landscape with confidence and respect.',
            type: 'normal'
          },
          {
            heading: 'What Polyamory Is (and Isn\'t)',
            content: '✅ POLYAMORY IS:\n• Multiple consensual relationships\n• Emotional connections welcomed\n• Honest and transparent\n• Ethical and above-board\n• Based on communication\n• Long-term oriented\n• Commitment to multiple people\n\n❌ POLYAMORY IS NOT:\n• Cheating (everyone knows and consents)\n• Inability to commit (deep commitments to multiple people)\n• Just about sex (emotional bonds are central)\n• A phase (for many, it\'s an orientation)\n• Easier than monogamy (often requires more work)\n• Avoiding relationship problems (problems still exist)\n• For everyone (not universal)',
            type: 'key-point'
          },
          {
            heading: 'Polyamory vs Swinging',
            content: 'Understanding the distinction:\n\n🎯 SWINGING:\n• Primary focus on sexual experiences\n• Recreational approach\n• "Us plus them" mentality\n• Couple-centric\n• Often event/encounter based\n• Emotional connections usually discouraged\n\n💕 POLYAMORY:\n• Emotional connections central\n• Relationship-building focus\n• Individual relationship autonomy\n• Can be single or coupled\n• Ongoing relationships expected\n• Love and romance encouraged\n\n🤝 OVERLAP:\nMany people enjoy both! Polyamorous people may swing, and swingers may develop emotional connections. The categories aren\'t exclusive.',
            type: 'example'
          },
          {
            heading: 'Core Polyamory Principles',
            content: '1️⃣ CONSENT:\nAll parties knowledgeable and agreeing\n\n2️⃣ COMMUNICATION:\nOpen, honest, frequent dialogue\n\n3️⃣ COMPERSION:\nFinding joy in your partner\'s happiness with others\n\n4️⃣ AUTONOMY:\nEach person has relationship agency\n\n5️⃣ ABUNDANCE MINDSET:\nLove is not a finite resource\n\n6️⃣ INTENTIONALITY:\nThoughtful relationship design\n\n7️⃣ RESPONSIBILITY:\nOwning your choices and their impact\n\n8️⃣ HONESTY:\nTransparency in all relationships\n\nThese principles guide ethical polyamorous practice.',
            type: 'key-point'
          },
          {
            heading: 'Common Polyamory Structures',
            content: '🔺 HIERARCHICAL POLYAMORY:\n• Primary/secondary/tertiary rankings\n• Primary relationship has priority and veto power\n• Clear structure and security\n• Common for couples opening up\n• Can feel limiting to secondary partners\n\n🟰 NON-HIERARCHICAL (EGALITARIAN):\n• All relationships valued equally\n• No ranking system\n• Each relationship develops naturally\n• More complex scheduling\n• High autonomy required\n\n👥 RELATIONSHIP ANARCHY:\n• No prescribed structure\n• Each connection defines itself\n• No automatic hierarchy\n• Maximum flexibility\n• Requires exceptional communication\n\n🏠 KITCHEN TABLE POLYAMORY:\n• All partners/metamours are friendly\n• Regular group interactions\n• "We could all sit at a kitchen table together"\n• Integrated social lives\n• Requires everyone to get along\n\n📱 PARALLEL POLYAMORY:\n• Partners don\'t interact with metamours\n• Separate relationships\n• Minimal information sharing\n• Less potential for conflict\n• Can feel isolating',
            type: 'example'
          },
          {
            heading: 'Understanding Metamours',
            content: '👥 METAMOUR: Your partner\'s partner.\n\nExample: If you\'re dating Alex, and Alex is dating Sam, then Sam is your metamour.\n\n🤝 METAMOUR RELATIONSHIPS VARY:\n• Best friends (close, integrated)\n• Friendly (cordial, occasional interaction)\n• Cordial (polite, minimal interaction)\n• Parallel (don\'t interact)\n• Difficult (conflict or avoidance)\n\n✅ HEALTHY METAMOUR DYNAMICS:\n• Respect for each other\'s relationship\n• Clear boundaries\n• No jealousy-based competition\n• Mutual support\n• Recognition that you both care for the same person\n• Optional friendship\n\n💡 TIP:\nYou don\'t have to be best friends with metamours, but basic respect is essential.',
            type: 'normal'
          },
          {
            heading: 'Compersion: The Opposite of Jealousy',
            content: '💚 COMPERSION: Finding joy in your partner\'s joy with other partners.\n\nExample: Your partner goes on a wonderful date and comes home happy. Instead of feeling jealous, you feel happy for them.\n\n🎯 COMPERSION IS:\n• Not automatic (develops over time)\n• Not required (poly works without it)\n• A bonus, not a necessity\n• Separate from jealousy (can feel both)\n• A skill that can be cultivated\n\n🌱 CULTIVATING COMPERSION:\n• Process your insecurities\n• Focus on abundance, not scarcity\n• Celebrate your partner\'s happiness\n• Remember: their joy doesn\'t diminish yours\n• Practice gratitude\n• Build your own connections\n• Work through jealousy\n\nCompersion is beautiful but not mandatory for successful polyamory.',
            type: 'key-point'
          },
          {
            heading: 'Time Management in Polyamory',
            content: '⏰ THE CHALLENGE:\nTime is finite. Energy is finite. Love may be infinite, but hours in the day are not.\n\n📅 TIME MANAGEMENT STRATEGIES:\n\n• COLOR-CODED CALENDARS:\nShared calendars showing commitments\n\n• SCHEDULED DATES:\nPre-planned time for each partner\n\n• FLEXIBILITY:\nSome spontaneity balanced with structure\n\n• ALONE TIME:\nDon\'t forget self-care!\n\n• REALISTIC EXPECTATIONS:\nYou can\'t be everywhere\n\n• QUALITY OVER QUANTITY:\nMake time count\n\n• COMMUNICATION:\nDiscuss needs and availability\n\n• BUFFER TIME:\nSchedule transition periods\n\n💡 REALITY:\nTime constraints are one of the biggest polyamory challenges. Be realistic about how many relationships you can maintain.',
            type: 'warning'
          },
          {
            heading: 'Communication in Polyamory',
            content: 'Polyamory requires exceptional communication:\n\n🗣️ WHAT TO COMMUNICATE:\n• Scheduling and availability\n• Feelings and insecurities\n• Boundaries and needs\n• Safer sex practices\n• Relationship changes\n• NRE (New Relationship Energy) awareness\n• Conflicts or concerns\n• Appreciation and affirmations\n\n📱 HOW TO COMMUNICATE:\n• Regular check-ins with each partner\n• Scheduled relationship talks\n• Immediate communication for urgent issues\n• Proactive, not just reactive\n• Clear, specific language\n• Active listening\n• Written communication for complex topics\n• Group chats for relevant info\n\n⏰ WHEN TO COMMUNICATE:\n• Before problems escalate\n• Regularly, not just during crises\n• When agreements need updating\n• When feelings change\n• Before making relationship decisions\n\nCommunication is the backbone of polyamory.',
            type: 'key-point'
          },
          {
            heading: 'New Relationship Energy (NRE)',
            content: '✨ NRE: The exciting, all-consuming feeling at the start of a new relationship.\n\n🎢 CHARACTERISTICS:\n• Intense focus on new partner\n• Overlooking flaws\n• Constant thoughts about them\n• Dopamine high\n• Time distortion\n• Decreased attention to existing partners\n• Lasts weeks to months\n\n⚠️ NRE CHALLENGES IN POLYAMORY:\n• Neglecting existing partners\n• Making rushed decisions\n• Ignoring red flags\n• Spending disproportionate time\n• Breaking agreements\n• Energy crash when NRE fades\n\n🛡️ MANAGING NRE:\n• Acknowledge it exists\n• Maintain commitments to existing partners\n• Don\'t make major decisions during NRE\n• Check in with yourself and partners\n• Schedule dates with existing partners first\n• Remember: NRE is temporary\n• Be honest about your state\n\nNRE is normal but requires conscious management.',
            type: 'warning'
          },
          {
            heading: 'Jealousy in Polyamory',
            content: '💔 TRUTH: Polyamorous people still feel jealous.\n\n🎯 COMMON JEALOUSY TRIGGERS:\n• Time scarcity\n• Comparison\n• Fear of replacement\n• Unmet needs\n• Insecurity\n• Lack of communication\n• Broken agreements\n\n🔍 PROCESSING JEALOUSY:\n\n1. FEEL IT:\nDon\'t suppress; acknowledge the emotion\n\n2. INVESTIGATE:\nWhat\'s the root cause?\n\n3. COMMUNICATE:\nShare with partners (without blame)\n\n4. ADDRESS NEEDS:\nWhat do you need to feel secure?\n\n5. SELF-SOOTHE:\nUse coping strategies\n\n6. REASSESS:\nDo boundaries need adjustment?\n\n💡 REMEMBER:\nJealousy is information, not a failure. It tells you what you need.',
            type: 'normal'
          },
          {
            heading: 'Agreements vs Rules',
            content: '⚖️ THE DISTINCTION:\n\n📋 RULES:\n• Imposed restrictions\n• "You can\'t..."\n• Control-based\n• Often fear-driven\n• Can breed resentment\n• Example: "You can\'t see them alone"\n\n🤝 AGREEMENTS:\n• Mutually negotiated\n• "We agree to..."\n• Consent-based\n• Needs-focused\n• Collaborative\n• Example: "We\'ll check in before overnight dates"\n\n✅ HEALTHY AGREEMENTS:\n• Made together\n• Based on needs, not fear\n• Revisable as relationships evolve\n• Respectful of everyone\n• Specific and clear\n• Actually followed\n\n🔄 AGREEMENTS EVOLVE:\nRegularly review and update as you grow.',
            type: 'key-point'
          },
          {
            heading: 'Safer Sex in Polyamory',
            content: '🔐 THE CHALLENGE:\nMore partners = more potential exposure.\n\n✅ SAFER SEX STRATEGIES:\n\n• FLUID BONDING DECISIONS:\nWho do you have unprotected sex with?\n\n• BARRIER USE:\nCondoms/dental dams with some/all partners\n\n• TESTING SCHEDULES:\nRegular STI testing for all partners\n\n• DISCLOSURE:\nShare testing status and safer sex practices\n\n• INFORMED CONSENT:\nEveryone knows the risk network\n\n• AGREEMENTS:\nClear protocols for all partners\n\n📊 RISK NETWORK:\nYou\'re in a sexual health network with:\n• Your partners\n• Your partners\' partners\n• Their partners\' partners\n\nEveryone\'s practices affect everyone. Radical honesty is essential.',
            type: 'warning'
          },
          {
            heading: 'Coming Out as Polyamorous',
            content: '🗣️ THE DECISION:\nComing out is personal and has real consequences.\n\n⚖️ CONSIDERATIONS:\n• Professional risks\n• Family reactions\n• Custody concerns\n• Housing/living situation\n• Social circles\n• Geographic location\n• Personal safety\n\n✅ IF YOU CHOOSE TO COME OUT:\n• Start with supportive people\n• Educate them about polyamory\n• Set boundaries about questions\n• Don\'t justify or defend excessively\n• Connect them with resources\n• Be patient with adjustment\n• Stay firm in your identity\n\n🔒 IF YOU STAY CLOSETED:\n• That\'s valid and sometimes necessary\n• Maintain privacy carefully\n• Find poly-friendly spaces\n• Connect with poly community\n• Don\'t feel guilty\n\nYour safety and well-being come first.',
            type: 'normal'
          },
          {
            heading: 'Common Polyamory Challenges',
            content: '⚠️ TYPICAL STRUGGLES:\n\n• TIME MANAGEMENT:\nNever enough hours\n\n• JEALOUSY/INSECURITY:\nStill human, still feel it\n\n• COMMUNICATION OVERLOAD:\nConstant processing\n\n• SOCIAL STIGMA:\nJudgment from others\n\n• DIFFERENT POLY STYLES:\nPartners want different structures\n\n• UNEQUAL INTEREST:\nOne partner has more/easier connections\n\n• PARTNER CONFLICT:\nMetamour drama\n\n• LEGAL/FINANCIAL COMPLEXITY:\nNo legal recognition of multiple partners\n\n• BURNOUT:\nEmotional labor of multiple relationships\n\n💪 ADDRESSING CHALLENGES:\n• Professional therapy\n• Poly-friendly community support\n• Regular relationship check-ins\n• Self-care and boundaries\n• Honest communication\n• Flexibility and growth\n\nChallenges are normal; they don\'t mean you\'re doing it wrong.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Polyamory is multiple consensual loving relationships\n✅ Different from swinging in focus on emotional connections\n✅ Multiple valid poly structures exist (hierarchical, non-hierarchical, etc.)\n✅ Metamours are your partner\'s partners\n✅ Compersion is finding joy in your partner\'s joy with others\n✅ Time management is crucial and challenging\n✅ Communication is the foundation of successful polyamory\n✅ NRE (New Relationship Energy) requires conscious management\n✅ Jealousy still happens—process it, don\'t suppress it\n✅ Agreements (not rules) guide poly relationships\n✅ Safer sex practices are essential with multiple partners\n✅ Coming out is personal—prioritize your safety\n\nPolyamory requires work, communication, and emotional maturity, but offers the potential for multiple deep, loving connections.',
            type: 'key-point'
          }
        ]
      },
      'mod-14': {
        estimatedTime: '25 minutes',
        sections: [
          {
            heading: 'Managing Jealousy: A Practical Guide',
            content: 'Jealousy is one of the most challenging emotions in the lifestyle and non-monogamous relationships. Contrary to popular belief, jealousy doesn\'t disappear just because you choose an open relationship structure—but it can be understood, managed, and even transformed.\n\nThis module provides practical tools for recognizing, processing, and managing jealousy in healthy ways.',
            type: 'normal'
          },
          {
            heading: 'Understanding Jealousy',
            content: '💭 WHAT IS JEALOUSY?\nA complex emotion combining fear, insecurity, and possessiveness, usually triggered by perceived threat to a valued relationship.\n\n🧠 JEALOUSY IS:\n• Natural and normal (evolutionary response)\n• Information about your needs\n• NOT a moral failing\n• Manageable with tools\n• Different in intensity for everyone\n• Influenced by past experiences\n• Valid even if "irrational"\n\n❌ JEALOUSY IS NOT:\n• A sign you\'re not "poly enough"\n• Proof the relationship is doomed\n• Something to be ashamed of\n• A reason to give up\n\n💡 KEY INSIGHT:\nEven people in successful non-monogamous relationships for years still experience jealousy sometimes. The goal isn\'t to eliminate it, but to manage it effectively.',
            type: 'normal'
          },
          {
            heading: 'Jealousy vs Envy',
            content: '🎯 THE DIFFERENCE:\n\n💔 JEALOUSY:\nFear of losing something you have\n"I\'m afraid my partner will prefer them over me"\n\n💚 ENVY:\nWanting something someone else has\n"I wish I had as many dates as my partner does"\n\nBoth are valid emotions but require different approaches to process.\n\n🔍 WHY IT MATTERS:\n• Jealousy needs reassurance and connection\n• Envy needs self-reflection and action\n• Misidentifying the emotion leads to wrong solutions\n\nAsk yourself: "Am I afraid of losing something, or do I want something I don\'t have?"',
            type: 'key-point'
          },
          {
            heading: 'Common Jealousy Triggers in the Lifestyle',
            content: '⚠️ TYPICAL TRIGGERS:\n\n⏰ TIME SCARCITY:\n"They\'re spending more time with them than me"\n\n📊 COMPARISON:\n"They\'re more attractive/fun/interesting than me"\n\n🔥 SEXUAL PERFORMANCE:\n"What if they\'re better in bed?"\n\n💕 EMOTIONAL CONNECTION:\n"What if they fall in love with someone else?"\n\n🎁 SPECIAL EXPERIENCES:\n"They\'re doing things with them that we haven\'t done"\n\n🚫 BROKEN AGREEMENTS:\n"They didn\'t follow our rules"\n\n👻 NEW RELATIONSHIP ENERGY:\n"They\'re so excited about this new person"\n\n🏆 INSECURITY:\n"What if I\'m not enough?"\n\n📱 COMMUNICATION GAPS:\n"I don\'t know what\'s happening"\n\n💭 FEAR OF REPLACEMENT:\n"What if they leave me for someone else?"\n\nRecognizing your specific triggers is the first step to managing them.',
            type: 'warning'
          },
          {
            heading: 'The Jealousy Processing Framework',
            content: 'A step-by-step approach to working through jealousy:\n\n1️⃣ PAUSE & BREATHE:\n• Don\'t react immediately\n• Take deep breaths\n• Create space before responding\n\n2️⃣ NAME THE FEELING:\n"I\'m feeling jealous right now"\n\n3️⃣ INVESTIGATE THE ROOT:\n"What am I actually afraid of?"\n"What need isn\'t being met?"\n"What story am I telling myself?"\n\n4️⃣ REALITY CHECK:\n"Is this fear based on evidence or assumption?"\n"What do I actually know?"\n\n5️⃣ IDENTIFY THE NEED:\n"What do I need to feel secure?"\n"What would help right now?"\n\n6️⃣ COMMUNICATE:\nShare your feelings and needs (without blame)\n\n7️⃣ TAKE ACTION:\nAddress the underlying need\n\n8️⃣ SELF-SOOTHE:\nUse coping strategies while processing',
            type: 'key-point'
          },
          {
            heading: 'The HALT Check',
            content: '🛑 Before assuming jealousy is about your partner, check if you\'re:\n\nH - HUNGRY\nLow blood sugar affects emotions\n\nA - ANGRY\nDisplaced anger can manifest as jealousy\n\nL - LONELY\nUnmet connection needs amplify jealousy\n\nT - TIRED\nFatigue reduces emotional regulation\n\n✅ THE FIX:\n• Eat something nutritious\n• Address the real source of anger\n• Schedule quality time with partner\n• Get adequate rest\n\nOften "jealousy" disappears when basic needs are met. Check HALT first before having a difficult conversation.',
            type: 'tip'
          },
          {
            heading: 'Communicating Jealousy Effectively',
            content: '🗣️ HOW TO SHARE JEALOUS FEELINGS:\n\n❌ BLAME APPROACH:\n"You\'re spending too much time with them!"\n"You care about them more than me!"\n"You\'re making me feel jealous!"\n\n✅ OWNERSHIP APPROACH:\n"I\'m feeling jealous about the time you\'re spending with them. I think I need more quality time with you."\n\n"I\'m feeling insecure and comparing myself to your new partner. Can we talk about what makes our relationship special?"\n\n"I\'m noticing jealousy coming up. I need some reassurance about our connection."\n\n📋 EFFECTIVE COMMUNICATION FORMULA:\n1. NAME the emotion: "I\'m feeling jealous"\n2. IDENTIFY the trigger: "When I see you text them"\n3. EXPRESS the underlying fear: "I worry that I\'m being replaced"\n4. STATE the need: "I need more verbal affirmation of our connection"\n5. REQUEST specific action: "Could we have a weekly date night just us?"',
            type: 'example'
          },
          {
            heading: 'Self-Soothing Strategies',
            content: 'What to do when jealousy hits:\n\n🧘 IMMEDIATE COPING:\n• Deep breathing exercises\n• Physical movement (walk, exercise)\n• Journaling your feelings\n• Call a supportive friend (not to bash partner)\n• Engage in a distracting activity\n• Meditation or mindfulness\n• Self-compassion mantras\n• Progressive muscle relaxation\n\n💭 COGNITIVE STRATEGIES:\n• Challenge catastrophic thinking\n• Remind yourself of your value\n• Focus on gratitude for what you have\n• Remember past times you felt jealous that resolved\n• Distinguish facts from stories\n• Recognize jealousy as temporary\n\n🎯 LONG-TERM PRACTICES:\n• Regular therapy\n• Journaling practice\n• Meditation routine\n• Building self-esteem\n• Cultivating your own life/hobbies\n• Strengthening friendship network\n• Physical self-care\n• Processing past wounds',
            type: 'tip'
          },
          {
            heading: 'Partner Response to Jealousy',
            content: 'If your partner shares jealousy with you:\n\n✅ DO:\n• Listen without defensiveness\n• Thank them for sharing\n• Validate their feelings\n• Ask what they need\n• Provide reassurance\n• Follow through on agreements\n• Check in regularly\n• Be patient with the process\n• Show appreciation for them\n\n❌ DON\'T:\n• Dismiss their feelings\n• Get angry or defensive\n• Blame them for feeling jealous\n• Minimize the issue\n• Make them feel broken\n• Threaten to end other relationships immediately\n• Solve without listening first\n• Make promises you can\'t keep\n\n💡 REMEMBER:\nYour partner is trusting you with vulnerability. Honor that.',
            type: 'key-point'
          },
          {
            heading: 'Reassurance Strategies',
            content: '💕 WAYS TO PROVIDE REASSURANCE:\n\n📱 COMMUNICATION:\n• Regular check-ins\n• "Thinking of you" texts\n• Sharing highlights of your day\n• Verbal affirmations\n• "I love you" messages\n\n⏰ TIME:\n• Protected date nights\n• Quality over quantity\n• Undivided attention\n• Special rituals or traditions\n• Making plans together\n\n💑 PHYSICAL:\n• Affection and touch\n• Sexual connection\n• Holding hands\n• Cuddling\n• Intimate moments\n\n🎁 ACTIONS:\n• Small thoughtful gestures\n• Following through on commitments\n• Prioritizing important events\n• Remembering details\n• Showing up consistently\n\n💭 WORDS:\n• "You\'re irreplaceable"\n• "No one could take your place"\n• "I choose you every day"\n• "Our relationship is special because..."\n• "Here\'s what I love about you..."',
            type: 'example'
          },
          {
            heading: 'When Jealousy Reveals Real Problems',
            content: '⚠️ SOMETIMES JEALOUSY IS VALID:\n\nJealousy can signal legitimate concerns:\n\n🚩 BROKEN AGREEMENTS:\nPartner isn\'t following agreed boundaries\n\n🚩 NEGLECT:\nActual decrease in time, attention, or intimacy\n\n🚩 DISHONESTY:\nPartner is lying or withholding information\n\n🚩 DISRESPECT:\nPartner dismisses your feelings consistently\n\n🚩 NRE IMBALANCE:\nNew partner consuming all energy\n\n🚩 INCOMPATIBLE NEEDS:\nYour needs genuinely aren\'t being met\n\n✅ WHAT TO DO:\n• Identify the specific problem\n• Communicate clearly\n• Request specific changes\n• Renegotiate agreements if needed\n• Consider couples therapy\n• Assess if needs can be met\n• Make difficult decisions if necessary\n\nTrust your jealousy as information—investigate what it\'s telling you.',
            type: 'warning'
          },
          {
            heading: 'Compersion: The Jealousy Antidote',
            content: '💚 COMPERSION: Joy in your partner\'s joy.\n\n🌱 CULTIVATING COMPERSION:\n\n1. PROCESS YOUR JEALOUSY FIRST:\nCan\'t force compersion over unresolved jealousy\n\n2. FOCUS ON ABUNDANCE:\nLove multiplies, doesn\'t divide\n\n3. CELEBRATE THEIR HAPPINESS:\nTheir joy doesn\'t diminish yours\n\n4. REFRAME:\nInstead of "They\'re replacing me" → "They have more love in their life"\n\n5. PRACTICE GRATITUDE:\nAppreciate what you have\n\n6. BUILD YOUR OWN LIFE:\nFulfillment comes from multiple sources\n\n7. START SMALL:\nNotice tiny moments of compersion\n\n💡 IMPORTANT:\nCompersion isn\'t required for successful non-monogamy. It\'s a bonus, not a necessity. Don\'t feel guilty if it doesn\'t come naturally.',
            type: 'normal'
          },
          {
            heading: 'Jealousy in Different Contexts',
            content: '🎯 CONTEXT MATTERS:\n\n👫 NEW TO LIFESTYLE:\n• Jealousy often intense initially\n• Learning what triggers you\n• Testing boundaries\n• Building trust through experiences\n• Normal and expected\n\n🏆 EXPERIENCED BUT NEW RELATIONSHIP:\n• Jealousy can resurface\n• Different partners trigger different things\n• Past experiences inform current feelings\n• New dynamics require adjustment\n\n⚖️ UNEQUAL OPPORTUNITY:\n• One partner has more connections\n• Creates envy and inadequacy\n• Requires honest communication\n• May need to address underlying issues\n\n👥 GROUP DYNAMICS:\n• Jealousy among metamours\n• Complex comparison traps\n• Requires strong communication all around\n\nAdjust your strategies based on your specific context.',
            type: 'example'
          },
          {
            heading: 'When to Seek Professional Help',
            content: '🆘 CONSIDER THERAPY IF:\n\n• Jealousy is overwhelming and constant\n• You can\'t function normally\n• It\'s destroying your relationships\n• Self-help strategies aren\'t working\n• Past trauma is being triggered\n• You\'re having intrusive thoughts\n• Physical symptoms (can\'t eat/sleep)\n• Self-harm or extreme reactions\n• Relationship is in crisis\n\n💼 FIND:\n• Poly/CNM-friendly therapist\n• Someone who won\'t try to "fix" your relationship structure\n• Specialist in attachment or relationship issues\n• Both individual and couples therapy options\n\n🌐 RESOURCES:\n• AASECT (American Association of Sexuality Educators)\n• Psychology Today therapist finder\n• Poly-friendly therapy directories\n• Sliding scale options\n\nProfessional support is strength, not weakness.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Jealousy is normal, natural, and doesn\'t mean you\'re doing it wrong\n✅ Distinguish between jealousy (fear of loss) and envy (wanting what others have)\n✅ Common triggers include time scarcity, comparison, NRE, and insecurity\n✅ Use the processing framework: pause, name, investigate, communicate, act\n✅ Check HALT (Hungry, Angry, Lonely, Tired) before assuming relationship issue\n✅ Communicate jealousy with ownership, not blame\n✅ Self-soothing strategies help manage immediate intensity\n✅ Partners should respond with validation and reassurance, not defensiveness\n✅ Sometimes jealousy reveals real problems that need addressing\n✅ Compersion is lovely but not required\n✅ Seek professional help if jealousy is overwhelming\n\nJealousy doesn\'t disappear, but it can be understood, managed, and even transformed into opportunities for growth and deeper connection.',
            type: 'key-point'
          }
        ]
      },
      'mod-15': {
        estimatedTime: '20 minutes',
        sections: [
          {
            heading: 'Building Trust: The Foundation of Lifestyle Relationships',
            content: 'Trust is the bedrock of all successful relationships, but it\'s especially crucial in the lifestyle and non-monogamous contexts. When you\'re opening your relationship to others, trust in your primary partnership and with new connections becomes paramount.\n\nThis module explores how trust is built, maintained, and repaired in lifestyle relationships.',
            type: 'normal'
          },
          {
            heading: 'What Is Trust?',
            content: '🤝 TRUST DEFINED:\nThe firm belief in the reliability, truth, ability, or strength of someone.\n\n💭 IN RELATIONSHIPS, TRUST MEANS:\n• Believing your partner has your best interests at heart\n• Confidence they\'ll honor agreements\n• Security that they\'ll be honest\n• Faith they\'ll respect your boundaries\n• Assurance they won\'t intentionally harm you\n• Belief in their commitment to the relationship\n\n🎯 TRUST IN LIFESTYLE CONTEXTS:\n• Your partner will follow agreed boundaries\n• They\'ll communicate important information\n• They\'ll prioritize your wellbeing\n• They\'ll be honest about their experiences\n• They\'ll come back to you emotionally\n• They\'ll practice safer sex as agreed\n• They\'ll handle your vulnerability with care',
            type: 'normal'
          },
          {
            heading: 'The Components of Trust',
            content: 'Trust is built on multiple foundations:\n\n1️⃣ HONESTY:\nConsistent truthfulness, even when difficult\n\n2️⃣ RELIABILITY:\nFollowing through on commitments and promises\n\n3️⃣ CONSISTENCY:\nPredictable behavior over time\n\n4️⃣ TRANSPARENCY:\nOpenness about thoughts, feelings, and actions\n\n5️⃣ COMPETENCE:\nAbility to handle the lifestyle responsibly\n\n6️⃣ CARE:\nDemonstrated concern for your wellbeing\n\n7️⃣ RESPECT:\nHonoring boundaries and feelings\n\n8️⃣ ACCOUNTABILITY:\nTaking responsibility for mistakes\n\nAll components must be present for solid trust.',
            type: 'key-point'
          },
          {
            heading: 'How Trust Is Built',
            content: '🏗️ TRUST IS BUILT THROUGH:\n\n⏰ TIME:\n• Consistent behavior over extended periods\n• Proving reliability repeatedly\n• No shortcuts—trust takes time\n\n✅ SMALL ACTIONS:\n• Keeping small promises\n• Following through on minor commitments\n• Being on time\n• Responding when you say you will\n• Each small action builds or erodes trust\n\n💬 COMMUNICATION:\n• Sharing honestly, even when hard\n• Discussing difficult topics\n• Keeping partner informed\n• Being vulnerable\n\n🎯 BOUNDARY RESPECT:\n• Honoring stated limits consistently\n• Not testing or pushing boundaries\n• Asking when unsure\n• Respecting "no" immediately\n\n🔍 TRANSPARENCY:\n• Sharing relevant information\n• No secrets or hidden activities\n• Open phone/email policies (if agreed)\n• Honesty about feelings and experiences\n\n💡 KEY INSIGHT:\nTrust is built slowly through countless small actions but can be destroyed quickly through one major breach.',
            type: 'example'
          },
          {
            heading: 'Trust-Building Practices for Couples',
            content: '💑 STRENGTHEN TRUST IN YOUR PRIMARY RELATIONSHIP:\n\n📅 REGULAR CHECK-INS:\n• Weekly relationship talks\n• Discuss how lifestyle activities are affecting you\n• Address concerns before they grow\n• Celebrate what\'s working\n\n🤝 KEEP AGREEMENTS:\n• Follow your established boundaries\n• Renegotiate if boundaries need changing\n• Don\'t unilaterally change rules\n• Honor your word consistently\n\n💕 PRIORITIZE PRIMARY RELATIONSHIP:\n• Protected time together\n• Special rituals or traditions\n• Choose your partner in big moments\n• Maintain intimacy and connection\n\n📱 APPROPRIATE TRANSPARENCY:\n• Share relevant information about lifestyle activities\n• Don\'t hide connections or experiences\n• Balance transparency with metamour privacy\n• Be honest about feelings\n\n🎯 SHOW UP:\n• Be present for important events\n• Support through difficult times\n• Celebrate successes\n• Consistent emotional availability',
            type: 'tip'
          },
          {
            heading: 'Trust with New Connections',
            content: '🆕 BUILDING TRUST WITH LIFESTYLE PARTNERS:\n\n🐢 START SLOW:\n• Don\'t rush into deep trust\n• Let it develop naturally\n• Multiple interactions over time\n• Public meetings first\n\n🎯 OBSERVE CONSISTENCY:\n• Do their words match actions?\n• Are they reliable?\n• Do they follow through?\n• How do they handle boundaries?\n\n💬 CLEAR COMMUNICATION:\n• Discuss expectations explicitly\n• Share boundaries clearly\n• Ask about their agreements with their partner(s)\n• Verify stories and information\n\n🚩 WATCH FOR RED FLAGS:\n• Dishonesty about relationship status\n• Pressuring boundaries\n• Inconsistent information\n• Disrespecting your relationship\n• Drama with previous partners\n\n✅ VERIFY:\n• Video chat before meeting\n• Talk to their partner if possible\n• Check their standing in community\n• Trust but verify information',
            type: 'example'
          },
          {
            heading: 'Common Trust Violations in the Lifestyle',
            content: '⚠️ BEHAVIORS THAT BREAK TRUST:\n\n🚫 BOUNDARY VIOLATIONS:\n• Doing activities that were agreed off-limits\n• Pushing beyond stated boundaries\n• "Forgetting" important agreements\n\n🚫 DISHONESTY:\n• Lying about activities or connections\n• Hiding relationships\n• Misrepresenting your relationship status\n• Omitting important information\n\n🚫 SAFER SEX BREACHES:\n• Not using agreed protection\n• Hiding STI exposure\n• Removing condoms without consent (stealthing)\n\n🚫 EMOTIONAL BETRAYAL:\n• Sharing intimate details without permission\n• Comparing partners negatively\n• Prioritizing new partners over agreements\n• Emotional affairs without transparency\n\n🚫 BROKEN COMMITMENTS:\n• Canceling plans repeatedly\n• Not following through on promises\n• Prioritizing lifestyle over primary relationship\n\n🚫 PRIVACY VIOLATIONS:\n• Sharing private information\n• Posting photos without consent\n• Discussing your relationship publicly\n\nEven small violations erode trust over time.',
            type: 'warning'
          },
          {
            heading: 'When Trust Is Broken',
            content: '💔 IF TRUST IS VIOLATED:\n\n1️⃣ IMMEDIATE RESPONSE:\n• Stop lifestyle activities if needed\n• Create space to process\n• Seek support (friends, therapist)\n• Don\'t make permanent decisions in crisis\n\n2️⃣ ASSESS THE DAMAGE:\n• How serious was the violation?\n• Was it intentional or accidental?\n• Is this a pattern or isolated incident?\n• Does the person take responsibility?\n• Are you safe (physically, emotionally, sexually)?\n\n3️⃣ COMMUNICATION:\n• Express how the violation affected you\n• Listen to their explanation (not excuse)\n• Discuss what needs to happen for repair\n• Set clear expectations going forward\n\n4️⃣ DECIDE ON PATH FORWARD:\n• Can trust be rebuilt?\n• What needs to change?\n• What accountability is required?\n• Is professional help needed?\n• Is the relationship salvageable?',
            type: 'key-point'
          },
          {
            heading: 'Rebuilding Trust After a Breach',
            content: '🔨 TRUST REPAIR REQUIRES:\n\n👤 FROM THE VIOLATOR:\n• FULL ACCOUNTABILITY: Own the violation completely\n• GENUINE REMORSE: Show true understanding of harm caused\n• NO EXCUSES: Don\'t minimize or blame others\n• TRANSPARENCY: Answer all questions honestly\n• CHANGED BEHAVIOR: Demonstrate concrete changes\n• PATIENCE: Accept it takes time\n• CONSISTENCY: Prove reliability over time\n• AMENDS: Take actions to repair harm\n\n👤 FROM THE HURT PARTNER:\n• WILLINGNESS: Choose to work toward rebuilding\n• COMMUNICATION: Express needs and feelings\n• BOUNDARIES: Set clear expectations\n• PATIENCE: Allow time for healing\n• VERIFICATION: It\'s okay to need proof\n• SELF-CARE: Process your feelings\n• PROFESSIONAL HELP: Therapy can guide the process\n• DECISION POWER: You decide if/when trust is rebuilt\n\n⏰ TIMELINE:\n• Trust rebuilds slowly\n• Often takes longer to rebuild than initial building\n• Months to years, not days or weeks\n• Requires consistent positive actions\n• Some trust may never fully return',
            type: 'example'
          },
          {
            heading: 'Trust and Vulnerability',
            content: '💭 THE RELATIONSHIP:\nTrust enables vulnerability; vulnerability deepens trust.\n\n🎯 VULNERABILITY IN LIFESTYLE:\n• Sharing jealous feelings\n• Admitting insecurities\n• Expressing needs\n• Discussing fears\n• Acknowledging mistakes\n• Asking for reassurance\n• Being honest about struggles\n\n✅ WHEN YOU\'RE VULNERABLE:\nYour partner\'s response either strengthens or weakens trust.\n\n💕 TRUST-BUILDING RESPONSES:\n• Listening without judgment\n• Validating feelings\n• Providing reassurance\n• Taking concerns seriously\n• Following through on solutions\n• Showing appreciation for honesty\n\n💔 TRUST-BREAKING RESPONSES:\n• Dismissing feelings\n• Mocking vulnerability\n• Using shared information against you\n• Becoming defensive or angry\n• Minimizing concerns\n• Breaking confidence\n\nHow you handle vulnerability determines relationship depth.',
            type: 'normal'
          },
          {
            heading: 'Self-Trust in the Lifestyle',
            content: '🪞 TRUSTING YOURSELF:\n\nBefore you can fully trust others, trust yourself:\n\n✅ TRUST YOUR INSTINCTS:\n• Listen to your gut feelings\n• Honor discomfort\n• Recognize red flags\n• Trust your "no"\n\n✅ TRUST YOUR BOUNDARIES:\n• Know your limits\n• Enforce them consistently\n• Don\'t compromise for approval\n• Adjust as you learn\n\n✅ TRUST YOUR RESILIENCE:\n• You can handle difficult emotions\n• You\'ll survive if things go wrong\n• You have the strength to leave if needed\n• You can rebuild after setbacks\n\n✅ TRUST YOUR JUDGMENT:\n• You can assess character\n• You can make good decisions\n• You learn from mistakes\n• You know what\'s right for you\n\nSelf-trust is the foundation for trusting others.',
            type: 'key-point'
          },
          {
            heading: 'Trust and Control',
            content: '⚖️ THE PARADOX:\nTrust requires letting go of control.\n\n🚫 CONTROL BEHAVIORS (BREAK TRUST):\n• Tracking partner\'s location constantly\n• Reading all messages\n• Forbidding certain connections\n• Demanding constant updates\n• Making unilateral rules\n• Threatening to leave if they do X\n\n✅ TRUST BEHAVIORS:\n• Allowing autonomy\n• Believing they\'ll follow agreements\n• Accepting you can\'t control outcomes\n• Focusing on communication, not surveillance\n• Setting boundaries, not restrictions\n• Choosing trust despite risk\n\n💭 THE SHIFT:\nFrom "How can I control them?" to "Can I trust them to make good choices?"\n\nIf the answer is no, address the trust issue—not with more control, but with honest conversation.',
            type: 'warning'
          },
          {
            heading: 'Signs of Healthy Trust',
            content: '✅ YOU HAVE HEALTHY TRUST WHEN:\n\n💚 PEACE:\n• You feel secure in the relationship\n• Minimal anxiety when apart\n• Confidence in their commitment\n• Calm about lifestyle activities\n\n💚 OPENNESS:\n• Comfortable sharing feelings\n• Honest about struggles\n• Transparent about activities\n• Open communication flows naturally\n\n💚 AUTONOMY:\n• Both partners have independence\n• No need for constant checking in\n• Trust in each other\'s judgment\n• Freedom without anxiety\n\n💚 RESILIENCE:\n• Conflicts don\'t destroy trust\n• You work through issues together\n• Trust strengthens over time\n• Recovery from setbacks\n\n💚 CONSISTENCY:\n• Reliable behavior over time\n• Kept promises and commitments\n• Aligned words and actions\n• Predictable integrity\n\nHealthy trust feels secure but not suffocating, open but not anxious.',
            type: 'key-point'
          },
          {
            heading: 'When Trust Can\'t Be Rebuilt',
            content: '💔 SOMETIMES TRUST IS IRREPARABLE:\n\n⚠️ SIGNS TO END THE RELATIONSHIP:\n• Repeated violations despite promises\n• No genuine remorse or accountability\n• Patterns of lying continue\n• You don\'t feel safe\n• Your mental health is suffering\n• They blame you for their violations\n• Changes are superficial, not real\n• You\'ve lost respect for them\n• The relationship causes more pain than joy\n• Your gut says it\'s over\n\n✅ IT\'S OKAY TO:\n• Decide trust can\'t be rebuilt\n• End the relationship\n• Protect yourself\n• Choose your wellbeing\n• Walk away from someone who repeatedly breaks trust\n\n💪 MOVING FORWARD:\n• Process the grief\n• Learn from the experience\n• Don\'t let it destroy your ability to trust others\n• Seek support\n• Take time to heal\n• Trust yourself to choose better next time',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: '✅ Trust is the foundation of all successful lifestyle relationships\n✅ Trust is built through time, consistency, honesty, and kept promises\n✅ Small actions build or erode trust daily\n✅ Trust in your primary relationship must be solid before opening up\n✅ Build trust slowly with new connections—verify, don\'t just trust\n✅ Common violations include boundary breaches, dishonesty, and broken agreements\n✅ Trust can be rebuilt after violations, but requires work from both partners\n✅ Rebuilding trust takes time and consistent positive actions\n✅ Vulnerability deepens trust when met with supportive responses\n✅ Trust yourself and your instincts\n✅ Control behaviors break trust; autonomy within boundaries builds it\n✅ Sometimes trust can\'t be repaired—it\'s okay to end the relationship\n\nTrust is earned slowly, lost quickly, and rebuilt even slower. Protect it like the precious resource it is.',
            type: 'key-point'
          }
        ]
      }
    };

    return content[id] || { sections: [], estimatedTime: '15 min' };
  };

  const content = getModuleContent(moduleId);

  const getSectionStyle = (type?: string) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg';
      case 'warning':
        return 'bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg';
      case 'example':
        return 'bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg';
      case 'key-point':
        return 'bg-pink-500/10 border-l-4 border-pink-500 p-4 rounded-r-lg';
      default:
        return '';
    }
  };

  const getSectionIcon = (type?: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-blue-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'example':
        return <BookOpen className="h-5 w-5 text-purple-400" />;
      case 'key-point':
        return <CheckCircle className="h-5 w-5 text-pink-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-pink-500/30">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-pink-500/30 p-6 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>📚 {content.estimatedTime}</span>
              <span>•</span>
              <span>{content.sections.length} sections</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Content */}
        <div 
          id="module-content-scroll"
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {content.sections.map((section, index) => (
            <div key={index} className={`space-y-3 ${getSectionStyle(section.type)}`}>
              <div className="flex items-center gap-2">
                {getSectionIcon(section.type)}
                <h3 className="text-xl font-semibold text-pink-400">{section.heading}</h3>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}

          {/* Completion Message */}
          {canComplete && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                <CheckCircle className="h-5 w-5" />
                You've completed the reading!
              </div>
              <p className="text-white/70 text-sm">
                You can now proceed to the quiz to test your knowledge.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-pink-500/30 p-6">
          <Button
            onClick={onComplete}
            disabled={!canComplete}
            className={`w-full font-semibold py-3 rounded-full transition-all ${
              canComplete
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {canComplete ? 'Complete Module & Take Quiz' : 'Scroll to the bottom to continue'}
          </Button>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
