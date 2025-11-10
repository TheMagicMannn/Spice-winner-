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
