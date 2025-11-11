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
            content: 'The lifestyle is built on trust, respect, and mutual understanding. Unlike traditional relationship dynamics, lifestyle interactions often involve:\n\nâ¢ Multiple partners or potential connections\nâ¢ Complex emotional landscapes\nâ¢ Diverse expectations and boundaries\nâ¢ Sensitive topics that require vulnerability\nâ¢ Time-sensitive decisions during social events\n\nWithout strong communication skills, these factors can lead to misunderstandings, hurt feelings, or uncomfortable situations. Conversely, excellent communication creates opportunities for deeper connections, more fulfilling experiences, and a supportive community.',
            type: 'normal'
          },
          {
            heading: 'The Four Pillars of Lifestyle Communication',
            content: '1. CLARITY: Using specific, unambiguous language\n2. HONESTY: Being truthful about feelings, desires, and limits\n3. RESPECT: Honoring others\' perspectives and boundaries\n4. CONSISTENCY: Following through on commitments and promises\n\nThese four pillars work together to create a communication framework that serves you in every lifestyle interaction, from first conversations to long-term connections.',
            type: 'key-point'
          },
          {
            heading: 'The Importance of Clarity',
            content: 'Vague communication is one of the leading causes of problems in lifestyle interactions. When you say "I\'m open to exploring," what exactly does that mean? Does it mean:\n\nâ¢ You\'re curious but need to take things slowly?\nâ¢ You\'re interested in specific activities only?\nâ¢ You\'re completely open to anything?\nâ¢ You need more information before deciding?\n\nWithout clarity, your partner or potential connections must guess at your meaning, which often leads to mismatched expectations.',
            type: 'normal'
          },
          {
            heading: 'How to Communicate Clearly',
            content: 'Instead of vague statements, practice using specific language:\n\nâ VAGUE: "I\'m interested in that"\nâ CLEAR: "I\'m interested in soft play but not full swap"\n\nâ VAGUE: "Maybe we can try sometime"\nâ CLEAR: "I\'d like to try that, but I need to discuss it with my partner first"\n\nâ VAGUE: "I\'m not sure about this"\nâ CLEAR: "I\'m feeling hesitant because I need to understand the expectations better"\n\nNotice how the clear versions leave no room for misinterpretation. They state exactly what you mean, what you need, and where you stand.',
            type: 'example'
          },
          {
            heading: 'Practical Exercise: Clarity in Action',
            content: 'Think about a recent conversation where there might have been confusion. How could you have been more specific? Practice rewriting these common vague phrases into clear statements:\n\nâ¢ "We\'ll see how the night goes" â ?\nâ¢ "I\'m comfortable with most things" â ?\nâ¢ "Let\'s just have fun" â ?\n\nThe clearer you are from the start, the better the outcome for everyone involved.',
            type: 'tip'
          },
          {
            heading: 'Active Listening: The Other Half of Communication',
            content: 'Communication is not just about speaking clearlyâit\'s equally about listening effectively. Active listening involves:\n\nâ¢ Giving your full attention (put the phone away)\nâ¢ Making eye contact and using body language\nâ¢ Not interrupting or planning your response while they\'re talking\nâ¢ Asking clarifying questions\nâ¢ Paraphrasing to confirm understanding\nâ¢ Acknowledging emotions, not just facts',
            type: 'normal'
          },
          {
            heading: 'The Paraphrasing Technique',
            content: 'One of the most powerful listening tools is paraphrasing. After someone shares something important, repeat it back in your own words:\n\n"So what I\'m hearing is that you\'re interested in joining us, but you\'d prefer to start with just social interaction tonight. Is that right?"\n\nThis accomplishes three things:\n1. Confirms you understood correctly\n2. Shows them you\'re truly listening\n3. Gives them a chance to clarify if needed\n\nThis simple technique prevents countless misunderstandings.',
            type: 'example'
          },
          {
            heading: 'Common Listening Mistakes to Avoid',
            content: 'ð« Interrupting with your own story ("Oh, that reminds me of when I...")\nð« Immediately offering solutions instead of understanding\nð« Judging or criticizing what they\'re sharing\nð« Dismissing their feelings ("You shouldn\'t feel that way")\nð« Being distracted by your phone or surroundings\nð« Waiting for your turn to talk instead of truly listening\n\nRecognize these patterns in yourself and work to eliminate them. They destroy connection and trust.',
            type: 'warning'
          },
          {
            heading: 'Building Trust Through Consistent Communication',
            content: 'Trust in the lifestyle is everything. It\'s built through consistent, reliable communication over time. This means:\n\nâ¢ Saying what you mean and meaning what you say\nâ¢ Following through on plans and commitments\nâ¢ Being honest even when it\'s uncomfortable\nâ¢ Admitting mistakes and miscommunications\nâ¢ Maintaining confidentiality when agreed upon\nâ¢ Responding to messages in a reasonable timeframe\n\nEvery interaction either builds or erodes trust. Make each one count.',
            type: 'normal'
          },
          {
            heading: 'The 24-Hour Rule',
            content: 'A practical guideline used by many successful lifestyle participants:\n\nWhen you receive a message or invitation that requires a decision, respond within 24 hoursâeven if your response is "I need more time to think about this."\n\nThis shows respect for others\' time and demonstrates that you\'re a reliable communicator. It prevents the anxiety of wondering if your message was received or if you\'re being ignored.',
            type: 'tip'
          },
          {
            heading: 'Navigating Difficult Conversations',
            content: 'Not every conversation will be easy. Sometimes you need to:\n\nâ¢ Decline an invitation\nâ¢ Express that boundaries were crossed\nâ¢ Address hurt feelings or misunderstandings\nâ¢ End a connection that isn\'t working\nâ¢ Discuss changing interests or desires\n\nThese conversations are harder, but they\'re where strong communication skills matter most. Approach them with:\n\n1. Timing: Choose a private, calm moment\n2. Honesty: Be direct but kind\n3. Respect: Acknowledge their perspective\n4. Solutions: Offer constructive paths forward when possible',
            type: 'normal'
          },
          {
            heading: 'Real-World Scenario',
            content: 'SITUATION: You\'re at a lifestyle event and a couple approaches you with interest, but you\'re not attracted to them. How do you communicate this?\n\nâ POOR: Avoiding them, giving fake numbers, or lying about having plans\n\nâ GOOD: "Thank you so much for the interest! I appreciate you approaching us. We\'re looking for a slightly different connection tonight, but we wish you a wonderful evening."\n\nThis is honest, kind, clear, and respectful. It leaves no room for confusion while maintaining everyone\'s dignity.',
            type: 'example'
          },
          {
            heading: 'Digital Communication in the Lifestyle',
            content: 'Much of lifestyle communication happens digitallyâmessages, apps, video chats. Apply the same principles:\n\nâ¢ Be clear in texts (tone can be misread)\nâ¢ Use proper grammar and spelling (shows respect)\nâ¢ Respond within reasonable timeframes\nâ¢ Don\'t ghostâalways close loops\nâ¢ Be cautious with explicit content until consent is clear\nâ¢ Remember: screenshots exist, be thoughtful\n\nDigital communication is permanent. Treat it with the same care as in-person conversations.',
            type: 'warning'
          },
          {
            heading: 'Cultural Differences and Communication',
            content: 'The lifestyle community is diverse, with people from different backgrounds, cultures, and communication styles. What\'s direct in one culture might be rude in another. What\'s polite in one context might be confusing in another.\n\nWhen in doubt:\nâ¢ Ask questions\nâ¢ Don\'t make assumptions\nâ¢ Be patient with language barriers\nâ¢ Appreciate different approaches\nâ¢ Find common ground through respect',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Clarity prevents misunderstandingsâbe specific\nâ Active listening is as important as speaking\nâ Trust is built through consistent, honest communication\nâ Paraphrase to confirm understanding\nâ Respond to messages within 24 hours when possible\nâ Handle difficult conversations with honesty and respect\nâ Digital communication requires the same care as in-person\nâ Respect cultural differences in communication styles\n\nMastering these fundamentals will transform your lifestyle experience.',
            type: 'key-point'
          },
          {
            heading: 'Before You Continue to the Quiz',
            content: 'Take a moment to reflect:\n\nâ¢ Which communication skill do you most need to develop?\nâ¢ Can you think of a past situation where better communication would have helped?\nâ¢ What specific phrase or technique will you try first?\n\nThe quiz will test your understanding of these concepts. Make sure you\'ve absorbed the material before proceeding.',
            type: 'tip'
          }
        ]
      },
      'mod-2': {
        estimatedTime: '20-25 minutes',
        sections: [
          {
            heading: 'Understanding Boundaries: Your Personal Blueprint',
            content: 'Boundaries are personal limits that define what you are comfortable with in various situations. Think of them as your personal blueprint for healthy interactionsâthey protect your physical, emotional, and mental well-being while allowing you to connect authentically with others.\n\nIn the lifestyle, boundaries aren\'t restrictionsâthey\'re the framework that makes authentic connection possible. Without clear boundaries, you risk resentment, burnout, or experiences that leave you feeling uncomfortable or violated. With strong boundaries, you create space for genuine pleasure, trust, and growth.',
            type: 'normal'
          },
          {
            heading: 'Why Boundaries Matter in the Lifestyle',
            content: 'The lifestyle involves unique situations that don\'t exist in traditional relationships:\n\nâ¢ Physical intimacy with people you may have just met\nâ¢ Navigating attractions while honoring existing relationships\nâ¢ Balancing multiple connections and schedules\nâ¢ Managing privacy and discretion\nâ¢ Exploring desires that may push your comfort zone\n\nWithout clear boundaries, these situations become chaotic and potentially harmful. With them, they become opportunities for incredible experiences.',
            type: 'normal'
          },
          {
            heading: 'The Six Types of Lifestyle Boundaries',
            content: '1. PHYSICAL BOUNDARIES\n   What physical activities, contact, and intimacy you\'re comfortable with\n\n2. EMOTIONAL BOUNDARIES\n   The level of emotional connection and vulnerability you\'re open to\n\n3. TIME BOUNDARIES\n   When and how often you\'re available for lifestyle activities\n\n4. PRIVACY BOUNDARIES\n   What personal information you share and with whom\n\n5. RELATIONSHIP BOUNDARIES\n   Rules and agreements within your primary relationship\n\n6. SOCIAL BOUNDARIES\n   How you interact in lifestyle spaces and who you connect with\n\nEach type requires separate consideration and clear communication.',
            type: 'key-point'
          },
          {
            heading: 'Deep Dive: Physical Boundaries',
            content: 'Physical boundaries are often what people think of first, but they\'re more nuanced than you might expect. Consider:\n\nâ¢ What types of touch are you comfortable with?\nâ¢ Are there specific activities that are off-limits?\nâ¢ Do your boundaries change based on attraction level?\nâ¢ Are there activities you\'ll do with some partners but not others?\nâ¢ Do you have boundaries around safer sex practices?\nâ¢ Are there body parts or zones that are not okay to touch?\nâ¢ Do your boundaries differ in group settings vs. one-on-one?\n\nBe specific. "I\'m okay with most things" is not a boundaryâit\'s an invitation for confusion.',
            type: 'normal'
          },
          {
            heading: 'Emotional Boundaries: The Often-Overlooked Dimension',
            content: 'Physical boundaries get a lot of attention, but emotional boundaries are equally important. In the lifestyle, emotional boundaries might include:\n\nâ¢ Not sharing deeply personal life details with casual connections\nâ¢ Limiting communication frequency with play partners\nâ¢ Keeping certain activities exclusive to your primary relationship\nâ¢ Not developing romantic feelings for play partners\nâ¢ Maintaining appropriate relationship expectations\nâ¢ Protecting your primary relationship\'s emotional primacy\n\nEmotional boundaries prevent situations where play partners develop unexpected attachment or where your primary relationship feels threatened.',
            type: 'normal'
          },
          {
            heading: 'Common Emotional Boundary Mistakes',
            content: 'ð« Texting play partners more frequently than your primary partner\nð« Sharing relationship problems with play partners\nð« Seeking emotional support from connections instead of your partner\nð« Comparing partners or making one feel inferior\nð« Keeping secrets from your primary partner\nð« Allowing new connections to interfere with existing commitments\n\nThese patterns erode primary relationships and create complicated situations. Set clear emotional boundaries from the start.',
            type: 'warning'
          },
          {
            heading: 'Time Boundaries: Protecting Your Life Balance',
            content: 'The lifestyle can be exciting and all-consuming, but it shouldn\'t take over your life. Time boundaries help you maintain balance:\n\nâ¢ Designate specific days/times for lifestyle activities\nâ¢ Protect date nights with your primary partner\nâ¢ Maintain boundaries around work and family time\nâ¢ Set limits on messaging and app usage\nâ¢ Don\'t let lifestyle activities interfere with responsibilities\nâ¢ Schedule breaks to reconnect with your partner\n\nWithout time boundaries, the lifestyle can become overwhelming and damage your primary relationship.',
            type: 'normal'
          },
          {
            heading: 'Privacy Boundaries in the Digital Age',
            content: 'Privacy is crucial in the lifestyle. Consider what you share:\n\nð± PROFILE INFORMATION\nâ¢ Do you use real names or lifestyle names?\nâ¢ Do you show your face in photos?\nâ¢ What personal details do you include?\nâ¢ Where do you mention you live?\n\nð¬ CONVERSATIONS\nâ¢ How much about your vanilla life do you share?\nâ¢ Do you discuss your workplace or profession?\nâ¢ Do you share photos of your home or identifying locations?\n\nð¤ IN-PERSON MEETINGS\nâ¢ Do you give out your real phone number?\nâ¢ Do you meet in your own neighborhood?\nâ¢ Do you share your social media accounts?\n\nYour privacy boundaries should reflect your comfort level with potential exposure.',
            type: 'example'
          },
          {
            heading: 'Discovering Your Boundaries',
            content: 'Many people don\'t know their boundaries until they\'re crossed. Here\'s how to identify them proactively:\n\n1. REFLECT on past experiences\n   What felt good? What didn\'t?\n\n2. VISUALIZE scenarios\n   Imagine different situationsâhow do they make you feel?\n\n3. DISCUSS with your partner\n   What are their boundaries? Where do yours align?\n\n4. START CONSERVATIVE\n   It\'s easier to expand boundaries than heal from crossing them\n\n5. CHECK IN with yourself\n   How do you feel before, during, and after experiences?\n\nBoundaries aren\'t always obviousâthey require self-awareness and honest self-reflection.',
            type: 'tip'
          },
          {
            heading: 'Communicating Your Boundaries Effectively',
            content: 'Knowing your boundaries is only half the battleâyou must communicate them clearly:\n\nâ BE DIRECT: "I\'m not comfortable with..." not "I don\'t think I want to..."\nâ BE SPECIFIC: "No full swap" not "Let\'s take it slow"\nâ BE CONFIDENT: State them as facts, not apologies\nâ BE EARLY: Share boundaries before situations arise\nâ BE CONSISTENT: Don\'t waffle or send mixed signals\n\nUse "I" statements:\nâ¢ "I need to check in with my partner first"\nâ¢ "I\'m not comfortable with that activity"\nâ¢ "I need to take a break"\nâ¢ "I\'d prefer to keep this interaction social tonight"',
            type: 'key-point'
          },
          {
            heading: 'When to Communicate Boundaries',
            content: 'TIMING IS EVERYTHING. Share boundaries:\n\nð BEFORE MEETING\nIn initial messages, establish basic boundaries and expectations\n\nð AT THE START OF DATES\n"Before we get too far, let\'s talk about what we\'re all comfortable with tonight"\n\nð WHEN THINGS SHIFT\nIf the energy or activity level changes, check in\n\nð IMMEDIATELY IF UNCOMFORTABLE\nDon\'t waitâspeak up the moment something feels wrong\n\nNever assume others know your boundaries. Always communicate them explicitly.',
            type: 'normal'
          },
          {
            heading: 'Real-World Scenario: Boundary Communication',
            content: 'SITUATION: You\'re at a meet-and-greet and a couple invites you back to their place. You\'re attracted but not ready for play on a first meeting.\n\nâ POOR RESPONSE:\n"Um, maybe... I\'ll see how I feel..."\n(Vague, unclear, leads to confusion)\n\nâ GOOD RESPONSE:\n"We\'re definitely attracted and would love to get to know you better! Our boundary is that we don\'t play on first meetingsâit helps us make sure the connection is right. Could we exchange numbers and plan something for next week?"\n\nThis is clear, confident, and leaves the door open while maintaining your boundary.',
            type: 'example'
          },
          {
            heading: 'Respecting Others\' Boundaries',
            content: 'When someone shares a boundary with you:\n\nâ ACCEPT IT IMMEDIATELY\n   Don\'t question, negotiate, or ask for explanations\n\nâ THANK THEM\n   "Thanks for being clear about that"\n\nâ REMEMBER IT\n   Don\'t make them repeat their boundaries\n\nâ HONOR IT COMPLETELY\n   Don\'t test or push boundaries\n\nâ CHECK UNDERSTANDING\n   If unclear, ask clarifying questions\n\nRespecting boundaries isn\'t just about being a good personâit\'s about being a safe person to play with. Your reputation in the lifestyle depends on it.',
            type: 'key-point'
          },
          {
            heading: 'Red Flags: Boundary Violations to Watch For',
            content: 'ð© Someone asks you to keep secrets from your partner\nð© They pressure you after you\'ve said no\nð© They act hurt or angry when you set boundaries\nð© They "forget" boundaries you\'ve clearly stated\nð© They test boundaries to see what they can get away with\nð© They make you feel guilty for having boundaries\nð© They proceed with activities without clear consent\n\nThese behaviors indicate someone who doesn\'t respect boundaries. End the interaction immediately.',
            type: 'warning'
          },
          {
            heading: 'Boundaries Can ChangeâAnd That\'s Okay',
            content: 'Your boundaries aren\'t set in stone. They can and should evolve as you:\n\nâ¢ Gain experience and confidence\nâ¢ Discover new interests\nâ¢ Process past experiences\nâ¢ Change life circumstances\nâ¢ Grow in your relationships\n\nWhat\'s NOT okay:\nâ¢ Changing boundaries mid-scene without discussion\nâ¢ Feeling pressured to change boundaries\nâ¢ Ignoring your gut feelings to please others\nâ¢ Expanding boundaries before you\'re ready\n\nRegular check-ins with yourself and your partner help you understand when boundaries are naturally evolving vs. when you\'re compromising them under pressure.',
            type: 'normal'
          },
          {
            heading: 'Boundary Maintenance: The Ongoing Work',
            content: 'Setting boundaries once isn\'t enough. You must maintain them:\n\n1. REGULAR CHECK-INS\n   With yourself and your partnerâare boundaries still serving you?\n\n2. AFTER-ACTION REVIEWS\n   After lifestyle experiences, discuss what worked and what didn\'t\n\n3. ADJUSTMENT AS NEEDED\n   If something doesn\'t feel right, it\'s okay to adjust\n\n4. CLEAR COMMUNICATION\n   If boundaries change, communicate the changes\n\n5. ACCOUNTABILITY\n   Hold yourself and your partner accountable to stated boundaries',
            type: 'tip'
          },
          {
            heading: 'When Boundaries Are Crossed',
            content: 'If your boundary is violated:\n\n1. STOP IMMEDIATELY\n   Use your safe word or clearly say "stop"\n\n2. REMOVE YOURSELF\n   Leave the situation if needed\n\n3. PROCESS YOUR FEELINGS\n   Talk to your partner about what happened\n\n4. ADDRESS IT DIRECTLY\n   Communicate with the person who crossed your boundary\n\n5. LEARN FROM IT\n   What can you do differently next time?\n\n6. CUT CONTACT IF NEEDED\n   If someone intentionally violated boundaries, end the connection\n\nYou are never wrong for enforcing your boundaries, even if it creates awkwardness or disappointment.',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Boundaries protect your well-being and enable authentic connection\nâ Six types: Physical, Emotional, Time, Privacy, Relationship, Social\nâ Communicate boundaries clearly, specifically, and confidently\nâ Share boundaries early and often\nâ Respect others\' boundaries without question or negotiation\nâ Boundaries can evolveâthat\'s healthy and normal\nâ Red flags indicate people who don\'t respect boundariesâwalk away\nâ If boundaries are crossed, address it immediately\nâ No explanation or justification needed for your boundaries\n\nMastering boundaries is essential for safe, fulfilling lifestyle experiences.',
            type: 'key-point'
          },
          {
            heading: 'Reflection Exercise',
            content: 'Before proceeding to the quiz, take 2-3 minutes to answer:\n\nâ¢ What are your three most important boundaries?\nâ¢ Have you communicated them clearly to your partner?\nâ¢ What boundary do you most struggle to enforce?\nâ¢ How will you handle it if someone crosses your boundary?\n\nWrite these down. Clear boundaries require conscious thought and commitment.',
            type: 'tip'
          }
        ]
      },
      'mod-3': {
        estimatedTime: '25-30 minutes',
        sections: [
          {
            heading: 'The Foundation: Consent',
            content: 'Consent is an enthusiastic, ongoing agreement to participate in any activity. In the lifestyle, consent isn\'t just importantâit\'s the absolute foundation of everything we do. Without clear, genuine consent, no activity should proceed, period.\n\nThis module goes deep into the nuances of consent, negotiation, and ensuring everyone involved is truly on boardânot just saying yes, but enthusiastically agreeing. We\'ll explore the FRIES model, practical negotiation techniques, and how to handle consent in real-time situations.',
            type: 'normal'
          },
          {
            heading: 'Why Consent Is Non-Negotiable',
            content: 'The lifestyle community is built on trust and mutual respect. Consent violations don\'t just harm individualsâthey harm the entire community by:\n\nâ¢ Creating unsafe spaces\nâ¢ Destroying trust between community members\nâ¢ Giving the lifestyle a bad reputation\nâ¢ Potentially involving legal consequences\nâ¢ Causing lasting psychological harm\n\nOn the flip side, a culture of clear, enthusiastic consent creates:\nâ¢ Safe, exciting experiences\nâ¢ Deeper connections\nâ¢ Increased trust\nâ¢ Better experiences for everyone\nâ¢ A thriving, welcoming community',
            type: 'normal'
          },
          {
            heading: 'Common Myths About Consent',
            content: 'Let\'s clear up dangerous misconceptions:\n\nâ MYTH: "If they\'re in a lifestyle space, they consent to activities"\nâ TRUTH: Being in a space is not consent to anything\n\nâ MYTH: "They consented last time, so it\'s okay now"\nâ TRUTH: Consent must be obtained every single time\n\nâ MYTH: "They didn\'t say no"\nâ TRUTH: Only yes means yes. Silence or absence of no is not consent\n\nâ MYTH: "They seemed into it"\nâ TRUTH: Assumptions don\'t count. Verbal consent is required\n\nâ MYTH: "It\'s too awkward to ask"\nâ TRUTH: Asking for consent is sexy and shows respect\n\nThese myths have caused real harm. Know the truth.',
            type: 'warning'
          },
          {
            heading: 'The FRIES Model of Consent',
            content: 'FRIES is an acronym that defines the key elements of true consent:\n\nF - FREELY GIVEN\nConsent must be given without pressure, coercion, manipulation, or under the influence of substances that impair judgment\n\nR - REVERSIBLE\nAnyone can withdraw consent at any time, for any reason, without explanation or penalty\n\nI - INFORMED\nAll parties must fully understand what they\'re consenting to, including risks and implications\n\nE - ENTHUSIASTIC\nConsent should be clear, positive, and actively givenânot reluctant or pressured\n\nS - SPECIFIC\nConsent to one activity doesn\'t mean consent to others. Each action requires separate consent',
            type: 'key-point'
          },
          {
            heading: 'Deep Dive: Freely Given Consent',
            content: 'Consent is NOT freely given when:\n\nð« Someone feels pressured or obligated\nð« There\'s a power imbalance (boss/employee, host/guest at party)\nð« Someone is intoxicated or under influence\nð« They\'re worried about consequences of saying no\nð« They\'re trying to please their partner\nð« They fear being judged or ostracized\nð« They\'ve been worn down by repeated asking\n\nTrue consent comes from a place of genuine desire and free choice. If someone seems hesitant, pause and check in. Better to have an awkward conversation than to proceed without true consent.',
            type: 'normal'
          },
          {
            heading: 'Understanding Reversible Consent',
            content: 'One of the most important aspects of consent: it can be withdrawn at ANY time.\n\nExamples of reversible consent:\nâ¢ Someone can say yes, then change their mind\nâ¢ You can be in the middle of an activity and stop\nâ¢ Previous consent doesn\'t mean automatic future consent\nâ¢ Being aroused doesn\'t mean you can\'t stop\n\nWhen someone withdraws consent:\nâ STOP IMMEDIATELY\nâ Don\'t ask why or try to convince them\nâ Thank them for being honest\nâ Don\'t make them feel guilty\nâ Respect their decision completely\n\nAnyone who gets upset when consent is withdrawn is not safe to play with.',
            type: 'normal'
          },
          {
            heading: 'Informed Consent: Full Disclosure Required',
            content: 'People can\'t truly consent to something they don\'t fully understand. Informed consent requires disclosing:\n\nâ¢ What activities you want to engage in\nâ¢ Any potential risks or discomforts\nâ¢ Your STI status and safer sex practices\nâ¢ If others will be present or joining\nâ¢ If you\'ll be recording or taking photos\nâ¢ Any relationship status or commitments\nâ¢ Relevant health information\nâ¢ What happens if someone changes their mind\n\nWithholding information that could affect someone\'s decision is a violation of consent, even if they technically said yes.',
            type: 'key-point'
          },
          {
            heading: 'Case Study: Informed Consent Violation',
            content: 'SCENARIO:\nA couple agrees to play with another couple. During the encounter, the husband of the second couple reveals he and his wife have a "don\'t ask, don\'t tell" policyâshe doesn\'t actually know about this encounter.\n\nWHY THIS IS WRONG:\nThe first couple consented to play with a consensual foursome. They did not consent to participate in cheating or deception. This is an informed consent violation because critical information was withheld.\n\nRIGHT APPROACH:\nFull disclosure before any interaction begins. If someone is hiding the encounter from a partner, that\'s a red flag and you should decline.',
            type: 'example'
          },
          {
            heading: 'Enthusiastic Consent: Yes Means YES',
            content: 'Enthusiastic consent is:\n\nâ "Yes! I\'d love to"\nâ "That sounds amazing"\nâ "I\'ve been hoping you\'d ask"\nâ Eager body language and engagement\nâ Active participation\n\nEnthusiastic consent is NOT:\n\nâ "I guess so"\nâ "If you want to"\nâ "I don\'t know..."\nâ Silence or lack of resistance\nâ Passive acceptance\nâ Reluctant agreement\n\nIf someone doesn\'t seem enthusiastic, pause and check in. Aim for "Hell yes!" not "Well, okay..."',
            type: 'normal'
          },
          {
            heading: 'Specific Consent: Each Activity Requires Permission',
            content: 'Consent is not a blanket agreement. Just because someone consents to one thing doesn\'t mean they consent to everything.\n\nExamples:\nâ¢ Consenting to kissing â  consenting to sex\nâ¢ Consenting to soft play â  consenting to full swap\nâ¢ Consenting to photos in underwear â  consenting to nude photos\nâ¢ Consenting to a threesome â  consenting to a gangbang\nâ¢ Consenting Monday â  automatic consent on Tuesday\n\nEach escalation in activity requires explicit, verbal consent. Never assume.',
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
            content: 'While verbal consent is required, pay attention to body language:\n\nENGAGED & CONSENTING:\nâ¢ Relaxed posture\nâ¢ Making eye contact\nâ¢ Smiling and laughing\nâ¢ Leaning in\nâ¢ Active participation\nâ¢ Reciprocating touch\n\nUNCOMFORTABLE OR UNSURE:\nâ¢ Tense body\nâ¢ Avoiding eye contact\nâ¢ Fake smiling\nâ¢ Pulling away\nâ¢ Passive or frozen\nâ¢ Distracted or distant\n\nIf you notice discomfort, STOP and check in verbally. Don\'t proceed based on assumptions.',
            type: 'normal'
          },
          {
            heading: 'Check-Ins During Play',
            content: 'Consent isn\'t just for the beginningâit\'s ongoing throughout. Check in regularly:\n\nð¬ "Is this still feeling good?"\nð¬ "Are you comfortable with this?"\nð¬ "Should we keep going or pause?"\nð¬ "How are you doing?"\nð¬ "Do you want to continue?"\n\nThese micro-check-ins:\nâ¢ Ensure ongoing consent\nâ¢ Show you care about their experience\nâ¢ Create opportunities to adjust or stop\nâ¢ Build trust\nâ¢ Enhance the experience for everyone\n\nRegular check-ins don\'t ruin the moodâthey enhance it by ensuring everyone is present and engaged.',
            type: 'tip'
          },
          {
            heading: 'Safe Words and Signals',
            content: 'Establish clear communication tools before play:\n\nð¢ GREEN: "I\'m good, keep going"\nð¡ YELLOW: "Slow down, I need a moment"\nð´ RED: "Stop immediately"\n\nOr use a simple safe word that anyone can say to stop everything immediately.\n\nIMPORTANT:\nâ¢ Everyone must know and agree to the safe word/signals\nâ¢ Safe words must be respected IMMEDIATELY\nâ¢ Never shame someone for using a safe word\nâ¢ Check in if someone goes quiet or seems off\n\nSafe words are a critical safety toolâtreat them seriously.',
            type: 'key-point'
          },
          {
            heading: 'Consent and Substances',
            content: 'Alcohol and substances complicate consent significantly:\n\nâ ï¸ GOLDEN RULE:\nIf someone is intoxicated, they cannot give valid consent to new activities or new partners.\n\nâ SAFER APPROACH:\nâ¢ Negotiate while sober\nâ¢ Keep alcohol consumption light\nâ¢ Never initiate new activities when drunk\nâ¢ If someone is clearly intoxicated, decline respectfully\nâ¢ Wait for a sober encounter\n\nMany lifestyle venues have strict rules about intoxication for this exact reason. Your reputation depends on making safe choices.',
            type: 'warning'
          },
          {
            heading: 'What To Do If Consent Is Unclear',
            content: 'When in doubt, STOP and clarify:\n\n"Hey, I want to make sure you\'re comfortable. Are you good with this?"\n\n"You seem hesitant. Do you want to pause and talk?"\n\n"I\'m not sure if you\'re into this. Can we check in?"\n\nIt\'s better to break the momentum than to proceed without clear consent. Always err on the side of caution.\n\nIf someone can\'t give clear, enthusiastic consent, the answer is noâeven if they\'re not explicitly saying no.',
            type: 'normal'
          },
          {
            heading: 'After-Play: The Debrief',
            content: 'After lifestyle interactions, debrief with your partner and, if appropriate, with play partners:\n\nâ What went well?\nâ What could be improved?\nâ Did anyone feel uncomfortable at any point?\nâ Were boundaries respected?\nâ Is everyone feeling good emotionally?\nâ What would you want to do differently next time?\n\nThis debrief:\nâ¢ Processes the experience\nâ¢ Identifies any issues\nâ¢ Strengthens communication\nâ¢ Improves future encounters\nâ¢ Ensures everyone is okay\n\nMake debriefing a standard practice.',
            type: 'normal'
          },
          {
            heading: 'Consent Violations: What They Look Like',
            content: 'ð© Proceeding after someone said no or seems uncertain\nð© Pressuring or guilting someone into activities\nð© Ignoring safe words or signals to stop\nð© Escalating activities without asking\nð© Removing protection without consent\nð© Including others without prior consent\nð© Recording or photographing without explicit permission\nð© Continuing when someone is clearly uncomfortable\nð© Taking advantage of intoxication\nð© Lying or withholding information\n\nAny of these is serious and disqualifying. Report violations to event organizers or community leaders.',
            type: 'warning'
          },
          {
            heading: 'If Your Consent Is Violated',
            content: 'If someone violates your consent:\n\n1. PRIORITIZE YOUR SAFETY\n   Leave the situation immediately if needed\n\n2. TELL YOUR PARTNER\n   Share what happened with your partner or trusted friend\n\n3. DOCUMENT\n   Write down what happened while it\'s fresh\n\n4. REPORT IF APPROPRIATE\n   Tell event organizers, venue owners, or community leaders\n\n5. SEEK SUPPORT\n   Process with your partner, friends, or a therapist\n\n6. CUT CONTACT\n   Block the person who violated your consent\n\nYou are not overreacting. Consent violations are serious and it\'s okay to take action.',
            type: 'normal'
          },
          {
            heading: 'Building a Consent Culture',
            content: 'You contribute to consent culture by:\n\nâ Always asking explicitly for consent\nâ Respecting "no" immediately and gracefully\nâ Checking in during activities\nâ Calling out consent violations when you see them\nâ Supporting people who report violations\nâ Educating others about consent\nâ Making consent sexy and normal\nâ Setting a good example\n\nEvery positive interaction strengthens the community. Every violation weakens it. Choose to be part of the solution.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Consent is mandatoryâno exceptions\nâ Use FRIES model: Freely given, Reversible, Informed, Enthusiastic, Specific\nâ Each activity requires explicit consent\nâ Negotiate before playâdiscuss desires, boundaries, safety\nâ Check in regularly during activities\nâ Use safe words and respect them immediately\nâ Intoxication invalidates consent\nâ When unclear, stop and clarify\nâ Debrief after interactions\nâ Report violations and support survivors\n\nMastering consent makes you a safe, trusted community member.',
            type: 'key-point'
          },
          {
            heading: 'Final Reflection',
            content: 'Before the quiz, consider:\n\nâ¢ Have you ever proceeded without enthusiastic consent?\nâ¢ How will you negotiate before your next interaction?\nâ¢ What will you do if you notice someone seems uncomfortable?\nâ¢ Are you prepared to stop immediately if needed?\n\nConsent is the foundation of everything. Take it seriously.',
            type: 'tip'
          }
        ]
      },
      'mod-4': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Why Difficult Conversations Matter',
            content: 'Not every conversation in the lifestyle is easy. Sometimes you need to address uncomfortable topics, deliver disappointing news, or navigate conflicts. These difficult conversations are where most people struggleâbut they\'re also where strong communication skills have the biggest impact.\n\nAvoiding difficult conversations doesn\'t make problems go away. It makes them worse. Learning to handle these moments with grace, honesty, and respect is one of the most valuable skills you can develop.',
            type: 'normal'
          },
          {
            heading: 'Common Difficult Conversations in the Lifestyle',
            content: 'â¢ Declining an invitation or connection\nâ¢ Addressing boundary violations\nâ¢ Expressing hurt feelings or disappointment\nâ¢ Ending a play partnership\nâ¢ Discussing jealousy or insecurity\nâ¢ Addressing performance issues\nâ¢ Confronting dishonesty or rule-breaking\nâ¢ Discussing changing interests or desires\nâ¢ Managing expectations mismatches\nâ¢ Addressing hygiene or safety concerns\n\nEach of these requires courage, tact, and clear communication.',
            type: 'normal'
          },
          {
            heading: 'The Five Principles of Difficult Conversations',
            content: '1. TIMING: Choose the right moment and setting\n2. HONESTY: Be direct but compassionate\n3. RESPECT: Honor the other person\'s dignity\n4. CLARITY: Be specific about the issue\n5. SOLUTION-FOCUS: When possible, offer constructive paths forward\n\nThese principles ensure difficult conversations are productive rather than destructive.',
            type: 'key-point'
          },
          {
            heading: 'Choosing the Right Time and Place',
            content: 'Never have difficult conversations:\nâ In public or at parties\nâ In the heat of emotion\nâ Late at night when tired\nâ Via text or social media\nâ When rushed or distracted\n\nInstead, choose:\nâ Private, neutral settings\nâ When both parties are calm\nâ When you have adequate time\nâ Face-to-face or video call\nâ When you\'re prepared and composed\n\nTiming and setting significantly impact the outcome.',
            type: 'tip'
          },
          {
            heading: 'The "I" Statement Formula',
            content: 'Use this structure for addressing issues:\n\n"When [specific behavior], I felt [emotion], because [reason]. I need [request]."\n\nExamples:\n\nâ "When you didn\'t check in during play last week, I felt uncomfortable, because we agreed on regular check-ins. I need us to stick to that agreement."\n\nâ "When you shared details about our private life, I felt betrayed, because we agreed on discretion. I need you to respect our privacy boundaries."\n\nThis format is non-accusatory while being clear and specific.',
            type: 'example'
          },
          {
            heading: 'Scenario: Declining an Unwanted Invitation',
            content: 'THE SITUATION:\nA couple keeps inviting you to play, but you\'re not attracted. They\'re persistent.\n\nâ BAD APPROACH:\n"We\'re busy" (vague excuse)\n"Maybe another time" (false hope)\nGhosting them\n\nâ GOOD APPROACH:\n"We appreciate your interest and think you\'re wonderful people. We\'re looking for a different connection type, so we don\'t think we\'re the right match. We wish you the best in finding the right connections!"\n\nThis is clear, kind, and final. No room for misinterpretation.',
            type: 'example'
          },
          {
            heading: 'Addressing Boundary Violations',
            content: 'If someone crosses your boundaries, address it immediately:\n\n1. STATE THE VIOLATION\n"You touched me without asking, which crossed my boundary"\n\n2. EXPLAIN THE IMPACT\n"That made me uncomfortable and broke my trust"\n\n3. SET EXPECTATIONS\n"I need clear consent before any touch moving forward"\n\n4. CONSEQUENCES\n"If this happens again, we won\'t continue playing"\n\nBe firm and direct. Boundary violations are serious.',
            type: 'warning'
          },
          {
            heading: 'Managing Your Emotions',
            content: 'Before difficult conversations, manage your emotional state:\n\nâ¢ Take time to process your feelings first\nâ¢ Write down your thoughts to organize them\nâ¢ Practice what you want to say\nâ¢ Breathe deeply before starting\nâ¢ Remind yourself of your goal\nâ¢ Prepare for various responses\n\nEmotional regulation helps you stay clear and constructive, even when the topic is charged.',
            type: 'normal'
          },
          {
            heading: 'Listening During Difficult Conversations',
            content: 'These conversations aren\'t just about delivering your messageâyou must also listen:\n\nâ¢ Let them respond fully\nâ¢ Don\'t interrupt with rebuttals\nâ¢ Ask clarifying questions\nâ¢ Acknowledge their perspective\nâ¢ Look for common ground\nâ¢ Stay open to their experience\n\nEven when you disagree, make space for their viewpoint.',
            type: 'normal'
          },
          {
            heading: 'De-Escalation Techniques',
            content: 'If the conversation becomes heated:\n\nð¹ Lower your voice instead of raising it\nð¹ Slow down your speech\nð¹ Take breaks if needed\nð¹ Acknowledge their emotions\nð¹ Focus on the issue, not personal attacks\nð¹ Return to facts and specific behaviors\nð¹ Suggest continuing later if too emotional\n\nThe goal is resolution, not winning an argument.',
            type: 'tip'
          },
          {
            heading: 'Ending Play Partnerships Gracefully',
            content: 'Sometimes connections don\'t work out. End them with respect:\n\n"We\'ve enjoyed getting to know you, but we feel like the connection isn\'t quite right for what we\'re looking for. We wanted to be honest rather than ghost or fade away. We appreciate the experiences we\'ve shared and wish you well!"\n\nBe:\nâ¢ Honest but kind\nâ¢ Clear about the ending\nâ¢ Appreciative of positive moments\nâ¢ Firm in your decision\nâ¢ Brief (don\'t over-explain)',
            type: 'example'
          },
          {
            heading: 'When You\'re On the Receiving End',
            content: 'If someone brings a difficult topic to you:\n\nâ Thank them for their honesty\nâ Listen without interrupting\nâ Ask for clarification if needed\nâ Acknowledge their feelings\nâ Take responsibility if appropriate\nâ Work toward resolution\nâ Don\'t get defensive\n\nHow you receive difficult feedback defines your character.',
            type: 'key-point'
          },
          {
            heading: 'Red Flags: Poor Handling of Difficult Conversations',
            content: 'ð© Becoming aggressive or threatening\nð© Making personal attacks\nð© Gaslighting or denying your experience\nð© Refusing to listen or engage\nð© Playing the victim\nð© Bringing up unrelated grievances\nð© Refusing to take any responsibility\nð© Storming off without resolution\n\nThese behaviors indicate someone who can\'t handle adult communication. Consider ending the connection.',
            type: 'warning'
          },
          {
            heading: 'The Follow-Up',
            content: 'After a difficult conversation:\n\nâ¢ Check in with your partner about how it went\nâ¢ Reflect on what you learned\nâ¢ Follow through on any commitments made\nâ¢ Give the other party space to process\nâ¢ Monitor if behavior changes as discussed\nâ¢ Be prepared to have follow-up conversations\n\nDifficult conversations are often just the start of resolving an issue.',
            type: 'normal'
          },
          {
            heading: 'Module Summary',
            content: 'â Don\'t avoid difficult conversationsâthey don\'t go away\nâ Choose appropriate timing and settings\nâ Use "I" statements to express concerns\nâ Be direct but compassionate\nâ Listen as much as you speak\nâ De-escalate when emotions run high\nâ End connections gracefully when needed\nâ Receive feedback with gratitude, not defensiveness\n\nMastering difficult conversations builds respect and trust.',
            type: 'key-point'
          }
        ]
      },
      'mod-5': {
        estimatedTime: '15 minutes',
        sections: [
          {
            heading: 'Active Listening: The Foundation of Connection',
            content: 'Active listening is the most underrated skill in the lifestyle. Most people think they\'re good listeners, but they\'re actually just waiting for their turn to talk. True active listening creates deeper connections, prevents misunderstandings, and shows respect.\n\nThis module teaches you how to become an exceptional listenerâthe kind of person others feel heard and understood by.',
            type: 'normal'
          },
          {
            heading: 'Why Active Listening Matters',
            content: 'In the lifestyle, active listening:\n\nâ¢ Builds trust and intimacy\nâ¢ Uncovers desires and boundaries\nâ¢ Prevents miscommunication\nâ¢ Makes others feel valued\nâ¢ Enhances every interaction\nâ¢ Deepens connections\nâ¢ Improves consent and safety\n\nPeople remember how you make them feel. Great listeners create unforgettable experiences.',
            type: 'normal'
          },
          {
            heading: 'The Components of Active Listening',
            content: '1. FULL ATTENTION: Eliminate distractions, be present\n2. EYE CONTACT: Show engagement with your gaze\n3. BODY LANGUAGE: Face them, lean in, nod\n4. NO INTERRUPTING: Let them finish completely\n5. PARAPHRASING: Reflect back what you heard\n6. ASKING QUESTIONS: Dig deeper with curiosity\n7. ACKNOWLEDGING EMOTIONS: Recognize how they feel\n8. WITHHOLDING JUDGMENT: Stay open and accepting',
            type: 'key-point'
          },
          {
            heading: 'The Phone Rule',
            content: 'THE RULE:\nWhen someone is sharing something important, your phone should be:\n\nð± Face down\nð± On silent\nð± Not in your hand\nð± Not checked "just quickly"\nð± Completely ignored\n\nNothing says "you don\'t matter" like checking your phone mid-conversation. Your undivided attention is a gift.',
            type: 'tip'
          },
          {
            heading: 'The Power of Paraphrasing',
            content: 'Paraphrasing confirms understanding:\n\n"So what I\'m hearing is..."\n"Let me make sure I understand..."\n"It sounds like you\'re saying..."\n\nExample:\nThem: "I\'m nervous about full swap because my last experience was uncomfortable."\n\nYou: "So you\'re open to the idea but you want to make sure we\'re attentive to your comfort level since you had a bad experience before?"\n\nThis shows you truly listened and gives them a chance to clarify.',
            type: 'example'
          },
          {
            heading: 'Asking Powerful Questions',
            content: 'Move beyond surface level with deeper questions:\n\nâ SURFACE: "So what are you into?"\nâ DEEPER: "What draws you to the lifestyle?"\n\nâ SURFACE: "Have you done this before?"\nâ DEEPER: "What experiences have shaped your interests?"\n\nâ SURFACE: "Are you having fun?"\nâ DEEPER: "What\'s been the highlight of your experience so far?"\n\nDeeper questions show genuine interest and create meaningful conversations.',
            type: 'example'
          },
          {
            heading: 'Reading Between the Lines',
            content: 'Listen not just to words, but to:\n\nâ¢ Tone of voice\nâ¢ Pauses and hesitations\nâ¢ What\'s NOT being said\nâ¢ Energy shifts\nâ¢ Body language changes\nâ¢ Emotional undertones\n\nExample:\nIf someone says "I\'m fine with that" but their voice is flat and they\'re not making eye contact, they\'re probably NOT fine. Check in deeper.',
            type: 'normal'
          },
          {
            heading: 'Common Listening Mistakes',
            content: 'â INTERRUPTING: Cutting them off to share your story\nâ FIXING: Immediately offering solutions\nâ MINIMIZING: "That\'s not a big deal"\nâ ONE-UPPING: "You think that\'s bad? Listen to this..."\nâ DISTRACTED: Looking around, multitasking\nâ JUDGING: Visibly disapproving\nâ INTERROGATING: Rapid-fire questions\nâ PROJECTING: Assuming they feel like you would\n\nCatch yourself doing these and stop.',
            type: 'warning'
          },
          {
            heading: 'The 80/20 Rule',
            content: 'In initial conversations, aim to listen 80% of the time and talk 20%. This:\n\nâ¢ Helps you understand the other person\nâ¢ Shows you\'re interested in them\nâ¢ Builds rapport and trust\nâ¢ Uncovers compatibility\nâ¢ Makes them feel heard\n\nThe person who asks great questions and listens deeply is always more memorable than the person who dominates the conversation.',
            type: 'tip'
          },
          {
            heading: 'Reflective Listening for Emotions',
            content: 'When someone shares feelings, reflect them back:\n\nThem: "I felt embarrassed when that happened"\nYou: "That must have been really uncomfortable for you"\n\nThem: "I\'m excited but also nervous"\nYou: "So you\'re feeling a mix of anticipation and some anxiety?"\n\nThis validates their emotions and shows you\'re not just hearing wordsâyou\'re understanding feelings.',
            type: 'example'
          },
          {
            heading: 'Module Summary',
            content: 'â Active listening creates connection and trust\nâ Give full attentionâput away distractions\nâ Use body language to show engagement\nâ Paraphrase to confirm understanding\nâ Ask deeper questions with genuine curiosity\nâ Listen to emotions, not just words\nâ Avoid common mistakes like interrupting or fixing\nâ Follow the 80/20 ruleâlisten more than you talk\n\nBecoming a great listener transforms your lifestyle experience.',
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
            content: 'The three-layer communication model:\n\nð¯ LAYER 1: CONTENT (What you say)\nThe actual words and information you communicate\n\nð¯ LAYER 2: EMOTION (How you say it)\nYour tone, energy, and emotional expression\n\nð¯ LAYER 3: INTENTION (Why you say it)\nYour underlying motive and desired outcome\n\nMastery means aligning all three layers. When they conflict, people sense inauthenticity.',
            type: 'key-point'
          },
          {
            heading: 'Reading Social Dynamics',
            content: 'At lifestyle events, reading the room is crucial:\n\nâ¢ Who\'s open to conversation vs. focused on their partner?\nâ¢ What\'s the energy levelâplayful, serious, intimate?\nâ¢ Who seems interested in you vs. being polite?\nâ¢ What are the unspoken rules of this particular space?\nâ¢ When is it appropriate to approach vs. wait to be approached?\n\nDevelop this social intelligence through observation and practice.',
            type: 'normal'
          },
          {
            heading: 'The Art of the Approach',
            content: 'Approaching others at lifestyle events:\n\n1. OBSERVE FIRST: Are they open to conversation?\n2. MAKE EYE CONTACT: Gauge interest through non-verbal signals\n3. APPROACH RESPECTFULLY: "Hi, is it okay if we join you?"\n4. READ RECEPTIVENESS: Warm welcome vs. polite but distant?\n5. ENGAGE GENUINELY: Ask questions, listen actively\n6. RESPECT CUES: Exit gracefully if interest isn\'t mutual\n\nThe approach sets the tone for everything that follows.',
            type: 'example'
          },
          {
            heading: 'Handling Rejection Gracefully',
            content: 'Not every approach will lead to connection. Handle rejection with class:\n\nâ "Thanks for your time, enjoy your evening!"\nâ "We appreciate you being directâhave a great night!"\nâ "No worries at all, best of luck tonight!"\n\nDON\'T:\nâ Ask "why not?" or argue\nâ Get visibly upset or hurt\nâ Make negative comments\nâ Bad-mouth them to others\nâ Keep trying after they\'ve declined\n\nHow you handle rejection demonstrates maturity and respect.',
            type: 'tip'
          },
          {
            heading: 'Creating Comfort Through Communication',
            content: 'Make others feel safe and comfortable through:\n\nâ¢ Clear communication about expectations\nâ¢ Respecting boundaries without question\nâ¢ Regular check-ins during interactions\nâ¢ Reading and responding to non-verbal cues\nâ¢ Matching their energy and pace\nâ¢ Giving them control and choices\nâ¢ Being consistent and reliable\n\nPeople who feel safe with you will be more open and authentic.',
            type: 'normal'
          },
          {
            heading: 'The Check-In Conversation Structure',
            content: 'For ongoing play relationships, regular check-ins are vital:\n\n1. RECENT POSITIVE: "What went well in our last encounter?"\n2. AREAS FOR IMPROVEMENT: "Is there anything we could do differently?"\n3. BOUNDARY UPDATES: "Have any boundaries changed?"\n4. DESIRES EXPLORATION: "Are there new interests you want to explore?"\n5. RELATIONSHIP HEALTH: "How are you feeling about our connection?"\n6. SCHEDULING: "What works for getting together next?"\n\nThis structure keeps communication flowing and prevents issues from building up.',
            type: 'key-point'
          },
          {
            heading: 'Managing Group Communication',
            content: 'When communicating with multiple people (group play, poly dynamics):\n\nâ¢ Address everyone, not just one person\nâ¢ Make sure all voices are heard\nâ¢ Check that everyone consents to decisions\nâ¢ Avoid side conversations that exclude others\nâ¢ Be aware of power dynamics\nâ¢ Ensure everyone feels included\nâ¢ Have separate one-on-one check-ins too\n\nGroup communication requires extra attention to fairness and inclusion.',
            type: 'normal'
          },
          {
            heading: 'Digital Communication Mastery',
            content: 'Advanced digital communication tips:\n\nð± Response Time: Reply within 24 hours, or say you need more time\nð± Message Quality: Put thought into your messages\nð± Flirting vs. Planning: Know when to be playful vs. logistical\nð± Photo Sharing: Get explicit consent before sending intimate images\nð± Video Chats: Meet face-to-face before in-person meetings\nð± Privacy: Use apps with good security features\nð± Closing Loops: Always conclude conversations clearly\n\nYour digital communication reflects your overall communication quality.',
            type: 'tip'
          },
          {
            heading: 'The Art of Flirtation',
            content: 'Effective flirting in the lifestyle:\n\nâ¢ Be playful without being pushy\nâ¢ Compliment specifically and authentically\nâ¢ Create intrigue through conversation\nâ¢ Match their energy and reciprocation\nâ¢ Read signalsâare they flirting back?\nâ¢ Know when flirting crosses into negotiation\nâ¢ Always leave them wanting more\n\nExample:\n"I love how you described thatâyou clearly have a thoughtful approach to the lifestyle" (specific compliment)\n\nvs.\n\n"You\'re hot" (generic, low-effort)',
            type: 'example'
          },
          {
            heading: 'Building Long-Term Connections',
            content: 'For ongoing play partnerships:\n\nâ¢ Consistent communication between meetings\nâ¢ Remembering details they\'ve shared\nâ¢ Celebrating milestones and special occasions\nâ¢ Being reliable with plans and commitments\nâ¢ Evolving together as interests change\nâ¢ Maintaining appropriate boundaries\nâ¢ Keeping things fresh and exciting\n\nLong-term lifestyle friendships are built on consistent, quality communication.',
            type: 'normal'
          },
          {
            heading: 'Cross-Cultural Communication',
            content: 'The lifestyle community is diverse. Navigate cultural differences:\n\nâ¢ Don\'t assume everyone shares your communication style\nâ¢ Ask about preferences and norms\nâ¢ Be patient with language barriers\nâ¢ Avoid culture-specific slang or references\nâ¢ Show extra care in seeking consent and checking understanding\nâ¢ Appreciate different approaches to intimacy and relationships\nâ¢ Learn from diverse perspectives\n\nCultural sensitivity enhances your ability to connect with a wider range of people.',
            type: 'normal'
          },
          {
            heading: 'Conflict Resolution Mastery',
            content: 'When conflicts arise:\n\n1. PAUSE: Don\'t react immediately in anger\n2. IDENTIFY THE CORE ISSUE: What\'s really bothering you?\n3. CHOOSE THE RIGHT TIME: When both parties are calm\n4. USE "I" STATEMENTS: Focus on your experience\n5. LISTEN TO UNDERSTAND: Not to counter-argue\n6. FIND COMMON GROUND: What do you both want?\n7. COLLABORATE ON SOLUTIONS: Work together\n8. FOLLOW UP: Check that the resolution is working\n\nEvery conflict successfully resolved strengthens the relationship.',
            type: 'key-point'
          },
          {
            heading: 'Your Communication Reputation',
            content: 'In the lifestyle, your reputation is everything. Build it through:\n\nâ Consistent, honest communication\nâ Respecting boundaries and consent\nâ Following through on commitments\nâ Handling difficult situations with grace\nâ Being discreet and trustworthy\nâ Treating everyone with respect\nâ Contributing positively to the community\n\nYour reputation will precede youâmake it a good one.',
            type: 'normal'
          },
          {
            heading: 'The Path Forward',
            content: 'You\'ve completed the Communication Fundamentals path! You\'ve learned:\n\nâ Clear, honest communication basics\nâ How to establish and maintain boundaries\nâ Consent and negotiation mastery\nâ Handling difficult conversations\nâ Active listening skills\nâ Advanced communication techniques\n\nBut learning doesn\'t end here. Every interaction is an opportunity to practice and refine these skills. Be patient with yourself as you apply what you\'ve learned.',
            type: 'key-point'
          },
          {
            heading: 'Final Module Summary',
            content: 'â Align content, emotion, and intention in your communication\nâ Read social dynamics at events\nâ Approach respectfully and handle rejection gracefully\nâ Create comfort through clear, consistent communication\nâ Master both digital and in-person interaction\nâ Build long-term connections through reliability\nâ Navigate cultural differences with sensitivity\nâ Resolve conflicts constructively\nâ Build a reputation as a trusted communicator\n\nCongratulations on completing the Communication Fundamentals path! You\'re now equipped with the skills to navigate the lifestyle confidently and respectfully.',
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
            content: 'The lifestyle community requires a unique level of discretion. Many participants:\n\nâ¢ Have professional careers that require privacy\nâ¢ Have family situations that necessitate discretion\nâ¢ Live in communities where lifestyle participation could cause issues\nâ¢ Value their privacy as a fundamental right\nâ¢ Want to control who knows about their lifestyle involvement\n\nPoor digital privacy can lead to unwanted exposure, professional consequences, relationship complications, or safety concerns.',
            type: 'normal'
          },
          {
            heading: 'The Five Pillars of Digital Privacy',
            content: '1. SEPARATION: Keep lifestyle and vanilla identities separate\n2. ANONYMITY: Use privacy-focused practices in all lifestyle platforms\n3. SECURITY: Protect accounts with strong passwords and 2FA\n4. DISCRETION: Be mindful of what you share and where\n5. CONTROL: Manage your digital footprint actively\n\nThese five pillars work together to create a comprehensive privacy strategy.',
            type: 'key-point'
          },
          {
            heading: 'Creating Your Lifestyle Identity',
            content: 'Establish a separate identity for lifestyle activities:\n\nð§ EMAIL: Create a dedicated email address for lifestyle sites\nâ¢ Use a privacy-focused provider (ProtonMail, Tutanota)\nâ¢ Never use your work or primary personal email\nâ¢ Choose a username unrelated to your real identity\n\nð± PHONE NUMBER: Consider a separate number\nâ¢ Use Google Voice, Burner app, or similar services\nâ¢ Gives you control over who has your real number\nâ¢ Can be easily changed if needed\n\nð¤ USERNAME: Choose carefully\nâ¢ No connection to your real name\nâ¢ Don\'t reuse usernames from other platforms\nâ¢ Avoid identifying details (city, profession, birth year)',
            type: 'example'
          },
          {
            heading: 'Profile Photo Privacy',
            content: 'Your photos can reveal more than you think:\n\nð« AVOID:\nâ¢ Photos used on other social media accounts\nâ¢ Images with identifiable backgrounds (your home, workplace)\nâ¢ Photos with visible tattoos, unique jewelry, or distinguishing features\nâ¢ Images that show your car license plate or house number\nâ¢ Pictures with other people without their consent\n\nâ SAFE PRACTICES:\nâ¢ Use photos taken specifically for lifestyle profiles\nâ¢ Crop out identifying backgrounds\nâ¢ Consider blurring faces until you\'re comfortable\nâ¢ Use lifestyle-specific photos that don\'t appear elsewhere\nâ¢ Be mindful of EXIF data (location info embedded in photos)\n\nMany apps strip EXIF data automatically, but verify this.',
            type: 'warning'
          },
          {
            heading: 'Location Privacy',
            content: 'Never share your exact location publicly:\n\nâ¢ List your city or region, not specific neighborhoods\nâ¢ Meet in public places for first meetings, never at home\nâ¢ Be vague about where you work\nâ¢ Don\'t post geo-tagged photos from home\nâ¢ Turn off location services for lifestyle apps\nâ¢ Use general descriptors ("north side of the city")\n\nThe lifestyle community is often smaller than you thinkâspecific location details make it easy to identify you.',
            type: 'normal'
          },
          {
            heading: 'Password Security Essentials',
            content: 'Protect your accounts with strong security:\n\nð PASSWORD RULES:\nâ¢ Use unique passwords for each lifestyle site\nâ¢ Minimum 12 characters, mix of letters, numbers, symbols\nâ¢ Never use personal information (names, birthdays)\nâ¢ Use a password manager (1Password, Bitwarden, LastPass)\nâ¢ Change passwords if you suspect any compromise\n\nð TWO-FACTOR AUTHENTICATION (2FA):\nâ¢ Enable 2FA on all lifestyle accounts that offer it\nâ¢ Use authenticator apps (Google Authenticator, Authy)\nâ¢ Avoid SMS-based 2FA if possible (less secure)\n\nYour accounts contain private conversations, photos, and connectionsâprotect them.',
            type: 'key-point'
          },
          {
            heading: 'Social Media Separation',
            content: 'Keep your vanilla and lifestyle worlds separate:\n\nâ DON\'T:\nâ¢ Connect your lifestyle profiles to Facebook/Instagram\nâ¢ Use "Login with Facebook/Google" on lifestyle sites\nâ¢ Friend lifestyle connections on personal social media\nâ¢ Post lifestyle content on vanilla accounts\nâ¢ Use the same profile pictures across platforms\n\nâ DO:\nâ¢ Keep accounts completely separate\nâ¢ Use different email addresses\nâ¢ Maintain distinct online personas\nâ¢ Be cautious about what you "like" or comment on\nâ¢ Consider separate devices if you\'re very privacy-conscious',
            type: 'warning'
          },
          {
            heading: 'Reverse Image Search Awareness',
            content: 'Anyone can reverse search your photos to find other accounts:\n\nð HOW IT WORKS:\nSomeone can take your lifestyle photo and search Google Images, TinEye, or other services to see if it appears elsewhere online.\n\nð¡ï¸ PROTECTION:\nâ¢ Never use the same photos across lifestyle and vanilla platforms\nâ¢ Take separate photos specifically for lifestyle use\nâ¢ Regularly check your photos using reverse image search yourself\nâ¢ If you find your photos appearing where they shouldn\'t, take action\n\nThis is one of the most common ways people\'s lifestyle involvement is discovered.',
            type: 'tip'
          },
          {
            heading: 'Digital Communication Security',
            content: 'When chatting with lifestyle connections:\n\nð¬ SECURE MESSAGING:\nâ¢ Use apps with end-to-end encryption (Signal, Telegram)\nâ¢ Be cautious with photos and videos sent via message\nâ¢ Assume anything you send could be screenshot\nâ¢ Use disappearing messages when available\nâ¢ Don\'t share intimate content until you trust someone\n\nð§ EMAIL SAFETY:\nâ¢ Use your dedicated lifestyle email only\nâ¢ Be cautious about clicking links in emails\nâ¢ Watch for phishing attempts\nâ¢ Never send sensitive info via unencrypted email',
            type: 'normal'
          },
          {
            heading: 'The Screenshot Reality',
            content: 'CRITICAL TRUTH: Anything you send digitally can be captured and shared.\n\nâ¢ Messages can be screenshot\nâ¢ Photos can be saved\nâ¢ Videos can be recorded\nâ¢ Voice messages can be recorded\n\nBefore sending anything ask yourself: "Would I be okay if this was shared beyond this person?" If the answer is no, don\'t send it.\n\nThis doesn\'t mean don\'t trust anyoneâit means be thoughtful about what you share and with whom.',
            type: 'warning'
          },
          {
            heading: 'Managing Your Digital Footprint',
            content: 'Actively manage what\'s out there about you:\n\nð REGULAR AUDITS:\nâ¢ Google your lifestyle username periodically\nâ¢ Search your photos using reverse image search\nâ¢ Check if your information appears on lifestyle forums\nâ¢ Monitor where your profile might be linked\n\nð§¹ CLEANUP:\nâ¢ Delete old profiles you no longer use\nâ¢ Remove photos from sites you\'ve left\nâ¢ Request removal from forums if your info appears without consent\nâ¢ Update privacy settings regularly\n\nYour digital footprint grows over timeâregular maintenance is essential.',
            type: 'tip'
          },
          {
            heading: 'Device Security',
            content: 'Your devices contain your lifestyle activity:\n\nð± PHONE SECURITY:\nâ¢ Use strong passcode/biometric lock\nâ¢ Enable "require password immediately" after lock\nâ¢ Use private browsing for lifestyle sites\nâ¢ Clear browser history regularly\nâ¢ Use separate apps for lifestyle email/messaging\nâ¢ Consider app-locking sensitive apps (AppLock, Norton App Lock)\n\nð» COMPUTER SECURITY:\nâ¢ Use private/incognito browsing mode\nâ¢ Clear cookies and cache regularly\nâ¢ Don\'t save passwords in shared browsers\nâ¢ Log out of lifestyle sites when done\nâ¢ Use encrypted folders for sensitive files\n\nIf you share devices, be extra cautious.',
            type: 'example'
          },
          {
            heading: 'Public Wi-Fi Risks',
            content: 'Public Wi-Fi is convenient but risky:\n\nâ ï¸ DANGERS:\nâ¢ Unencrypted networks allow others to see your activity\nâ¢ "Man-in-the-middle" attacks can intercept data\nâ¢ Fake Wi-Fi networks can steal information\n\nð¡ï¸ PROTECTION:\nâ¢ Avoid accessing lifestyle sites on public Wi-Fi\nâ¢ Use a VPN (Virtual Private Network) if you must\nâ¢ Stick to cellular data for sensitive activities\nâ¢ Never enter passwords on public networks\n\nWait until you\'re on a secure network for lifestyle activities.',
            type: 'warning'
          },
          {
            heading: 'VPN Basics for Lifestyle Privacy',
            content: 'A VPN (Virtual Private Network) adds an extra layer of privacy:\n\nâ BENEFITS:\nâ¢ Hides your IP address and location\nâ¢ Encrypts your internet traffic\nâ¢ Prevents ISP from seeing your browsing\nâ¢ Useful when traveling or on public networks\n\nð CHOOSING A VPN:\nâ¢ Use reputable paid services (ExpressVPN, NordVPN, ProtonVPN)\nâ¢ Avoid free VPNs (often sell your data)\nâ¢ Check for no-logs policy\nâ¢ Ensure it works on all your devices\n\nVPNs aren\'t perfect, but they significantly increase privacy.',
            type: 'tip'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Separate your lifestyle and vanilla digital identities completely\nâ Use dedicated email and phone number for lifestyle activities\nâ Never reuse photos across lifestyle and vanilla platforms\nâ Protect accounts with strong passwords and 2FA\nâ Be mindful of location information in profiles and photos\nâ Assume anything you send digitally can be captured\nâ Regularly audit your digital footprint\nâ Secure your devices with locks and private browsing\nâ Avoid public Wi-Fi for lifestyle activities\nâ Consider using a VPN for additional privacy\n\nDigital privacy requires ongoing attention, but these practices will protect your identity and give you confidence to enjoy the lifestyle safely.',
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
            content: 'ð¹ PHASE 1: Digital Vetting (Before Meeting)\nThorough conversation and verification online\n\nð¹ PHASE 2: Public First Meeting (The Meet & Greet)\nMeeting in a safe public location\n\nð¹ PHASE 3: Private Encounters (Only After Trust)\nProgressing to private settings once safety is established\n\nNever skip phasesâeach builds trust and assesses safety.',
            type: 'key-point'
          },
          {
            heading: 'Phase 1: Digital Vetting',
            content: 'Before agreeing to meet, thoroughly vet potential connections:\n\nâ ADEQUATE CONVERSATION:\nâ¢ Exchange messages over several days/weeks\nâ¢ Have multiple conversations on different topics\nâ¢ Ask questions about their lifestyle experience\nâ¢ Discuss expectations, boundaries, and interests\nâ¢ Video chat before meeting in person\n\nâ VERIFICATION:\nâ¢ Request a live video chat (not just photos)\nâ¢ Ask for a "verification photo" with specific pose/sign\nâ¢ Check if their profile seems authentic vs. catfish\nâ¢ Trust your instinctsâif something feels off, it probably is\n\nð© RED FLAGS DURING VETTING:\nâ¢ Rushing to meet in person\nâ¢ Refusing video verification\nâ¢ Inconsistent stories or information\nâ¢ Pressuring for explicit content\nâ¢ Unwilling to discuss boundaries or safety',
            type: 'example'
          },
          {
            heading: 'Setting Up the First Meeting',
            content: 'When planning your first in-person meeting:\n\nð LOCATION CHOICE:\nâ¢ Always meet in PUBLIC first\nâ¢ Choose busy, well-lit venues (restaurant, coffee shop, bar)\nâ¢ Pick neutral territory (not near anyone\'s home/work)\nâ¢ Familiar location where you know the area\nâ¢ Place with easy exits and parking\n\nâ° TIMING:\nâ¢ Daytime or early evening preferred for first meetings\nâ¢ Avoid late night meetings initially\nâ¢ Choose a time when the venue will be reasonably busy\n\nð TRANSPORTATION:\nâ¢ Drive yourself or use your own transportation\nâ¢ Never get in someone\'s car on first meeting\nâ¢ Park in well-lit, visible areas\nâ¢ Have a clear exit strategy',
            type: 'key-point'
          },
          {
            heading: 'The Safety Plan: Essential Steps',
            content: 'EVERY first meeting should include a safety plan:\n\n1ï¸â£ TELL SOMEONE:\nâ¢ Share who you\'re meeting (name, photos, profile)\nâ¢ Provide the location and time\nâ¢ Share license plate number if you have it\nâ¢ Give expected return time\n\n2ï¸â£ SCHEDULED CHECK-INS:\nâ¢ Arrange to text a friend at specific times\nâ¢ Use code words for "I\'m fine" vs "I need help"\nâ¢ Set up "if you don\'t hear from me by X time" protocol\n\n3ï¸â£ KEEP YOUR PHONE:\nâ¢ Fully charged before the meeting\nâ¢ Keep it on you at all times\nâ¢ Have emergency contacts easily accessible\nâ¢ Location sharing turned on with trusted friend\n\n4ï¸â£ PLAN YOUR EXIT:\nâ¢ Have a pre-planned excuse to leave if needed\nâ¢ Keep your car keys accessible\nâ¢ Know where exits are located\nâ¢ Have backup transportation option',
            type: 'warning'
          },
          {
            heading: 'The Meet & Greet: Best Practices',
            content: 'During your first face-to-face meeting:\n\nâ ARRIVAL:\nâ¢ Arrive separately (don\'t be picked up)\nâ¢ Get there a few minutes early to scope the venue\nâ¢ Let your safety contact know you\'ve arrived\nâ¢ Sit in a visible, central area\n\nâ DURING:\nâ¢ Stay in the public spaceâdon\'t go to cars, homes, or private areas\nâ¢ Keep your drink in sight at all times\nâ¢ Watch your alcohol consumption\nâ¢ Pay attention to your instincts\nâ¢ Watch for red flag behaviors\n\nâ DEPARTURE:\nâ¢ Leave separately\nâ¢ Don\'t share which car is yours initially\nâ¢ Let your safety contact know you\'re leaving\nâ¢ Don\'t invite them to follow you home',
            type: 'normal'
          },
          {
            heading: 'Substance Safety',
            content: 'Alcohol and substances require extra caution:\n\nð· ALCOHOL AWARENESS:\nâ¢ Set a limit before you arrive and stick to it\nâ¢ Never leave your drink unattended\nâ¢ Order drinks yourself directly from staff\nâ¢ Decline drinks that you didn\'t see poured\nâ¢ Watch for signs your drink may be tampered with (unexpected effects)\n\nð« DRUGS:\nâ¢ Never accept recreational drugs from people you just met\nâ¢ Be aware that impairment affects judgment and safety\nâ¢ If you choose to use substances, ensure you\'re with trusted people\nâ¢ Have a sober safety person with you\n\nImpairment makes you vulnerableâstay in control, especially on first meetings.',
            type: 'warning'
          },
          {
            heading: 'Reading the Room: Safety Intuition',
            content: 'Trust your instinctsâyour gut feeling exists for a reason:\n\nð© CONCERNING BEHAVIORS:\nâ¢ They seem very different from their online persona\nâ¢ Inappropriate touching or boundary testing\nâ¢ Pressuring you to drink more or go somewhere private\nâ¢ Getting aggressive or overly sexual in public\nâ¢ Disrespecting your boundaries or requests\nâ¢ Making you feel uncomfortable or unsafe\nâ¢ Talking badly about previous partners\nâ¢ Showing signs of jealousy or possessiveness\n\nIf something feels off, trust that feeling and end the meeting. You don\'t owe anyone an explanation.',
            type: 'warning'
          },
          {
            heading: 'Ending a Meeting Safely',
            content: 'How to conclude a first meeting:\n\nð IF IT WENT WELL:\nâ¢ Thank them for the meeting\nâ¢ Discuss next steps if interested\nâ¢ Exchange additional contact info if comfortable\nâ¢ Plan future meetings appropriately\nâ¢ Still leave separately\n\nð IF YOU\'RE NOT INTERESTED:\nâ¢ Be polite but clear\nâ¢ "Thank you for meeting me, but I don\'t think we\'re the right match"\nâ¢ Don\'t make false promises or leave hope\nâ¢ It\'s okay to be directâhonesty is respectful\n\nð¨ IF YOU FEEL UNSAFE:\nâ¢ Make an excuse and leave immediately\nâ¢ "I\'m not feeling well, I need to go"\nâ¢ Go to staff if you need help\nâ¢ Call your safety contact\nâ¢ Don\'t worry about being rudeâprioritize your safety',
            type: 'example'
          },
          {
            heading: 'After the First Meeting',
            content: 'Once you\'re home safely:\n\nâ CHECK IN:\nâ¢ Text your safety contact that you\'re home\nâ¢ Debrief with your partner about the meeting\nâ¢ Process your impressions and feelings\n\nâ FOLLOW UP:\nâ¢ Send a polite message thanking them\nâ¢ Be honest about your interest level\nâ¢ If you\'re interested, plan next steps\nâ¢ If not interested, communicate clearly\n\nâ DOCUMENT:\nâ¢ Keep records of conversations\nâ¢ Note any red flags or concerns\nâ¢ Save their contact info and profile details\nâ¢ Trust your gut on whether to proceed',
            type: 'normal'
          },
          {
            heading: 'Progressing to Private Meetings',
            content: 'Only progress to private settings after establishing trust:\n\nâ³ TIMELINE:\nâ¢ Meet multiple times in public first\nâ¢ Video chat between public meetings\nâ¢ Verify they are who they claim to be\nâ¢ Ensure no red flags have appeared\nâ¢ Feel genuinely comfortable and safe\n\nð  PRIVATE MEETING SAFETY:\nâ¢ Still tell someone where you\'ll be\nâ¢ Share the address with your safety contact\nâ¢ Maintain check-in schedule\nâ¢ Have transportation arranged\nâ¢ Meet at a hotel for first private meeting (neutral ground)\nâ¢ Don\'t host at your home initially\nâ¢ Keep your safety plan active',
            type: 'key-point'
          },
          {
            heading: 'Hotel Safety for Lifestyle Meets',
            content: 'If meeting at a hotel:\n\nâ BOOKING:\nâ¢ Book the room yourself when possible\nâ¢ Use a hotel in a safe area\nâ¢ Choose reputable hotel chains\nâ¢ Don\'t share the room number until you\'re there\n\nâ ARRIVAL:\nâ¢ Check in yourself\nâ¢ Have your safety contact know the hotel and room number\nâ¢ Do a quick check of the room when you arrive\nâ¢ Keep phone charged and accessible\nâ¢ Know where exits are located\n\nâ SAFETY MEASURES:\nâ¢ Keep the door unlocked if it makes you feel safer (know exit path)\nâ¢ Maintain your check-in schedule\nâ¢ Don\'t be afraid to end things if uncomfortable\nâ¢ Have your own transportation',
            type: 'example'
          },
          {
            heading: 'Couple Safety Dynamics',
            content: 'For couples in the lifestyle:\n\nð« TOGETHER IS SAFER:\nâ¢ Meet as a couple when possible\nâ¢ Look out for each other\nâ¢ Have private check-in signals between you\nâ¢ Discuss boundaries before meeting\nâ¢ Debrief together afterward\n\nð¨ SEPARATION CONCERNS:\nâ¢ If playing separately, use all the same safety measures\nâ¢ More frequent check-ins with partner\nâ¢ Clear boundaries about timing and contact\nâ¢ Immediate communication if anything feels wrong\n\nYour partner is your built-in safety personâutilize that.',
            type: 'normal'
          },
          {
            heading: 'When Things Go Wrong',
            content: 'If you experience a safety issue:\n\nð¨ IMMEDIATE DANGER:\nâ¢ Leave immediately\nâ¢ Go to a safe public place\nâ¢ Call 911 if threatened or assaulted\nâ¢ Contact your safety person\nâ¢ Don\'t worry about being polite\n\nð¢ AFTER THE FACT:\nâ¢ Report to lifestyle event organizers/site admins\nâ¢ Document everything that happened\nâ¢ Block the person on all platforms\nâ¢ Warn trusted community members if appropriate\nâ¢ Consider reporting to authorities if laws were broken\nâ¢ Seek support from community or professionals\n\nYour experience matters, and reporting helps protect others.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Never skip the digital vetting phaseâverify before meeting\nâ First meetings always in public, busy locations\nâ Create and follow a safety plan for every meeting\nâ Tell someone where you\'re going and check in regularly\nâ Control your alcohol/substance intake\nâ Trust your instinctsâleave if something feels off\nâ Take your own transportation\nâ Progress slowly to private meetings only after trust is built\nâ Use hotels for first private encounters\nâ Report safety concerns to protect yourself and others\n\nSafe meeting practices protect you while allowing you to explore connections with confidence.',
            type: 'key-point'
          }
        ]
      },
      'mod-9': {
        estimatedTime: '20 minutes',
        sections: [
          {
            heading: 'Recognizing Red Flags: Your Early Warning System',
            content: 'Red flags are warning signs that someone may be unsafe, dishonest, or problematic. Learning to recognize these signs early can prevent uncomfortable situations, bad experiences, or even dangerous encounters.\n\nThis module teaches you to identify red flags at every stage of interactionâfrom online profiles through in-person meetingsâso you can make informed decisions about who to trust.',
            type: 'normal'
          },
          {
            heading: 'Why Red Flag Recognition Matters',
            content: 'The lifestyle community is generally wonderful, but like any community, it has people who:\n\nâ¢ Don\'t respect boundaries\nâ¢ Are dishonest about their situation\nâ¢ Have harmful intentions\nâ¢ Lack emotional maturity\nâ¢ Are unreliable or inconsistent\n\nRecognizing red flags early allows you to:\nâ Avoid unsafe situations\nâ Save time and emotional energy\nâ Protect yourself and your partner\nâ Focus on positive connections\nâ Build a better lifestyle experience',
            type: 'normal'
          },
          {
            heading: 'Profile Red Flags',
            content: 'Warning signs in online profiles:\n\nð© VAGUE OR INCOMPLETE PROFILES:\nâ¢ No face photo or all blurry photos\nâ¢ Very little written information\nâ¢ Contradictory information\nâ¢ No mention of boundaries or expectations\n\nð© SEXUAL AGGRESSION:\nâ¢ Overtly sexual profile without substance\nâ¢ Crude or disrespectful language\nâ¢ Focus solely on physical acts\nâ¢ No mention of connection or compatibility\n\nð© UNREALISTIC PHOTOS:\nâ¢ All photos look professional/model quality\nâ¢ Photos appear stolen from internet\nâ¢ Inconsistent appearance across photos\nâ¢ Only group photos (unclear who they are)',
            type: 'warning'
          },
          {
            heading: 'Initial Communication Red Flags',
            content: 'ð© RUSHING THE PROCESS:\n"Let\'s meet tonight"\n"Send me nude photos right away"\n"I don\'t do video calls, let\'s just meet"\n\nð© BOUNDARY TESTING:\nâ¢ Asking personal questions too soon\nâ¢ Requesting explicit content immediately\nâ¢ Pushing against stated boundaries\nâ¢ Getting upset when you maintain boundaries\n\nð© COMMUNICATION PATTERNS:\nâ¢ Only available at odd hours (may be hiding from partner)\nâ¢ Sporadic responses with no explanation\nâ¢ Avoiding direct answers to questions\nâ¢ Becoming defensive when asked reasonable questions\nâ¢ Love bombing (excessive flattery immediately)\n\nð© REFUSING VERIFICATION:\nâ¢ Won\'t video chat\nâ¢ Won\'t send verification photo\nâ¢ Makes excuses about why they can\'t verify\nâ¢ Gets angry when asked to verify',
            type: 'warning'
          },
          {
            heading: 'Relationship Status Red Flags',
            content: 'ð© DISHONESTY ABOUT RELATIONSHIP STATUS:\n"My partner doesn\'t need to know"\n"We have a don\'t ask, don\'t tell arrangement"\n"I\'m working on getting permission"\n"My partner is okay with it, I just can\'t prove it"\n\nð© CHEATING INDICATORS:\nâ¢ Only available at specific times\nâ¢ Reluctant to introduce you to their partner\nâ¢ Partner never appears in photos or conversations\nâ¢ Asks you to keep the connection secret\nâ¢ Can\'t meet during normal hours\nâ¢ Becomes defensive about partner questions\n\nNEVER participate in cheatingâit harms the community and puts you at risk.',
            type: 'warning'
          },
          {
            heading: 'Behavioral Red Flags',
            content: 'ð© DISRESPECT:\nâ¢ Rude to service staff (shows true character)\nâ¢ Makes derogatory comments about others\nâ¢ Speaks badly about previous partners\nâ¢ Displays racist, sexist, or discriminatory attitudes\nâ¢ Dismissive of your opinions or feelings\n\nð© AGGRESSION:\nâ¢ Quick to anger\nâ¢ Aggressive communication style\nâ¢ Intimidating behavior\nâ¢ Punching walls, throwing objects\nâ¢ "Jokes" about violence\nâ¢ Road rage or similar outbursts\n\nð© JEALOUSY/POSSESSIVENESS:\nâ¢ Uncomfortable with you talking to others\nâ¢ Wants to know where you are constantly\nâ¢ Makes possessive comments\nâ¢ Displays jealousy in swinging context (ironic but problematic)\nâ¢ Tries to isolate you from others',
            type: 'warning'
          },
          {
            heading: 'Consent and Boundary Red Flags',
            content: 'ð© BOUNDARY VIOLATIONS:\nâ¢ Touching without permission\nâ¢ Escalating activities without asking\nâ¢ "Accidentally" crossing stated boundaries\nâ¢ Trying to negotiate boundaries\nâ¢ Making you feel bad for having boundaries\nâ¢ Testing limits to see what they can get away with\n\nð© CONSENT ISSUES:\nâ¢ Pressuring for activities after you\'ve said no\nâ¢ "Just this once" or "You\'ll like it"\nâ¢ Continuing after you\'ve asked to stop\nâ¢ Ignoring safe words\nâ¢ Proceeding when you\'re intoxicated\nâ¢ Assuming silence means yes\n\nThese are SERIOUS red flagsâend the interaction immediately.',
            type: 'warning'
          },
          {
            heading: 'Financial Red Flags',
            content: 'ð© MONEY REQUESTS:\nâ¢ Asking for money\nâ¢ Wanting you to pay for everything\nâ¢ "Can you help me with rent/bills?"\nâ¢ Selling content or services (if you\'re not seeking that)\nâ¢ MLM or business pitches\nâ¢ "Investment opportunities"\n\nð© SCAM INDICATORS:\nâ¢ Story seems rehearsed or familiar\nâ¢ Sudden emergency requiring money\nâ¢ Asks for gift cards or wire transfers\nâ¢ Too good to be true\nâ¢ Pressures for quick decisions\n\nThe lifestyle isn\'t transactionalâlegitimate connections don\'t involve money requests.',
            type: 'warning'
          },
          {
            heading: 'Safety and Health Red Flags',
            content: 'ð© SAFER SEX RESISTANCE:\nâ¢ Reluctant to use protection\nâ¢ "I\'m clean, don\'t worry"\nâ¢ Pressures for unprotected activities\nâ¢ Removes condom without consent (stealthing)\nâ¢ Unclear about STI testing status\nâ¢ Dismissive of sexual health discussions\n\nð© SUBSTANCE ISSUES:\nâ¢ Excessive drinking\nâ¢ Pressure you to drink or use substances\nâ¢ Impaired judgment\nâ¢ Substance use affecting behavior\nâ¢ Can\'t enjoy lifestyle without substances\n\nð© PHYSICAL SAFETY CONCERNS:\nâ¢ Suggests isolated meeting locations\nâ¢ Wants to pick you up (control of transportation)\nâ¢ Tries to get you alone quickly\nâ¢ Makes you feel physically unsafe\nâ¢ Aggressive physicality',
            type: 'warning'
          },
          {
            heading: 'Online Scams and Catfishing',
            content: 'ð© CATFISH INDICATORS:\nâ¢ Photos look too perfect or model-like\nâ¢ Reverse image search finds photos elsewhere\nâ¢ Refuses to video chat\nâ¢ Stories don\'t add up\nâ¢ Always has excuses for not meeting\nâ¢ Asks for explicit content but won\'t reciprocate\n\nð© COMMON SCAMS:\nâ¢ "Verification fee" scams\nâ¢ "I need you to sign up on this site"\nâ¢ Phishing links\nâ¢ Blackmail attempts\nâ¢ Identity theft attempts\n\nLegitimate lifestyle members don\'t ask for money, fees, or personal information like SSN.',
            type: 'warning'
          },
          {
            heading: 'Social and Community Red Flags',
            content: 'ð© REPUTATION ISSUES:\nâ¢ Other community members warn about them\nâ¢ Banned from events or sites\nâ¢ Multiple people have had problems with them\nâ¢ Dismissive of community concerns\nâ¢ "Everyone else is the problem"\n\nð© DRAMA PATTERNS:\nâ¢ Constant conflict with others\nâ¢ Always has drama or crisis\nâ¢ Speaks badly about entire community\nâ¢ Burned bridges everywhere\nâ¢ Takes no responsibility for conflicts\n\nPay attention when the community warns youâthey\'re often protecting you.',
            type: 'warning'
          },
          {
            heading: 'Gut Feeling: The Ultimate Red Flag',
            content: 'Your intuition is powerful:\n\nð¯ TRUST YOUR GUT:\n"Something feels off but I can\'t explain it"\n"I feel uncomfortable around them"\n"This doesn\'t feel right"\n"I\'m making excuses for their behavior"\n"I feel pressured or anxious"\n\nYour subconscious picks up on details you might not consciously notice. If something feels wrong, honor that feelingâeven if you can\'t articulate exactly why.\n\nYou don\'t need a logical reason to end an interaction. "I\'m not comfortable" is enough.',
            type: 'key-point'
          },
          {
            heading: 'What to Do When You See Red Flags',
            content: '1ï¸â£ ACKNOWLEDGE IT:\nDon\'t ignore or rationalize red flags away\n\n2ï¸â£ ASSESS SEVERITY:\nâ¢ Minor flag: Proceed cautiously, watch for more\nâ¢ Major flag: End the interaction\nâ¢ Safety flag: End immediately and protect yourself\n\n3ï¸â£ COMMUNICATE:\nâ¢ Tell your partner\nâ¢ Discuss concerns with trusted friends\nâ¢ Report serious issues to site admins/event organizers\n\n4ï¸â£ TAKE ACTION:\nâ¢ End communication if appropriate\nâ¢ Block on all platforms\nâ¢ Warn others if it\'s a safety concern\nâ¢ Report to authorities if laws broken\n\n5ï¸â£ DON\'T SECOND-GUESS:\nâ¢ You don\'t owe anyone a chance\nâ¢ Better safe than sorry\nâ¢ Your safety > their feelings',
            type: 'example'
          },
          {
            heading: 'Green Flags: What to Look For',
            content: 'Positive signs of safe, healthy connections:\n\nâ RESPECT:\nâ¢ Respects boundaries immediately\nâ¢ Communicates clearly and honestly\nâ¢ Values consent\nâ¢ Treats everyone well\n\nâ TRANSPARENCY:\nâ¢ Open about their situation\nâ¢ Partner is aware and involved\nâ¢ Willing to verify identity\nâ¢ Consistent information\n\nâ PATIENCE:\nâ¢ Willing to take time to build trust\nâ¢ No pressure or rushing\nâ¢ Understanding of safety concerns\nâ¢ Respects your pace\n\nâ COMMUNITY STANDING:\nâ¢ Good reputation in community\nâ¢ Referenced positively by others\nâ¢ Active in lifestyle events\nâ¢ Long-term presence\n\nGreen flags indicate someone worth investing time in.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Red flags are warning signsâdon\'t ignore them\nâ Watch for profile inconsistencies and vague information\nâ Rushing, boundary testing, and consent issues are serious red flags\nâ Relationship dishonesty puts you at riskâavoid it\nâ Behavioral issues like aggression and jealousy are disqualifying\nâ Financial requests and scams are commonânever send money\nâ Trust your gut feeling even if you can\'t explain it\nâ End interactions when you see red flagsâyou don\'t owe anyone a chance\nâ Report serious safety concerns to protect the community\nâ Look for green flags that indicate healthy connections\n\nRecognizing red flags early protects you and helps you focus energy on positive, safe connections.',
            type: 'key-point'
          }
        ]
      },
      'mod-10': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Physical Safety Protocols: Your Comprehensive Guide',
            content: 'Physical safety in the lifestyle requires preparation, awareness, and clear protocols. This module covers everything from safer sex practices to personal safety during encounters, ensuring you can enjoy the lifestyle while minimizing physical risks.\n\nThese protocols should become second natureâautomatic practices that protect you in every lifestyle interaction.',
            type: 'normal'
          },
          {
            heading: 'The Foundation: Sexual Health and Safer Sex',
            content: 'Sexual health is the cornerstone of physical safety:\n\nð¯ REGULAR TESTING:\nâ¢ Get tested for STIs every 3-6 months\nâ¢ More frequent if you have multiple partners\nâ¢ Test after any unprotected exposure\nâ¢ Full panel: HIV, Syphilis, Gonorrhea, Chlamydia, Hepatitis\nâ¢ Know your status and share honestly\n\nð¯ KNOWING YOUR STATUS:\nâ¢ Keep dated test results accessible\nâ¢ Share status with potential partners before play\nâ¢ Update regularly\nâ¢ Disclose any positive results immediately\n\nHonesty about sexual health protects everyone and is required in the lifestyle community.',
            type: 'key-point'
          },
          {
            heading: 'Barrier Protection: Essential Practices',
            content: 'ð¡ï¸ CONDOM USE:\nâ¢ Use condoms for all penetrative activities\nâ¢ New condom for each partner and each act\nâ¢ Check expiration dates\nâ¢ Store properly (not in wallet or hot car)\nâ¢ Bring your ownâdon\'t rely on others\nâ¢ Know how to use properly\n\nð¡ï¸ OTHER BARRIERS:\nâ¢ Dental dams for oral-vaginal or oral-anal contact\nâ¢ Female condoms as alternative\nâ¢ Gloves for manual stimulation\nâ¢ Consider barriers even for oral sex\n\nð¡ï¸ PROPER USAGE:\nâ¢ Check for damage before use\nâ¢ Use water or silicone-based lube (not oil)\nâ¢ Hold base when removing\nâ¢ Dispose properly after single use\n\nBarrier protection significantly reduces STI transmission.',
            type: 'example'
          },
          {
            heading: 'When Barriers Fail',
            content: 'Despite best efforts, condoms can break or slip:\n\nð¨ IMMEDIATE STEPS:\n1. STOP immediately\n2. Inspect for breakage\n3. Communicate with all parties\n4. Assess need for emergency contraception\n5. Consider PEP (Post-Exposure Prophylaxis) for HIV if high risk\n6. Get tested at appropriate intervals\n7. Inform other partners\n\nâ° TESTING TIMELINE AFTER EXPOSURE:\nâ¢ 2 weeks: Early STI screening\nâ¢ 4-6 weeks: HIV antibody test\nâ¢ 3 months: Confirmatory HIV test\nâ¢ Follow medical advice for specific concerns\n\nKnow where to access emergency services in advance.',
            type: 'warning'
          },
          {
            heading: 'Substance Safety in Lifestyle Settings',
            content: 'ð· ALCOHOL GUIDELINES:\nâ¢ Set a limit before you arrive\nâ¢ Alternate alcoholic and non-alcoholic drinks\nâ¢ Eat before and during drinking\nâ¢ Stay hydrated with water\nâ¢ Never leave drinks unattended\nâ¢ Don\'t accept drinks you didn\'t see prepared\nâ¢ Know your limits and stick to them\n\nð« DRUGS AND CONSENT:\nâ¢ Impairment affects consent capacity\nâ¢ Never accept drugs from strangers\nâ¢ If you choose to use, know what you\'re taking\nâ¢ Have a sober safety person\nâ¢ Start with small amounts\nâ¢ Know signs of overdose and how to respond\n\nIMPORTANT: Consent cannot be given when significantly impaired. Impairment also increases all other risks.',
            type: 'warning'
          },
          {
            heading: 'Physical Boundaries During Play',
            content: 'Maintain physical safety through clear boundaries:\n\nâ BEFORE PLAY:\nâ¢ Discuss hard limits (activities you absolutely won\'t do)\nâ¢ Establish soft limits (maybes, proceed with caution)\nâ¢ Agree on safe words/signals\nâ¢ Discuss intensity preferences\nâ¢ Clarify who can touch where\nâ¢ Set time boundaries\n\nâ DURING PLAY:\nâ¢ Check in regularly\nâ¢ Watch for non-verbal discomfort\nâ¢ Respect safe words immediately\nâ¢ Adjust intensity based on response\nâ¢ Stop if anyone seems distressed\nâ¢ Maintain awareness of surroundings\n\nâ PHYSICAL SAFETY CHECKS:\nâ¢ Adequate space for activities\nâ¢ No sharp objects or hazards nearby\nâ¢ Comfortable temperature\nâ¢ Access to water\nâ¢ First aid kit available\nâ¢ Clear path to exit',
            type: 'key-point'
          },
          {
            heading: 'Safe Words and Communication Systems',
            content: 'Establish clear communication before any physical activity:\n\nð¦ TRAFFIC LIGHT SYSTEM:\nâ¢ GREEN: "I\'m good, continue"\nâ¢ YELLOW: "Slow down, approaching my limit"\nâ¢ RED: "Stop immediately"\n\nð¢ VERBAL SAFE WORDS:\nâ¢ Choose an unusual word ("pineapple," "Nebraska")\nâ¢ Easy to remember and say\nâ¢ Something you wouldn\'t say normally\nâ¢ All participants must know it\n\nð¤ NON-VERBAL SIGNALS:\nâ¢ Important if mouth is occupied\nâ¢ Hand signals (three taps, specific gesture)\nâ¢ Dropping a held object\nâ¢ Shaking head vigorously\n\nâ ï¸ SAFE WORD RULES:\nâ¢ Anyone can use it at any time\nâ¢ Everything stops IMMEDIATELY\nâ¢ No questions or negotiations\nâ¢ Check in with the person who used it\nâ¢ Only resume if everyone agrees\nâ¢ Never shame someone for using safe words',
            type: 'key-point'
          },
          {
            heading: 'Personal Safety During Group Activities',
            content: 'Group play has additional safety considerations:\n\nð¥ BEFORE GROUP PLAY:\nâ¢ Know who will be present\nâ¢ Discuss everyone\'s boundaries\nâ¢ Establish group safe word\nâ¢ Assign someone to monitor safety\nâ¢ Agree on safer sex protocols\nâ¢ Know where exits are\nâ¢ Have clear end time\n\nð¥ DURING GROUP PLAY:\nâ¢ Stay aware of your surroundings\nâ¢ Keep belongings secure\nâ¢ Know where your partner is\nâ¢ Check in with partner regularly\nâ¢ Watch for boundary violations (yours or others\')  \nâ¢ Don\'t be afraid to speak up\nâ¢ Help enforce others\' boundaries\n\nð¥ AFTER GROUP PLAY:\nâ¢ Account for all your belongings\nâ¢ Check in with partner\nâ¢ Debrief the experience\nâ¢ Address any concerns immediately',
            type: 'example'
          },
          {
            heading: 'Physical Safety in Lifestyle Venues',
            content: 'ð¢ AT CLUBS AND PARTIES:\nâ¢ Tour the venue when you arrive\nâ¢ Locate all exits\nâ¢ Know where security/staff are\nâ¢ Stay aware of who\'s around you\nâ¢ Keep valuables secure\nâ¢ Stay in well-lit areas\nâ¢ Use buddy system\nâ¢ Don\'t go to isolated areas alone\nâ¢ Watch your drinks\nâ¢ Know the venue\'s rules and safety protocols\n\nð¨ VENUE RED FLAGS:\nâ¢ No visible staff or security\nâ¢ Poor lighting\nâ¢ Dirty or unsanitary\nâ¢ No clear safety rules\nâ¢ Staff doesn\'t enforce boundaries\nâ¢ No safe words respected\nâ¢ Pressure to participate\nâ¢ Can\'t easily leave\n\nTrust your comfort levelâleave if a venue feels unsafe.',
            type: 'warning'
          },
          {
            heading: 'Hotel and Private Location Safety',
            content: 'ð¨ HOTEL SAFETY:\nâ¢ Book your own room when possible\nâ¢ Choose reputable hotels\nâ¢ Check room upon arrival\nâ¢ Know emergency exits\nâ¢ Keep door unlocked if preferred (know exit route)\nâ¢ Keep phone charged and accessible\nâ¢ Have car keys ready\nâ¢ Maintain check-in schedule with safety contact\n\nð  PRIVATE HOME SAFETY:\nâ¢ Only visit after multiple public meetings\nâ¢ Tell someone exact address\nâ¢ Share check-in schedule\nâ¢ Scout exit routes when you arrive\nâ¢ Keep shoes on for quick exit\nâ¢ Stay near exits\nâ¢ Have your own transportation\nâ¢ Meet partners at the location (don\'t get picked up)\nâ¢ Consider neutral location for first private meetings',
            type: 'example'
          },
          {
            heading: 'Handling Physical Emergencies',
            content: 'ð MEDICAL EMERGENCIES:\nâ¢ Stop all activity immediately\nâ¢ Assess the situation\nâ¢ Call 911 if serious\nâ¢ Provide first aid if trained\nâ¢ Don\'t move someone with possible injury\nâ¢ Stay calm and supportive\nâ¢ Follow emergency responders\' instructions\n\nð WHAT TO KEEP ACCESSIBLE:\nâ¢ First aid kit (bandages, antiseptic, etc.)\nâ¢ Emergency contacts\nâ¢ List of allergies/medical conditions\nâ¢ Current medications\nâ¢ EpiPen if allergies present\nâ¢ Naloxone (Narcan) if drugs may be present\n\nð± EMERGENCY INFO:\nâ¢ Know location address\nâ¢ Have phone fully charged\nâ¢ Know nearest hospital\nâ¢ Have emergency contact numbers\nâ¢ Don\'t be afraid to call 911\nâ¢ Honesty with responders (helps treatment)',
            type: 'warning'
          },
          {
            heading: 'Aftercare: Physical and Emotional',
            content: 'Aftercare is crucial for physical and emotional well-being:\n\nð PHYSICAL AFTERCARE:\nâ¢ Rehydrate (water, electrolyte drinks)\nâ¢ Eat light snacks (blood sugar recovery)\nâ¢ Temperature regulation (blankets if cold)\nâ¢ Tend to any physical marks or soreness\nâ¢ Rest and recovery time\nâ¢ Gentle movement or stretching\nâ¢ Shower/clean up when ready\n\nð EMOTIONAL AFTERCARE:\nâ¢ Check in verbally\nâ¢ Provide comfort and reassurance\nâ¢ Process the experience together\nâ¢ Address any concerns\nâ¢ Cuddle or physical comfort if desired\nâ¢ Respect need for space if preferred\nâ¢ Follow up in the following days\n\nð SUB-DROP/TOP-DROP AWARENESS:\nAfter intense experiences, hormones drop and can cause:\nâ¢ Emotional sensitivity\nâ¢ Sadness or anxiety\nâ¢ Physical exhaustion\nâ¢ Need for reassurance\n\nThis is normalâprovide extra care and check-ins.',
            type: 'normal'
          },
          {
            heading: 'Self-Defense and De-Escalation',
            content: 'ð¥ BASIC SELF-DEFENSE AWARENESS:\nâ¢ Take a self-defense class\nâ¢ Practice awareness of surroundings\nâ¢ Trust your instincts about danger\nâ¢ Know vulnerable points if needed\nâ¢ Carry personal safety items if legal (alarm, pepper spray)\nâ¢ Primary goal is always escape, not fight\n\nð£ï¸ DE-ESCALATION TECHNIQUES:\nâ¢ Stay calm and speak calmly\nâ¢ Use non-threatening body language\nâ¢ Create physical distance\nâ¢ Look for exits\nâ¢ Call for help if needed\nâ¢ Prioritize getting away safely\n\nð¨ WHEN TO ESCALATE:\nIf you feel immediately threatened:\nâ¢ Make noise/yell for help\nâ¢ Use your phone to call 911\nâ¢ Use self-defense only as last resort\nâ¢ Get to safety as quickly as possible\nâ¢ Report to authorities',
            type: 'warning'
          },
          {
            heading: 'Documentation and Reporting',
            content: 'If a physical safety incident occurs:\n\nð DOCUMENT:\nâ¢ Write down what happened immediately\nâ¢ Include dates, times, locations\nâ¢ Note witnesses\nâ¢ Take photos of any injuries\nâ¢ Save all messages and communications\nâ¢ Get medical examination if needed (preserves evidence)\n\nð¢ REPORT:\nâ¢ Tell your partner immediately\nâ¢ Report to venue management if applicable\nâ¢ File police report for assault or serious violations\nâ¢ Report to lifestyle site/event organizers\nâ¢ Warn trusted community members\nâ¢ Seek medical attention and documentation\n\nð SUPPORT:\nâ¢ Talk to trusted friends\nâ¢ Consider professional counseling\nâ¢ Join support groups\nâ¢ Don\'t blame yourself\nâ¢ Take time to process\nâ¢ Focus on your healing',
            type: 'normal'
          },
          {
            heading: 'Building a Physical Safety Culture',
            content: 'Everyone\'s responsibility to maintain safety:\n\nâ PERSONAL RESPONSIBILITY:\nâ¢ Follow all safety protocols\nâ¢ Respect everyone\'s boundaries\nâ¢ Speak up when you see violations\nâ¢ Take care of your health\nâ¢ Be honest about status and limits\nâ¢ Support others\' safety needs\n\nâ COMMUNITY RESPONSIBILITY:\nâ¢ Call out unsafe behavior\nâ¢ Support people who report issues\nâ¢ Share safety information\nâ¢ Maintain standards\nâ¢ Exclude people who violate safety\nâ¢ Educate newcomers\nâ¢ Lead by example\n\nA strong safety culture protects everyone and makes the lifestyle better for all.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Get tested regularly and know your STI status\nâ Use barrier protection consistently and correctly\nâ Set clear limits and stay within your comfort zone\nâ Establish and respect safe words/signals\nâ Control alcohol/substance useâimpairment affects safety\nâ Maintain situational awareness in all settings\nâ Keep emergency contacts and supplies accessible\nâ Provide proper aftercare for physical and emotional well-being\nâ Document and report safety violations\nâ Support community safety culture\n\nPhysical safety protocols protect you and everyone you interact with. Make them automatic.',
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
            content: 'The lifestyle community is built on fundamental values:\n\nð¯ CONSENT: Everything requires enthusiastic consent\nð¯ RESPECT: All people and boundaries are respected\nð¯ DISCRETION: Privacy is protected\nð¯ HONESTY: Transparency about status and intentions\nð¯ SAFETY: Physical and emotional well-being prioritized\nð¯ INCLUSION: Welcoming of diverse people and expressions\nð¯ RESPONSIBILITY: Accountability for actions\n\nThese values guide all interactions and expectations.',
            type: 'key-point'
          },
          {
            heading: 'Standard Community Expectations',
            content: 'â WHAT\'S EXPECTED OF EVERYONE:\n\nâ¢ Obtain clear consent before any activity\nâ¢ Respect "no" immediately without question\nâ¢ Honor stated boundaries\nâ¢ Practice safer sex\nâ¢ Know and disclose STI status\nâ¢ Be honest about relationship arrangements\nâ¢ Maintain discretion about others\nâ¢ Follow venue rules\nâ¢ Treat everyone with respect\nâ¢ Report safety concerns\nâ¢ Support survivors of violations\nâ¢ Welcome and educate newcomers\nâ¢ Take responsibility for mistakes\n\nThese aren\'t optionalâthey\'re requirements for community participation.',
            type: 'normal'
          },
          {
            heading: 'Venue-Specific Rules',
            content: 'Different lifestyle venues have specific rules:\n\nð¢ COMMON CLUB RULES:\nâ¢ Dress code requirements\nâ¢ No photography without explicit consent\nâ¢ Consent culture (ask before touching)\nâ¢ Designated play areas\nâ¢ No single males (at some venues)\nâ¢ Alcohol policies\nâ¢ Drug prohibitions\nâ¢ Age verification required\nâ¢ Respect for staff and security\nâ¢ Cleanliness standards\n\nð ALWAYS:\nâ¢ Read venue rules before attending\nâ¢ Ask questions if anything is unclear\nâ¢ Follow rules even if you disagree\nâ¢ Respect that each venue sets their own standards\nâ¢ Leave if you\'re uncomfortable with venue practices',
            type: 'example'
          },
          {
            heading: 'Online Community Standards',
            content: 'ð» LIFESTYLE SITE/APP EXPECTATIONS:\n\nâ¢ Authentic profiles (real photos, honest information)\nâ¢ Respectful communication\nâ¢ No harassment or unwanted contact\nâ¢ Report violations to site administrators\nâ¢ No solicitation (prostitution, trafficking)\nâ¢ Respect privacy settings\nâ¢ Follow site-specific rules\nâ¢ Don\'t screenshot/share private messages\nâ¢ Age verification compliance\nâ¢ Appropriate content in public areas\n\nð« BEHAVIORS THAT GET YOU BANNED:\nâ¢ Fake profiles or catfishing\nâ¢ Harassment\nâ¢ Sharing others\' information\nâ¢ Revenge porn or non-consensual sharing\nâ¢ Spam or commercial activity\nâ¢ Violating consent\nâ¢ Threatening behavior\nâ¢ Underage content',
            type: 'warning'
          },
          {
            heading: 'Consent Culture in Practice',
            content: 'How consent culture works in lifestyle spaces:\n\nâ THE ASK:\nâ¢ "May I touch you?"\nâ¢ "Would you like to dance?"\nâ¢ "Are you interested in joining us?"\nâ¢ Always ask, never assume\n\nâ THE RESPONSE:\nâ¢ "Yes" means yes (and can be withdrawn)\nâ¢ "No" means no (and doesn\'t require explanation)\nâ¢ "Maybe" means no (don\'t pressure)\nâ¢ Silence means no\n\nâ THE RESPECT:\nâ¢ Accept answers gracefully\nâ¢ Don\'t ask repeatedly\nâ¢ Don\'t try to negotiate a "no"\nâ¢ Thank them for being clear\nâ¢ Move on without resentment\n\nThis creates an environment where everyone feels safe to participate honestly.',
            type: 'key-point'
          },
          {
            heading: 'Discretion and Privacy Standards',
            content: 'ð¤« COMMUNITY DISCRETION RULES:\n\nâ¢ What happens in lifestyle spaces stays private\nâ¢ Don\'t share who you saw at events/venues\nâ¢ Don\'t gossip about others\' lifestyle involvement\nâ¢ Don\'t post about others on social media\nâ¢ Protect real identities of lifestyle connections\nâ¢ Don\'t "out" people as lifestyle participants\nâ¢ Respect privacy boundaries\nâ¢ Delete/don\'t share others\' photos without permission\n\nâï¸ WHY THIS MATTERS:\nMany people face serious consequences if their lifestyle involvement is exposed:\nâ¢ Job loss\nâ¢ Family estrangement\nâ¢ Custody battles\nâ¢ Social stigma\nâ¢ Housing discrimination\n\nProtecting privacy protects people\'s lives.',
            type: 'warning'
          },
          {
            heading: 'Supporting Newcomers',
            content: 'Experienced members help create a welcoming community:\n\nð¤ HOW TO SUPPORT NEWCOMERS:\nâ¢ Be friendly and welcoming\nâ¢ Offer to answer questions\nâ¢ Share resources and information\nâ¢ Introduce them to others\nâ¢ Respect that they\'re learning\nâ¢ Don\'t pressure or take advantage\nâ¢ Model good behavior\nâ¢ Protect them from predatory people\nâ¢ Be patient with mistakes\nâ¢ Celebrate their growth\n\nð« DON\'T:\nâ¢ Assume they\'re "easy targets"\nâ¢ Pressure them into activities\nâ¢ Mock their nervousness\nâ¢ Share their information\nâ¢ Treat them as lesser members\n\nHow we treat newcomers determines the community\'s future.',
            type: 'normal'
          },
          {
            heading: 'Handling Conflicts and Concerns',
            content: 'âï¸ WHEN CONFLICTS ARISE:\n\n1. ADDRESS DIRECTLY (when safe):\n"I felt uncomfortable when..."\n"That crossed my boundary..."\n"I need this to stop..."\n\n2. INVOLVE VENUE STAFF:\nâ¢ Report to management\nâ¢ Ask for assistance\nâ¢ They\'re trained to handle issues\n\n3. DOCUMENT:\nâ¢ Write down what happened\nâ¢ Note witnesses\nâ¢ Save messages\nâ¢ Take photos if relevant\n\n4. REPORT TO ORGANIZERS:\nâ¢ Event coordinators\nâ¢ Website administrators\nâ¢ Community leaders\nâ¢ They need to know to protect others\n\n5. SERIOUS VIOLATIONS:\nâ¢ Contact law enforcement if applicable\nâ¢ Seek support from community\nâ¢ Don\'t minimize what happened',
            type: 'example'
          },
          {
            heading: 'Community Accountability',
            content: 'The community self-regulates through accountability:\n\nâ WHEN SOMEONE VIOLATES STANDARDS:\nâ¢ Call out the behavior\nâ¢ Report to appropriate people\nâ¢ Support the person harmed\nâ¢ Don\'t make excuses for violators\nâ¢ Remove them from community if serious\nâ¢ Believe reporters, investigate claims\nâ¢ Take action to prevent repeat incidents\n\nâ WHEN YOU MAKE A MISTAKE:\nâ¢ Acknowledge it immediately\nâ¢ Apologize sincerely\nâ¢ Make amends\nâ¢ Change your behavior\nâ¢ Accept consequences\nâ¢ Learn from it\nâ¢ Don\'t make excuses\n\nAccountability maintains community standards.',
            type: 'key-point'
          },
          {
            heading: 'Your Role in Community Safety',
            content: 'Every member contributes to community safety:\n\nðï¸ BE AN ACTIVE BYSTANDER:\nâ¢ Watch for consent violations\nâ¢ Check on people who seem uncomfortable\nâ¢ Intervene when you see problems\nâ¢ Report concerning behavior\nâ¢ Support people who speak up\nâ¢ Don\'t ignore red flags\n\nð£ï¸ SPEAK UP:\nâ¢ Call out inappropriate behavior\nâ¢ Share safety information\nâ¢ Report violations\nâ¢ Support safety initiatives\nâ¢ Advocate for better standards\nâ¢ Educate others\n\nð¤ BE THE CHANGE:\nâ¢ Model excellent behavior\nâ¢ Treat everyone with respect\nâ¢ Follow all safety protocols\nâ¢ Support community leaders\nâ¢ Mentor newcomers\nâ¢ Contribute positively\n\nSafety is everyone\'s responsibility.',
            type: 'normal'
          },
          {
            heading: 'Building Reputation and Trust',
            content: 'Your community reputation matters:\n\nâ BUILD POSITIVE REPUTATION:\nâ¢ Consistent respectful behavior\nâ¢ Following through on commitments\nâ¢ Respecting boundaries\nâ¢ Being honest and transparent\nâ¢ Supporting community values\nâ¢ Handling conflicts maturely\nâ¢ Being vouched for by others\n\nð REPUTATION IMPACTS:\nâ¢ Who wants to connect with you\nâ¢ Invitations to events\nâ¢ Trust from community\nâ¢ Quality of connections\nâ¢ Access to venues/groups\n\nâ ï¸ PROTECT YOUR REPUTATION:\nâ¢ One serious violation can end it\nâ¢ Gossip spreads quickly\nâ¢ The community has a long memory\nâ¢ Recovery from mistakes is possible but difficult\n\nYour reputation is your most valuable asset in the lifestyle.',
            type: 'tip'
          },
          {
            heading: 'Contributing to Positive Culture',
            content: 'ð CREATE THE COMMUNITY YOU WANT:\n\nâ¢ Be kind and welcoming\nâ¢ Share knowledge generously\nâ¢ Support community events\nâ¢ Volunteer when possible\nâ¢ Give constructive feedback\nâ¢ Celebrate others\' successes\nâ¢ Advocate for improvements\nâ¢ Lead by example\nâ¢ Foster inclusivity\nâ¢ Maintain high standards\n\nEvery positive interaction strengthens the community. Every violation weakens it. Choose to be a positive force.',
            type: 'key-point'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Community is built on consent, respect, discretion, and honesty\nâ Follow venue-specific rules and community expectations\nâ Practice consent culture in all interactions\nâ Protect others\' privacy and discretion always\nâ Welcome and support newcomers to the community\nâ Report violations and support those harmed\nâ Hold yourself and others accountable\nâ Be an active bystanderâintervene when needed\nâ Build positive reputation through consistent good behavior\nâ Contribute to the culture you want to see\n\nCommunity safety standards protect everyone. Follow them, enforce them, and help others understand them.',
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
            content: 'In the lifestyle, relationship structures affect:\n\nâ¢ Expectations and boundaries\nâ¢ Available time and energy\nâ¢ Emotional availability\nâ¢ Decision-making processes\nâ¢ Jealousy and insecurity management\nâ¢ Communication patterns\nâ¢ Long-term possibilities\n\nUnderstanding someone\'s relationship type helps you:\nâ Set appropriate expectations\nâ Respect their boundaries\nâ Communicate effectively\nâ Avoid misunderstandings\nâ Find compatible connections',
            type: 'normal'
          },
          {
            heading: 'Traditional Swinging: Same Room Play',
            content: 'ð« DEFINITION:\nCouples who play together, in the same space, with mutual awareness and participation.\n\nâ CHARACTERISTICS:\nâ¢ Both partners always present\nâ¢ Visual contact maintained\nâ¢ Shared experiences\nâ¢ Strong couple bond emphasis\nâ¢ Lower jealousy triggers for many\nâ¢ Feels like "doing it together"\n\nð¯ TYPICAL BOUNDARIES:\nâ¢ No separate play\nâ¢ Check-ins during play\nâ¢ Either can stop at any time\nâ¢ Emotional connection stays primary\n\nð­ BEST FOR:\nCouples who want to explore together while maintaining constant connection and reassurance.',
            type: 'example'
          },
          {
            heading: 'Separate Room Play',
            content: 'ðª DEFINITION:\nCouples who are comfortable playing with others in separate spaces or at different times.\n\nâ CHARACTERISTICS:\nâ¢ Trust in partner without visual supervision\nâ¢ More individual freedom\nâ¢ Requires higher trust and communication\nâ¢ Each partner has autonomous experiences\nâ¢ Jealousy management is crucial\n\nð¯ TYPICAL BOUNDARIES:\nâ¢ Pre-agreed time limits\nâ¢ Check-ins via text\nâ¢ Certain activities may be off-limits\nâ¢ Post-play debriefs\nâ¢ Right to stop at any time\n\nð­ BEST FOR:\nCouples with solid trust, minimal jealousy, and desire for more independent experiences.',
            type: 'example'
          },
          {
            heading: 'Soft Swap vs Full Swap',
            content: 'ð SOFT SWAP:\nLimited sexual activities with others, typically excluding intercourse.\n\nâ¢ Kissing, touching, oral sex â\nâ¢ Intercourse â\nâ¢ Allows exploration with boundaries\nâ¢ Common starting point for new swingers\n\nð FULL SWAP:\nAll sexual activities are on the table (within personal boundaries).\n\nâ¢ All activities including intercourse â\nâ¢ Requires strong trust and communication\nâ¢ More common with experienced swingers\nâ¢ Individual boundaries still apply\n\nð THE SPECTRUM:\nMany couples exist between soft and full swap, with personalized boundaries about specific acts.',
            type: 'key-point'
          },
          {
            heading: 'Polyamory: Multiple Loving Relationships',
            content: 'ð DEFINITION:\nThe practice of having multiple romantic and/or sexual relationships simultaneously, with the knowledge and consent of everyone involved.\n\nâ KEY PRINCIPLES:\nâ¢ Emotional connections encouraged\nâ¢ Multiple committed relationships possible\nâ¢ Everyone knows about everyone\nâ¢ Focus on love, not just sex\nâ¢ Long-term orientation\nâ¢ Relationship autonomy\n\nð¯ DIFFERS FROM SWINGING:\nâ¢ Emotional connections are central (not just physical)\nâ¢ Longer-term relationships\nâ¢ May involve dating, romance, love\nâ¢ More complex time management\nâ¢ Different jealousy dynamics\n\nð­ COMMON STRUCTURES:\nâ¢ "V" relationships (one person dating two who aren\'t dating each other)\nâ¢ Triads/Throuples (three people all together)\nâ¢ Polycules (complex interconnected networks)\nâ¢ Parallel poly (partners don\'t interact much)\nâ¢ Kitchen table poly (everyone\'s friendly)',
            type: 'normal'
          },
          {
            heading: 'Open Relationships',
            content: 'ð DEFINITION:\nA primary committed relationship with permission for sexual or romantic connections with others.\n\nâ CHARACTERISTICS:\nâ¢ Primary partnership remains central\nâ¢ Outside connections are secondary\nâ¢ Rules negotiated by primary couple\nâ¢ Can include emotions or be sex-only\nâ¢ Varies widely in structure\n\nð¯ COMMON VARIATIONS:\nâ¢ Monogamish (mostly monogamous with occasional exceptions)\nâ¢ One-sided open (only one partner dates others)\nâ¢ Open with restrictions (specific rules about outside partners)\nâ¢ Fully open (minimal restrictions)\n\nâï¸ BOUNDARIES VARY:\nâ¢ Who you can see (friends? strangers?)\nâ¢ What activities are allowed\nâ¢ How much information is shared\nâ¢ Time limitations\nâ¢ Veto power\n\nOpen relationships require crystal-clear communication.',
            type: 'example'
          },
          {
            heading: 'Relationship Anarchy',
            content: 'ð DEFINITION:\nRejecting traditional relationship hierarchies and labels, allowing each connection to develop naturally without prescribed rules.\n\nâ PRINCIPLES:\nâ¢ No primary/secondary hierarchy\nâ¢ Each relationship stands on its own\nâ¢ Minimal predetermined rules\nâ¢ Autonomy is paramount\nâ¢ No relationship "escalator" (progression assumptions)\nâ¢ Customized agreements per relationship\n\nð­ PHILOSOPHY:\n"This relationship is what we make it, not what society expects it to be."\n\nâ ï¸ CHALLENGES:\nâ¢ Requires exceptional communication\nâ¢ No built-in structure\nâ¢ Everything must be negotiated\nâ¢ Can feel unstable\nâ¢ Not compatible with people who need hierarchy\n\nâ BENEFITS:\nâ¢ Maximum freedom and flexibility\nâ¢ Authentic to individual needs\nâ¢ No prescribed expectations\nâ¢ Each relationship is unique',
            type: 'normal'
          },
          {
            heading: 'Hierarchical vs Non-Hierarchical',
            content: 'ð HIERARCHICAL:\nRelationships have clear rankings (primary, secondary, tertiary).\n\nâ¢ Primary relationship has priority\nâ¢ Primary has veto power\nâ¢ Primary\'s needs come first\nâ¢ Secondary partners have limitations\nâ¢ Clear structure and security\nâ¢ Common in lifestyle\n\nð¤ NON-HIERARCHICAL:\nAll relationships are valued equally based on their unique qualities.\n\nâ¢ No ranking system\nâ¢ Each relationship develops naturally\nâ¢ No built-in veto power\nâ¢ Time and energy allocated by needs, not rank\nâ¢ More complex to manage\nâ¢ Requires high autonomy\n\nð­ NEITHER IS BETTER:\nBoth work for different people. Know which you\'re practicing and be honest about it.',
            type: 'key-point'
          },
          {
            heading: 'Solo Polyamory',
            content: 'ð  DEFINITION:\nPolyamorous individuals who don\'t have or want a primary partner.\n\nâ CHARACTERISTICS:\nâ¢ Independent living (don\'t cohabitate)\nâ¢ Self as primary\nâ¢ Multiple connections without hierarchy\nâ¢ Autonomy is key\nâ¢ May have serious relationships without "primary" label\nâ¢ Own life is the center\n\nð­ PHILOSOPHY:\n"I\'m complete on my own, and I have multiple meaningful connections."\n\nð¯ CONSIDERATIONS FOR COUPLES:\nâ¢ Solo poly individuals won\'t prioritize you\nâ¢ They have their own autonomy\nâ¢ Don\'t expect traditional escalation\nâ¢ Respect their independence\nâ¢ Good for casual-to-moderate connections',
            type: 'normal'
          },
          {
            heading: 'Closed vs Open Structures',
            content: 'ð CLOSED (POLYFIDELITY):\nA group of people in a committed, closed relationship together.\n\nâ¢ Example: A triad where all three are exclusive to each other\nâ¢ No outside partners\nâ¢ Like monogamy, but with more than two\nâ¢ High security, lower variety\nâ¢ All members must agree to new people\n\nð OPEN:\nFreedom to add new partners as desired.\n\nâ¢ Ongoing ability to meet new people\nâ¢ More variety, less security\nâ¢ Requires constant communication\nâ¢ Compersion becomes important\nâ¢ More common in lifestyle\n\nâï¸ SEMI-CLOSED:\nOpen to new people but with restrictions or slow additions.',
            type: 'example'
          },
          {
            heading: 'Identifying Your Relationship Type',
            content: 'ð¤ QUESTIONS TO ASK YOURSELF:\n\n1. Do I want my partner present for all encounters?\n2. Am I comfortable with emotional connections outside my primary relationship?\n3. How much time do I want to invest in additional relationships?\n4. What level of autonomy do I need/want?\n5. How do I handle jealousy?\n6. What structure provides me security?\n7. What are my non-negotiables?\n8. What am I hoping to gain from the lifestyle?\n\nð¡ YOUR ANSWERS GUIDE YOUR PATH:\nThere\'s no "right" relationship typeâonly what works for you and your partners.',
            type: 'tip'
          },
          {
            heading: 'Communicating Your Relationship Type',
            content: 'ð¢ BE CLEAR IN PROFILES AND CONVERSATIONS:\n\n"We\'re a same-room couple looking for soft swap"\n"I practice solo polyamory and am open to ongoing connections"\n"We\'re full swap but prefer to play together"\n"I\'m in an open relationship; my partner isn\'t involved"\n\nâ INCLUDE:\nâ¢ Your structure\nâ¢ Your boundaries\nâ¢ Your expectations\nâ¢ Your availability\nâ¢ Your flexibility (or lack thereof)\n\nâ ï¸ AVOID ASSUMPTIONS:\nâ¢ "Lifestyle" means different things to different people\nâ¢ "Open" is vague\nâ¢ "Poly" has many interpretations\nâ¢ Always clarify specifics',
            type: 'key-point'
          },
          {
            heading: 'Respecting Different Relationship Types',
            content: 'â BEST PRACTICES:\n\nâ¢ Don\'t judge others\' choices\nâ¢ Don\'t pressure people to change their structure\nâ¢ Respect boundaries even if you don\'t understand them\nâ¢ Don\'t claim your way is "better"\nâ¢ Accept incompatibility gracefully\nâ¢ Learn about structures you\'re unfamiliar with\nâ¢ Ask questions respectfully\nâ¢ Understand that different structures have different needs\n\nð« DON\'T:\nâ¢ "You\'re not REALLY poly if..."\nâ¢ "Why don\'t you just..."\nâ¢ "That\'s too restrictive/too open"\nâ¢ "My way is more evolved"\n\nDiversity of relationship types strengthens the community.',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Multiple valid relationship structures exist in the lifestyle\nâ Swinging, polyamory, and open relationships have key differences\nâ Same room vs separate room is about trust and comfort\nâ Soft swap vs full swap defines physical boundaries\nâ Hierarchical vs non-hierarchical affects priorities\nâ Solo poly individuals prioritize their autonomy\nâ Clearly communicate your relationship type\nâ Respect all relationship structures\nâ Find what works for youâthere\'s no "right" way\nâ Your structure may evolve over time\n\nUnderstanding relationship types helps you navigate the lifestyle with clarity and respect.',
            type: 'key-point'
          }
        ]
      },
      'mod-13': {
        estimatedTime: '30 minutes',
        sections: [
          {
            heading: 'Polyamory Fundamentals: Introduction to Ethical Non-Monogamy',
            content: 'Polyamoryâthe practice of having multiple loving, committed relationships simultaneously with the knowledge and consent of everyone involvedârepresents a growing relationship paradigm. This module explores the foundations, challenges, and rewards of polyamorous relationships.\n\nWhether you\'re considering polyamory, currently practicing it, or connecting with polyamorous individuals, understanding these fundamentals will help you navigate this landscape with confidence and respect.',
            type: 'normal'
          },
          {
            heading: 'What Polyamory Is (and Isn\'t)',
            content: 'â POLYAMORY IS:\nâ¢ Multiple consensual relationships\nâ¢ Emotional connections welcomed\nâ¢ Honest and transparent\nâ¢ Ethical and above-board\nâ¢ Based on communication\nâ¢ Long-term oriented\nâ¢ Commitment to multiple people\n\nâ POLYAMORY IS NOT:\nâ¢ Cheating (everyone knows and consents)\nâ¢ Inability to commit (deep commitments to multiple people)\nâ¢ Just about sex (emotional bonds are central)\nâ¢ A phase (for many, it\'s an orientation)\nâ¢ Easier than monogamy (often requires more work)\nâ¢ Avoiding relationship problems (problems still exist)\nâ¢ For everyone (not universal)',
            type: 'key-point'
          },
          {
            heading: 'Polyamory vs Swinging',
            content: 'Understanding the distinction:\n\nð¯ SWINGING:\nâ¢ Primary focus on sexual experiences\nâ¢ Recreational approach\nâ¢ "Us plus them" mentality\nâ¢ Couple-centric\nâ¢ Often event/encounter based\nâ¢ Emotional connections usually discouraged\n\nð POLYAMORY:\nâ¢ Emotional connections central\nâ¢ Relationship-building focus\nâ¢ Individual relationship autonomy\nâ¢ Can be single or coupled\nâ¢ Ongoing relationships expected\nâ¢ Love and romance encouraged\n\nð¤ OVERLAP:\nMany people enjoy both! Polyamorous people may swing, and swingers may develop emotional connections. The categories aren\'t exclusive.',
            type: 'example'
          },
          {
            heading: 'Core Polyamory Principles',
            content: '1ï¸â£ CONSENT:\nAll parties knowledgeable and agreeing\n\n2ï¸â£ COMMUNICATION:\nOpen, honest, frequent dialogue\n\n3ï¸â£ COMPERSION:\nFinding joy in your partner\'s happiness with others\n\n4ï¸â£ AUTONOMY:\nEach person has relationship agency\n\n5ï¸â£ ABUNDANCE MINDSET:\nLove is not a finite resource\n\n6ï¸â£ INTENTIONALITY:\nThoughtful relationship design\n\n7ï¸â£ RESPONSIBILITY:\nOwning your choices and their impact\n\n8ï¸â£ HONESTY:\nTransparency in all relationships\n\nThese principles guide ethical polyamorous practice.',
            type: 'key-point'
          },
          {
            heading: 'Common Polyamory Structures',
            content: 'ðº HIERARCHICAL POLYAMORY:\nâ¢ Primary/secondary/tertiary rankings\nâ¢ Primary relationship has priority and veto power\nâ¢ Clear structure and security\nâ¢ Common for couples opening up\nâ¢ Can feel limiting to secondary partners\n\nð° NON-HIERARCHICAL (EGALITARIAN):\nâ¢ All relationships valued equally\nâ¢ No ranking system\nâ¢ Each relationship develops naturally\nâ¢ More complex scheduling\nâ¢ High autonomy required\n\nð¥ RELATIONSHIP ANARCHY:\nâ¢ No prescribed structure\nâ¢ Each connection defines itself\nâ¢ No automatic hierarchy\nâ¢ Maximum flexibility\nâ¢ Requires exceptional communication\n\nð  KITCHEN TABLE POLYAMORY:\nâ¢ All partners/metamours are friendly\nâ¢ Regular group interactions\nâ¢ "We could all sit at a kitchen table together"\nâ¢ Integrated social lives\nâ¢ Requires everyone to get along\n\nð± PARALLEL POLYAMORY:\nâ¢ Partners don\'t interact with metamours\nâ¢ Separate relationships\nâ¢ Minimal information sharing\nâ¢ Less potential for conflict\nâ¢ Can feel isolating',
            type: 'example'
          },
          {
            heading: 'Understanding Metamours',
            content: 'ð¥ METAMOUR: Your partner\'s partner.\n\nExample: If you\'re dating Alex, and Alex is dating Sam, then Sam is your metamour.\n\nð¤ METAMOUR RELATIONSHIPS VARY:\nâ¢ Best friends (close, integrated)\nâ¢ Friendly (cordial, occasional interaction)\nâ¢ Cordial (polite, minimal interaction)\nâ¢ Parallel (don\'t interact)\nâ¢ Difficult (conflict or avoidance)\n\nâ HEALTHY METAMOUR DYNAMICS:\nâ¢ Respect for each other\'s relationship\nâ¢ Clear boundaries\nâ¢ No jealousy-based competition\nâ¢ Mutual support\nâ¢ Recognition that you both care for the same person\nâ¢ Optional friendship\n\nð¡ TIP:\nYou don\'t have to be best friends with metamours, but basic respect is essential.',
            type: 'normal'
          },
          {
            heading: 'Compersion: The Opposite of Jealousy',
            content: 'ð COMPERSION: Finding joy in your partner\'s joy with other partners.\n\nExample: Your partner goes on a wonderful date and comes home happy. Instead of feeling jealous, you feel happy for them.\n\nð¯ COMPERSION IS:\nâ¢ Not automatic (develops over time)\nâ¢ Not required (poly works without it)\nâ¢ A bonus, not a necessity\nâ¢ Separate from jealousy (can feel both)\nâ¢ A skill that can be cultivated\n\nð± CULTIVATING COMPERSION:\nâ¢ Process your insecurities\nâ¢ Focus on abundance, not scarcity\nâ¢ Celebrate your partner\'s happiness\nâ¢ Remember: their joy doesn\'t diminish yours\nâ¢ Practice gratitude\nâ¢ Build your own connections\nâ¢ Work through jealousy\n\nCompersion is beautiful but not mandatory for successful polyamory.',
            type: 'key-point'
          },
          {
            heading: 'Time Management in Polyamory',
            content: 'â° THE CHALLENGE:\nTime is finite. Energy is finite. Love may be infinite, but hours in the day are not.\n\nð TIME MANAGEMENT STRATEGIES:\n\nâ¢ COLOR-CODED CALENDARS:\nShared calendars showing commitments\n\nâ¢ SCHEDULED DATES:\nPre-planned time for each partner\n\nâ¢ FLEXIBILITY:\nSome spontaneity balanced with structure\n\nâ¢ ALONE TIME:\nDon\'t forget self-care!\n\nâ¢ REALISTIC EXPECTATIONS:\nYou can\'t be everywhere\n\nâ¢ QUALITY OVER QUANTITY:\nMake time count\n\nâ¢ COMMUNICATION:\nDiscuss needs and availability\n\nâ¢ BUFFER TIME:\nSchedule transition periods\n\nð¡ REALITY:\nTime constraints are one of the biggest polyamory challenges. Be realistic about how many relationships you can maintain.',
            type: 'warning'
          },
          {
            heading: 'Communication in Polyamory',
            content: 'Polyamory requires exceptional communication:\n\nð£ï¸ WHAT TO COMMUNICATE:\nâ¢ Scheduling and availability\nâ¢ Feelings and insecurities\nâ¢ Boundaries and needs\nâ¢ Safer sex practices\nâ¢ Relationship changes\nâ¢ NRE (New Relationship Energy) awareness\nâ¢ Conflicts or concerns\nâ¢ Appreciation and affirmations\n\nð± HOW TO COMMUNICATE:\nâ¢ Regular check-ins with each partner\nâ¢ Scheduled relationship talks\nâ¢ Immediate communication for urgent issues\nâ¢ Proactive, not just reactive\nâ¢ Clear, specific language\nâ¢ Active listening\nâ¢ Written communication for complex topics\nâ¢ Group chats for relevant info\n\nâ° WHEN TO COMMUNICATE:\nâ¢ Before problems escalate\nâ¢ Regularly, not just during crises\nâ¢ When agreements need updating\nâ¢ When feelings change\nâ¢ Before making relationship decisions\n\nCommunication is the backbone of polyamory.',
            type: 'key-point'
          },
          {
            heading: 'New Relationship Energy (NRE)',
            content: 'â¨ NRE: The exciting, all-consuming feeling at the start of a new relationship.\n\nð¢ CHARACTERISTICS:\nâ¢ Intense focus on new partner\nâ¢ Overlooking flaws\nâ¢ Constant thoughts about them\nâ¢ Dopamine high\nâ¢ Time distortion\nâ¢ Decreased attention to existing partners\nâ¢ Lasts weeks to months\n\nâ ï¸ NRE CHALLENGES IN POLYAMORY:\nâ¢ Neglecting existing partners\nâ¢ Making rushed decisions\nâ¢ Ignoring red flags\nâ¢ Spending disproportionate time\nâ¢ Breaking agreements\nâ¢ Energy crash when NRE fades\n\nð¡ï¸ MANAGING NRE:\nâ¢ Acknowledge it exists\nâ¢ Maintain commitments to existing partners\nâ¢ Don\'t make major decisions during NRE\nâ¢ Check in with yourself and partners\nâ¢ Schedule dates with existing partners first\nâ¢ Remember: NRE is temporary\nâ¢ Be honest about your state\n\nNRE is normal but requires conscious management.',
            type: 'warning'
          },
          {
            heading: 'Jealousy in Polyamory',
            content: 'ð TRUTH: Polyamorous people still feel jealous.\n\nð¯ COMMON JEALOUSY TRIGGERS:\nâ¢ Time scarcity\nâ¢ Comparison\nâ¢ Fear of replacement\nâ¢ Unmet needs\nâ¢ Insecurity\nâ¢ Lack of communication\nâ¢ Broken agreements\n\nð PROCESSING JEALOUSY:\n\n1. FEEL IT:\nDon\'t suppress; acknowledge the emotion\n\n2. INVESTIGATE:\nWhat\'s the root cause?\n\n3. COMMUNICATE:\nShare with partners (without blame)\n\n4. ADDRESS NEEDS:\nWhat do you need to feel secure?\n\n5. SELF-SOOTHE:\nUse coping strategies\n\n6. REASSESS:\nDo boundaries need adjustment?\n\nð¡ REMEMBER:\nJealousy is information, not a failure. It tells you what you need.',
            type: 'normal'
          },
          {
            heading: 'Agreements vs Rules',
            content: 'âï¸ THE DISTINCTION:\n\nð RULES:\nâ¢ Imposed restrictions\nâ¢ "You can\'t..."\nâ¢ Control-based\nâ¢ Often fear-driven\nâ¢ Can breed resentment\nâ¢ Example: "You can\'t see them alone"\n\nð¤ AGREEMENTS:\nâ¢ Mutually negotiated\nâ¢ "We agree to..."\nâ¢ Consent-based\nâ¢ Needs-focused\nâ¢ Collaborative\nâ¢ Example: "We\'ll check in before overnight dates"\n\nâ HEALTHY AGREEMENTS:\nâ¢ Made together\nâ¢ Based on needs, not fear\nâ¢ Revisable as relationships evolve\nâ¢ Respectful of everyone\nâ¢ Specific and clear\nâ¢ Actually followed\n\nð AGREEMENTS EVOLVE:\nRegularly review and update as you grow.',
            type: 'key-point'
          },
          {
            heading: 'Safer Sex in Polyamory',
            content: 'ð THE CHALLENGE:\nMore partners = more potential exposure.\n\nâ SAFER SEX STRATEGIES:\n\nâ¢ FLUID BONDING DECISIONS:\nWho do you have unprotected sex with?\n\nâ¢ BARRIER USE:\nCondoms/dental dams with some/all partners\n\nâ¢ TESTING SCHEDULES:\nRegular STI testing for all partners\n\nâ¢ DISCLOSURE:\nShare testing status and safer sex practices\n\nâ¢ INFORMED CONSENT:\nEveryone knows the risk network\n\nâ¢ AGREEMENTS:\nClear protocols for all partners\n\nð RISK NETWORK:\nYou\'re in a sexual health network with:\nâ¢ Your partners\nâ¢ Your partners\' partners\nâ¢ Their partners\' partners\n\nEveryone\'s practices affect everyone. Radical honesty is essential.',
            type: 'warning'
          },
          {
            heading: 'Coming Out as Polyamorous',
            content: 'ð£ï¸ THE DECISION:\nComing out is personal and has real consequences.\n\nâï¸ CONSIDERATIONS:\nâ¢ Professional risks\nâ¢ Family reactions\nâ¢ Custody concerns\nâ¢ Housing/living situation\nâ¢ Social circles\nâ¢ Geographic location\nâ¢ Personal safety\n\nâ IF YOU CHOOSE TO COME OUT:\nâ¢ Start with supportive people\nâ¢ Educate them about polyamory\nâ¢ Set boundaries about questions\nâ¢ Don\'t justify or defend excessively\nâ¢ Connect them with resources\nâ¢ Be patient with adjustment\nâ¢ Stay firm in your identity\n\nð IF YOU STAY CLOSETED:\nâ¢ That\'s valid and sometimes necessary\nâ¢ Maintain privacy carefully\nâ¢ Find poly-friendly spaces\nâ¢ Connect with poly community\nâ¢ Don\'t feel guilty\n\nYour safety and well-being come first.',
            type: 'normal'
          },
          {
            heading: 'Common Polyamory Challenges',
            content: 'â ï¸ TYPICAL STRUGGLES:\n\nâ¢ TIME MANAGEMENT:\nNever enough hours\n\nâ¢ JEALOUSY/INSECURITY:\nStill human, still feel it\n\nâ¢ COMMUNICATION OVERLOAD:\nConstant processing\n\nâ¢ SOCIAL STIGMA:\nJudgment from others\n\nâ¢ DIFFERENT POLY STYLES:\nPartners want different structures\n\nâ¢ UNEQUAL INTEREST:\nOne partner has more/easier connections\n\nâ¢ PARTNER CONFLICT:\nMetamour drama\n\nâ¢ LEGAL/FINANCIAL COMPLEXITY:\nNo legal recognition of multiple partners\n\nâ¢ BURNOUT:\nEmotional labor of multiple relationships\n\nðª ADDRESSING CHALLENGES:\nâ¢ Professional therapy\nâ¢ Poly-friendly community support\nâ¢ Regular relationship check-ins\nâ¢ Self-care and boundaries\nâ¢ Honest communication\nâ¢ Flexibility and growth\n\nChallenges are normal; they don\'t mean you\'re doing it wrong.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Polyamory is multiple consensual loving relationships\nâ Different from swinging in focus on emotional connections\nâ Multiple valid poly structures exist (hierarchical, non-hierarchical, etc.)\nâ Metamours are your partner\'s partners\nâ Compersion is finding joy in your partner\'s joy with others\nâ Time management is crucial and challenging\nâ Communication is the foundation of successful polyamory\nâ NRE (New Relationship Energy) requires conscious management\nâ Jealousy still happensâprocess it, don\'t suppress it\nâ Agreements (not rules) guide poly relationships\nâ Safer sex practices are essential with multiple partners\nâ Coming out is personalâprioritize your safety\n\nPolyamory requires work, communication, and emotional maturity, but offers the potential for multiple deep, loving connections.',
            type: 'key-point'
          }
        ]
      },
      'mod-14': {
        estimatedTime: '25 minutes',
        sections: [
          {
            heading: 'Managing Jealousy: A Practical Guide',
            content: 'Jealousy is one of the most challenging emotions in the lifestyle and non-monogamous relationships. Contrary to popular belief, jealousy doesn\'t disappear just because you choose an open relationship structureâbut it can be understood, managed, and even transformed.\n\nThis module provides practical tools for recognizing, processing, and managing jealousy in healthy ways.',
            type: 'normal'
          },
          {
            heading: 'Understanding Jealousy',
            content: 'ð­ WHAT IS JEALOUSY?\nA complex emotion combining fear, insecurity, and possessiveness, usually triggered by perceived threat to a valued relationship.\n\nð§  JEALOUSY IS:\nâ¢ Natural and normal (evolutionary response)\nâ¢ Information about your needs\nâ¢ NOT a moral failing\nâ¢ Manageable with tools\nâ¢ Different in intensity for everyone\nâ¢ Influenced by past experiences\nâ¢ Valid even if "irrational"\n\nâ JEALOUSY IS NOT:\nâ¢ A sign you\'re not "poly enough"\nâ¢ Proof the relationship is doomed\nâ¢ Something to be ashamed of\nâ¢ A reason to give up\n\nð¡ KEY INSIGHT:\nEven people in successful non-monogamous relationships for years still experience jealousy sometimes. The goal isn\'t to eliminate it, but to manage it effectively.',
            type: 'normal'
          },
          {
            heading: 'Jealousy vs Envy',
            content: 'ð¯ THE DIFFERENCE:\n\nð JEALOUSY:\nFear of losing something you have\n"I\'m afraid my partner will prefer them over me"\n\nð ENVY:\nWanting something someone else has\n"I wish I had as many dates as my partner does"\n\nBoth are valid emotions but require different approaches to process.\n\nð WHY IT MATTERS:\nâ¢ Jealousy needs reassurance and connection\nâ¢ Envy needs self-reflection and action\nâ¢ Misidentifying the emotion leads to wrong solutions\n\nAsk yourself: "Am I afraid of losing something, or do I want something I don\'t have?"',
            type: 'key-point'
          },
          {
            heading: 'Common Jealousy Triggers in the Lifestyle',
            content: 'â ï¸ TYPICAL TRIGGERS:\n\nâ° TIME SCARCITY:\n"They\'re spending more time with them than me"\n\nð COMPARISON:\n"They\'re more attractive/fun/interesting than me"\n\nð¥ SEXUAL PERFORMANCE:\n"What if they\'re better in bed?"\n\nð EMOTIONAL CONNECTION:\n"What if they fall in love with someone else?"\n\nð SPECIAL EXPERIENCES:\n"They\'re doing things with them that we haven\'t done"\n\nð« BROKEN AGREEMENTS:\n"They didn\'t follow our rules"\n\nð» NEW RELATIONSHIP ENERGY:\n"They\'re so excited about this new person"\n\nð INSECURITY:\n"What if I\'m not enough?"\n\nð± COMMUNICATION GAPS:\n"I don\'t know what\'s happening"\n\nð­ FEAR OF REPLACEMENT:\n"What if they leave me for someone else?"\n\nRecognizing your specific triggers is the first step to managing them.',
            type: 'warning'
          },
          {
            heading: 'The Jealousy Processing Framework',
            content: 'A step-by-step approach to working through jealousy:\n\n1ï¸â£ PAUSE & BREATHE:\nâ¢ Don\'t react immediately\nâ¢ Take deep breaths\nâ¢ Create space before responding\n\n2ï¸â£ NAME THE FEELING:\n"I\'m feeling jealous right now"\n\n3ï¸â£ INVESTIGATE THE ROOT:\n"What am I actually afraid of?"\n"What need isn\'t being met?"\n"What story am I telling myself?"\n\n4ï¸â£ REALITY CHECK:\n"Is this fear based on evidence or assumption?"\n"What do I actually know?"\n\n5ï¸â£ IDENTIFY THE NEED:\n"What do I need to feel secure?"\n"What would help right now?"\n\n6ï¸â£ COMMUNICATE:\nShare your feelings and needs (without blame)\n\n7ï¸â£ TAKE ACTION:\nAddress the underlying need\n\n8ï¸â£ SELF-SOOTHE:\nUse coping strategies while processing',
            type: 'key-point'
          },
          {
            heading: 'The HALT Check',
            content: 'ð Before assuming jealousy is about your partner, check if you\'re:\n\nH - HUNGRY\nLow blood sugar affects emotions\n\nA - ANGRY\nDisplaced anger can manifest as jealousy\n\nL - LONELY\nUnmet connection needs amplify jealousy\n\nT - TIRED\nFatigue reduces emotional regulation\n\nâ THE FIX:\nâ¢ Eat something nutritious\nâ¢ Address the real source of anger\nâ¢ Schedule quality time with partner\nâ¢ Get adequate rest\n\nOften "jealousy" disappears when basic needs are met. Check HALT first before having a difficult conversation.',
            type: 'tip'
          },
          {
            heading: 'Communicating Jealousy Effectively',
            content: 'ð£ï¸ HOW TO SHARE JEALOUS FEELINGS:\n\nâ BLAME APPROACH:\n"You\'re spending too much time with them!"\n"You care about them more than me!"\n"You\'re making me feel jealous!"\n\nâ OWNERSHIP APPROACH:\n"I\'m feeling jealous about the time you\'re spending with them. I think I need more quality time with you."\n\n"I\'m feeling insecure and comparing myself to your new partner. Can we talk about what makes our relationship special?"\n\n"I\'m noticing jealousy coming up. I need some reassurance about our connection."\n\nð EFFECTIVE COMMUNICATION FORMULA:\n1. NAME the emotion: "I\'m feeling jealous"\n2. IDENTIFY the trigger: "When I see you text them"\n3. EXPRESS the underlying fear: "I worry that I\'m being replaced"\n4. STATE the need: "I need more verbal affirmation of our connection"\n5. REQUEST specific action: "Could we have a weekly date night just us?"',
            type: 'example'
          },
          {
            heading: 'Self-Soothing Strategies',
            content: 'What to do when jealousy hits:\n\nð§ IMMEDIATE COPING:\nâ¢ Deep breathing exercises\nâ¢ Physical movement (walk, exercise)\nâ¢ Journaling your feelings\nâ¢ Call a supportive friend (not to bash partner)\nâ¢ Engage in a distracting activity\nâ¢ Meditation or mindfulness\nâ¢ Self-compassion mantras\nâ¢ Progressive muscle relaxation\n\nð­ COGNITIVE STRATEGIES:\nâ¢ Challenge catastrophic thinking\nâ¢ Remind yourself of your value\nâ¢ Focus on gratitude for what you have\nâ¢ Remember past times you felt jealous that resolved\nâ¢ Distinguish facts from stories\nâ¢ Recognize jealousy as temporary\n\nð¯ LONG-TERM PRACTICES:\nâ¢ Regular therapy\nâ¢ Journaling practice\nâ¢ Meditation routine\nâ¢ Building self-esteem\nâ¢ Cultivating your own life/hobbies\nâ¢ Strengthening friendship network\nâ¢ Physical self-care\nâ¢ Processing past wounds',
            type: 'tip'
          },
          {
            heading: 'Partner Response to Jealousy',
            content: 'If your partner shares jealousy with you:\n\nâ DO:\nâ¢ Listen without defensiveness\nâ¢ Thank them for sharing\nâ¢ Validate their feelings\nâ¢ Ask what they need\nâ¢ Provide reassurance\nâ¢ Follow through on agreements\nâ¢ Check in regularly\nâ¢ Be patient with the process\nâ¢ Show appreciation for them\n\nâ DON\'T:\nâ¢ Dismiss their feelings\nâ¢ Get angry or defensive\nâ¢ Blame them for feeling jealous\nâ¢ Minimize the issue\nâ¢ Make them feel broken\nâ¢ Threaten to end other relationships immediately\nâ¢ Solve without listening first\nâ¢ Make promises you can\'t keep\n\nð¡ REMEMBER:\nYour partner is trusting you with vulnerability. Honor that.',
            type: 'key-point'
          },
          {
            heading: 'Reassurance Strategies',
            content: 'ð WAYS TO PROVIDE REASSURANCE:\n\nð± COMMUNICATION:\nâ¢ Regular check-ins\nâ¢ "Thinking of you" texts\nâ¢ Sharing highlights of your day\nâ¢ Verbal affirmations\nâ¢ "I love you" messages\n\nâ° TIME:\nâ¢ Protected date nights\nâ¢ Quality over quantity\nâ¢ Undivided attention\nâ¢ Special rituals or traditions\nâ¢ Making plans together\n\nð PHYSICAL:\nâ¢ Affection and touch\nâ¢ Sexual connection\nâ¢ Holding hands\nâ¢ Cuddling\nâ¢ Intimate moments\n\nð ACTIONS:\nâ¢ Small thoughtful gestures\nâ¢ Following through on commitments\nâ¢ Prioritizing important events\nâ¢ Remembering details\nâ¢ Showing up consistently\n\nð­ WORDS:\nâ¢ "You\'re irreplaceable"\nâ¢ "No one could take your place"\nâ¢ "I choose you every day"\nâ¢ "Our relationship is special because..."\nâ¢ "Here\'s what I love about you..."',
            type: 'example'
          },
          {
            heading: 'When Jealousy Reveals Real Problems',
            content: 'â ï¸ SOMETIMES JEALOUSY IS VALID:\n\nJealousy can signal legitimate concerns:\n\nð© BROKEN AGREEMENTS:\nPartner isn\'t following agreed boundaries\n\nð© NEGLECT:\nActual decrease in time, attention, or intimacy\n\nð© DISHONESTY:\nPartner is lying or withholding information\n\nð© DISRESPECT:\nPartner dismisses your feelings consistently\n\nð© NRE IMBALANCE:\nNew partner consuming all energy\n\nð© INCOMPATIBLE NEEDS:\nYour needs genuinely aren\'t being met\n\nâ WHAT TO DO:\nâ¢ Identify the specific problem\nâ¢ Communicate clearly\nâ¢ Request specific changes\nâ¢ Renegotiate agreements if needed\nâ¢ Consider couples therapy\nâ¢ Assess if needs can be met\nâ¢ Make difficult decisions if necessary\n\nTrust your jealousy as informationâinvestigate what it\'s telling you.',
            type: 'warning'
          },
          {
            heading: 'Compersion: The Jealousy Antidote',
            content: 'ð COMPERSION: Joy in your partner\'s joy.\n\nð± CULTIVATING COMPERSION:\n\n1. PROCESS YOUR JEALOUSY FIRST:\nCan\'t force compersion over unresolved jealousy\n\n2. FOCUS ON ABUNDANCE:\nLove multiplies, doesn\'t divide\n\n3. CELEBRATE THEIR HAPPINESS:\nTheir joy doesn\'t diminish yours\n\n4. REFRAME:\nInstead of "They\'re replacing me" â "They have more love in their life"\n\n5. PRACTICE GRATITUDE:\nAppreciate what you have\n\n6. BUILD YOUR OWN LIFE:\nFulfillment comes from multiple sources\n\n7. START SMALL:\nNotice tiny moments of compersion\n\nð¡ IMPORTANT:\nCompersion isn\'t required for successful non-monogamy. It\'s a bonus, not a necessity. Don\'t feel guilty if it doesn\'t come naturally.',
            type: 'normal'
          },
          {
            heading: 'Jealousy in Different Contexts',
            content: 'ð¯ CONTEXT MATTERS:\n\nð« NEW TO LIFESTYLE:\nâ¢ Jealousy often intense initially\nâ¢ Learning what triggers you\nâ¢ Testing boundaries\nâ¢ Building trust through experiences\nâ¢ Normal and expected\n\nð EXPERIENCED BUT NEW RELATIONSHIP:\nâ¢ Jealousy can resurface\nâ¢ Different partners trigger different things\nâ¢ Past experiences inform current feelings\nâ¢ New dynamics require adjustment\n\nâï¸ UNEQUAL OPPORTUNITY:\nâ¢ One partner has more connections\nâ¢ Creates envy and inadequacy\nâ¢ Requires honest communication\nâ¢ May need to address underlying issues\n\nð¥ GROUP DYNAMICS:\nâ¢ Jealousy among metamours\nâ¢ Complex comparison traps\nâ¢ Requires strong communication all around\n\nAdjust your strategies based on your specific context.',
            type: 'example'
          },
          {
            heading: 'When to Seek Professional Help',
            content: 'ð CONSIDER THERAPY IF:\n\nâ¢ Jealousy is overwhelming and constant\nâ¢ You can\'t function normally\nâ¢ It\'s destroying your relationships\nâ¢ Self-help strategies aren\'t working\nâ¢ Past trauma is being triggered\nâ¢ You\'re having intrusive thoughts\nâ¢ Physical symptoms (can\'t eat/sleep)\nâ¢ Self-harm or extreme reactions\nâ¢ Relationship is in crisis\n\nð¼ FIND:\nâ¢ Poly/CNM-friendly therapist\nâ¢ Someone who won\'t try to "fix" your relationship structure\nâ¢ Specialist in attachment or relationship issues\nâ¢ Both individual and couples therapy options\n\nð RESOURCES:\nâ¢ AASECT (American Association of Sexuality Educators)\nâ¢ Psychology Today therapist finder\nâ¢ Poly-friendly therapy directories\nâ¢ Sliding scale options\n\nProfessional support is strength, not weakness.',
            type: 'warning'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Jealousy is normal, natural, and doesn\'t mean you\'re doing it wrong\nâ Distinguish between jealousy (fear of loss) and envy (wanting what others have)\nâ Common triggers include time scarcity, comparison, NRE, and insecurity\nâ Use the processing framework: pause, name, investigate, communicate, act\nâ Check HALT (Hungry, Angry, Lonely, Tired) before assuming relationship issue\nâ Communicate jealousy with ownership, not blame\nâ Self-soothing strategies help manage immediate intensity\nâ Partners should respond with validation and reassurance, not defensiveness\nâ Sometimes jealousy reveals real problems that need addressing\nâ Compersion is lovely but not required\nâ Seek professional help if jealousy is overwhelming\n\nJealousy doesn\'t disappear, but it can be understood, managed, and even transformed into opportunities for growth and deeper connection.',
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
            content: 'ð¤ TRUST DEFINED:\nThe firm belief in the reliability, truth, ability, or strength of someone.\n\nð­ IN RELATIONSHIPS, TRUST MEANS:\nâ¢ Believing your partner has your best interests at heart\nâ¢ Confidence they\'ll honor agreements\nâ¢ Security that they\'ll be honest\nâ¢ Faith they\'ll respect your boundaries\nâ¢ Assurance they won\'t intentionally harm you\nâ¢ Belief in their commitment to the relationship\n\nð¯ TRUST IN LIFESTYLE CONTEXTS:\nâ¢ Your partner will follow agreed boundaries\nâ¢ They\'ll communicate important information\nâ¢ They\'ll prioritize your wellbeing\nâ¢ They\'ll be honest about their experiences\nâ¢ They\'ll come back to you emotionally\nâ¢ They\'ll practice safer sex as agreed\nâ¢ They\'ll handle your vulnerability with care',
            type: 'normal'
          },
          {
            heading: 'The Components of Trust',
            content: 'Trust is built on multiple foundations:\n\n1ï¸â£ HONESTY:\nConsistent truthfulness, even when difficult\n\n2ï¸â£ RELIABILITY:\nFollowing through on commitments and promises\n\n3ï¸â£ CONSISTENCY:\nPredictable behavior over time\n\n4ï¸â£ TRANSPARENCY:\nOpenness about thoughts, feelings, and actions\n\n5ï¸â£ COMPETENCE:\nAbility to handle the lifestyle responsibly\n\n6ï¸â£ CARE:\nDemonstrated concern for your wellbeing\n\n7ï¸â£ RESPECT:\nHonoring boundaries and feelings\n\n8ï¸â£ ACCOUNTABILITY:\nTaking responsibility for mistakes\n\nAll components must be present for solid trust.',
            type: 'key-point'
          },
          {
            heading: 'How Trust Is Built',
            content: 'ðï¸ TRUST IS BUILT THROUGH:\n\nâ° TIME:\nâ¢ Consistent behavior over extended periods\nâ¢ Proving reliability repeatedly\nâ¢ No shortcutsâtrust takes time\n\nâ SMALL ACTIONS:\nâ¢ Keeping small promises\nâ¢ Following through on minor commitments\nâ¢ Being on time\nâ¢ Responding when you say you will\nâ¢ Each small action builds or erodes trust\n\nð¬ COMMUNICATION:\nâ¢ Sharing honestly, even when hard\nâ¢ Discussing difficult topics\nâ¢ Keeping partner informed\nâ¢ Being vulnerable\n\nð¯ BOUNDARY RESPECT:\nâ¢ Honoring stated limits consistently\nâ¢ Not testing or pushing boundaries\nâ¢ Asking when unsure\nâ¢ Respecting "no" immediately\n\nð TRANSPARENCY:\nâ¢ Sharing relevant information\nâ¢ No secrets or hidden activities\nâ¢ Open phone/email policies (if agreed)\nâ¢ Honesty about feelings and experiences\n\nð¡ KEY INSIGHT:\nTrust is built slowly through countless small actions but can be destroyed quickly through one major breach.',
            type: 'example'
          },
          {
            heading: 'Trust-Building Practices for Couples',
            content: 'ð STRENGTHEN TRUST IN YOUR PRIMARY RELATIONSHIP:\n\nð REGULAR CHECK-INS:\nâ¢ Weekly relationship talks\nâ¢ Discuss how lifestyle activities are affecting you\nâ¢ Address concerns before they grow\nâ¢ Celebrate what\'s working\n\nð¤ KEEP AGREEMENTS:\nâ¢ Follow your established boundaries\nâ¢ Renegotiate if boundaries need changing\nâ¢ Don\'t unilaterally change rules\nâ¢ Honor your word consistently\n\nð PRIORITIZE PRIMARY RELATIONSHIP:\nâ¢ Protected time together\nâ¢ Special rituals or traditions\nâ¢ Choose your partner in big moments\nâ¢ Maintain intimacy and connection\n\nð± APPROPRIATE TRANSPARENCY:\nâ¢ Share relevant information about lifestyle activities\nâ¢ Don\'t hide connections or experiences\nâ¢ Balance transparency with metamour privacy\nâ¢ Be honest about feelings\n\nð¯ SHOW UP:\nâ¢ Be present for important events\nâ¢ Support through difficult times\nâ¢ Celebrate successes\nâ¢ Consistent emotional availability',
            type: 'tip'
          },
          {
            heading: 'Trust with New Connections',
            content: 'ð BUILDING TRUST WITH LIFESTYLE PARTNERS:\n\nð¢ START SLOW:\nâ¢ Don\'t rush into deep trust\nâ¢ Let it develop naturally\nâ¢ Multiple interactions over time\nâ¢ Public meetings first\n\nð¯ OBSERVE CONSISTENCY:\nâ¢ Do their words match actions?\nâ¢ Are they reliable?\nâ¢ Do they follow through?\nâ¢ How do they handle boundaries?\n\nð¬ CLEAR COMMUNICATION:\nâ¢ Discuss expectations explicitly\nâ¢ Share boundaries clearly\nâ¢ Ask about their agreements with their partner(s)\nâ¢ Verify stories and information\n\nð© WATCH FOR RED FLAGS:\nâ¢ Dishonesty about relationship status\nâ¢ Pressuring boundaries\nâ¢ Inconsistent information\nâ¢ Disrespecting your relationship\nâ¢ Drama with previous partners\n\nâ VERIFY:\nâ¢ Video chat before meeting\nâ¢ Talk to their partner if possible\nâ¢ Check their standing in community\nâ¢ Trust but verify information',
            type: 'example'
          },
          {
            heading: 'Common Trust Violations in the Lifestyle',
            content: 'â ï¸ BEHAVIORS THAT BREAK TRUST:\n\nð« BOUNDARY VIOLATIONS:\nâ¢ Doing activities that were agreed off-limits\nâ¢ Pushing beyond stated boundaries\nâ¢ "Forgetting" important agreements\n\nð« DISHONESTY:\nâ¢ Lying about activities or connections\nâ¢ Hiding relationships\nâ¢ Misrepresenting your relationship status\nâ¢ Omitting important information\n\nð« SAFER SEX BREACHES:\nâ¢ Not using agreed protection\nâ¢ Hiding STI exposure\nâ¢ Removing condoms without consent (stealthing)\n\nð« EMOTIONAL BETRAYAL:\nâ¢ Sharing intimate details without permission\nâ¢ Comparing partners negatively\nâ¢ Prioritizing new partners over agreements\nâ¢ Emotional affairs without transparency\n\nð« BROKEN COMMITMENTS:\nâ¢ Canceling plans repeatedly\nâ¢ Not following through on promises\nâ¢ Prioritizing lifestyle over primary relationship\n\nð« PRIVACY VIOLATIONS:\nâ¢ Sharing private information\nâ¢ Posting photos without consent\nâ¢ Discussing your relationship publicly\n\nEven small violations erode trust over time.',
            type: 'warning'
          },
          {
            heading: 'When Trust Is Broken',
            content: 'ð IF TRUST IS VIOLATED:\n\n1ï¸â£ IMMEDIATE RESPONSE:\nâ¢ Stop lifestyle activities if needed\nâ¢ Create space to process\nâ¢ Seek support (friends, therapist)\nâ¢ Don\'t make permanent decisions in crisis\n\n2ï¸â£ ASSESS THE DAMAGE:\nâ¢ How serious was the violation?\nâ¢ Was it intentional or accidental?\nâ¢ Is this a pattern or isolated incident?\nâ¢ Does the person take responsibility?\nâ¢ Are you safe (physically, emotionally, sexually)?\n\n3ï¸â£ COMMUNICATION:\nâ¢ Express how the violation affected you\nâ¢ Listen to their explanation (not excuse)\nâ¢ Discuss what needs to happen for repair\nâ¢ Set clear expectations going forward\n\n4ï¸â£ DECIDE ON PATH FORWARD:\nâ¢ Can trust be rebuilt?\nâ¢ What needs to change?\nâ¢ What accountability is required?\nâ¢ Is professional help needed?\nâ¢ Is the relationship salvageable?',
            type: 'key-point'
          },
          {
            heading: 'Rebuilding Trust After a Breach',
            content: 'ð¨ TRUST REPAIR REQUIRES:\n\nð¤ FROM THE VIOLATOR:\nâ¢ FULL ACCOUNTABILITY: Own the violation completely\nâ¢ GENUINE REMORSE: Show true understanding of harm caused\nâ¢ NO EXCUSES: Don\'t minimize or blame others\nâ¢ TRANSPARENCY: Answer all questions honestly\nâ¢ CHANGED BEHAVIOR: Demonstrate concrete changes\nâ¢ PATIENCE: Accept it takes time\nâ¢ CONSISTENCY: Prove reliability over time\nâ¢ AMENDS: Take actions to repair harm\n\nð¤ FROM THE HURT PARTNER:\nâ¢ WILLINGNESS: Choose to work toward rebuilding\nâ¢ COMMUNICATION: Express needs and feelings\nâ¢ BOUNDARIES: Set clear expectations\nâ¢ PATIENCE: Allow time for healing\nâ¢ VERIFICATION: It\'s okay to need proof\nâ¢ SELF-CARE: Process your feelings\nâ¢ PROFESSIONAL HELP: Therapy can guide the process\nâ¢ DECISION POWER: You decide if/when trust is rebuilt\n\nâ° TIMELINE:\nâ¢ Trust rebuilds slowly\nâ¢ Often takes longer to rebuild than initial building\nâ¢ Months to years, not days or weeks\nâ¢ Requires consistent positive actions\nâ¢ Some trust may never fully return',
            type: 'example'
          },
          {
            heading: 'Trust and Vulnerability',
            content: 'ð­ THE RELATIONSHIP:\nTrust enables vulnerability; vulnerability deepens trust.\n\nð¯ VULNERABILITY IN LIFESTYLE:\nâ¢ Sharing jealous feelings\nâ¢ Admitting insecurities\nâ¢ Expressing needs\nâ¢ Discussing fears\nâ¢ Acknowledging mistakes\nâ¢ Asking for reassurance\nâ¢ Being honest about struggles\n\nâ WHEN YOU\'RE VULNERABLE:\nYour partner\'s response either strengthens or weakens trust.\n\nð TRUST-BUILDING RESPONSES:\nâ¢ Listening without judgment\nâ¢ Validating feelings\nâ¢ Providing reassurance\nâ¢ Taking concerns seriously\nâ¢ Following through on solutions\nâ¢ Showing appreciation for honesty\n\nð TRUST-BREAKING RESPONSES:\nâ¢ Dismissing feelings\nâ¢ Mocking vulnerability\nâ¢ Using shared information against you\nâ¢ Becoming defensive or angry\nâ¢ Minimizing concerns\nâ¢ Breaking confidence\n\nHow you handle vulnerability determines relationship depth.',
            type: 'normal'
          },
          {
            heading: 'Self-Trust in the Lifestyle',
            content: 'ðª TRUSTING YOURSELF:\n\nBefore you can fully trust others, trust yourself:\n\nâ TRUST YOUR INSTINCTS:\nâ¢ Listen to your gut feelings\nâ¢ Honor discomfort\nâ¢ Recognize red flags\nâ¢ Trust your "no"\n\nâ TRUST YOUR BOUNDARIES:\nâ¢ Know your limits\nâ¢ Enforce them consistently\nâ¢ Don\'t compromise for approval\nâ¢ Adjust as you learn\n\nâ TRUST YOUR RESILIENCE:\nâ¢ You can handle difficult emotions\nâ¢ You\'ll survive if things go wrong\nâ¢ You have the strength to leave if needed\nâ¢ You can rebuild after setbacks\n\nâ TRUST YOUR JUDGMENT:\nâ¢ You can assess character\nâ¢ You can make good decisions\nâ¢ You learn from mistakes\nâ¢ You know what\'s right for you\n\nSelf-trust is the foundation for trusting others.',
            type: 'key-point'
          },
          {
            heading: 'Trust and Control',
            content: 'âï¸ THE PARADOX:\nTrust requires letting go of control.\n\nð« CONTROL BEHAVIORS (BREAK TRUST):\nâ¢ Tracking partner\'s location constantly\nâ¢ Reading all messages\nâ¢ Forbidding certain connections\nâ¢ Demanding constant updates\nâ¢ Making unilateral rules\nâ¢ Threatening to leave if they do X\n\nâ TRUST BEHAVIORS:\nâ¢ Allowing autonomy\nâ¢ Believing they\'ll follow agreements\nâ¢ Accepting you can\'t control outcomes\nâ¢ Focusing on communication, not surveillance\nâ¢ Setting boundaries, not restrictions\nâ¢ Choosing trust despite risk\n\nð­ THE SHIFT:\nFrom "How can I control them?" to "Can I trust them to make good choices?"\n\nIf the answer is no, address the trust issueânot with more control, but with honest conversation.',
            type: 'warning'
          },
          {
            heading: 'Signs of Healthy Trust',
            content: 'â YOU HAVE HEALTHY TRUST WHEN:\n\nð PEACE:\nâ¢ You feel secure in the relationship\nâ¢ Minimal anxiety when apart\nâ¢ Confidence in their commitment\nâ¢ Calm about lifestyle activities\n\nð OPENNESS:\nâ¢ Comfortable sharing feelings\nâ¢ Honest about struggles\nâ¢ Transparent about activities\nâ¢ Open communication flows naturally\n\nð AUTONOMY:\nâ¢ Both partners have independence\nâ¢ No need for constant checking in\nâ¢ Trust in each other\'s judgment\nâ¢ Freedom without anxiety\n\nð RESILIENCE:\nâ¢ Conflicts don\'t destroy trust\nâ¢ You work through issues together\nâ¢ Trust strengthens over time\nâ¢ Recovery from setbacks\n\nð CONSISTENCY:\nâ¢ Reliable behavior over time\nâ¢ Kept promises and commitments\nâ¢ Aligned words and actions\nâ¢ Predictable integrity\n\nHealthy trust feels secure but not suffocating, open but not anxious.',
            type: 'key-point'
          },
          {
            heading: 'When Trust Can\'t Be Rebuilt',
            content: 'ð SOMETIMES TRUST IS IRREPARABLE:\n\nâ ï¸ SIGNS TO END THE RELATIONSHIP:\nâ¢ Repeated violations despite promises\nâ¢ No genuine remorse or accountability\nâ¢ Patterns of lying continue\nâ¢ You don\'t feel safe\nâ¢ Your mental health is suffering\nâ¢ They blame you for their violations\nâ¢ Changes are superficial, not real\nâ¢ You\'ve lost respect for them\nâ¢ The relationship causes more pain than joy\nâ¢ Your gut says it\'s over\n\nâ IT\'S OKAY TO:\nâ¢ Decide trust can\'t be rebuilt\nâ¢ End the relationship\nâ¢ Protect yourself\nâ¢ Choose your wellbeing\nâ¢ Walk away from someone who repeatedly breaks trust\n\nðª MOVING FORWARD:\nâ¢ Process the grief\nâ¢ Learn from the experience\nâ¢ Don\'t let it destroy your ability to trust others\nâ¢ Seek support\nâ¢ Take time to heal\nâ¢ Trust yourself to choose better next time',
            type: 'normal'
          },
          {
            heading: 'Module Summary: Key Takeaways',
            content: 'â Trust is the foundation of all successful lifestyle relationships\nâ Trust is built through time, consistency, honesty, and kept promises\nâ Small actions build or erode trust daily\nâ Trust in your primary relationship must be solid before opening up\nâ Build trust slowly with new connectionsâverify, don\'t just trust\nâ Common violations include boundary breaches, dishonesty, and broken agreements\nâ Trust can be rebuilt after violations, but requires work from both partners\nâ Rebuilding trust takes time and consistent positive actions\nâ Vulnerability deepens trust when met with supportive responses\nâ Trust yourself and your instincts\nâ Control behaviors break trust; autonomy within boundaries builds it\nâ Sometimes trust can\'t be repairedâit\'s okay to end the relationship\n\nTrust is earned slowly, lost quickly, and rebuilt even slower. Protect it like the precious resource it is.',
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
              <span>ð {content.estimatedTime}</span>
              <span>â¢</span>
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
