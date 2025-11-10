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
