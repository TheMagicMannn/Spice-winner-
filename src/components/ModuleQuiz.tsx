import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ModuleQuizProps {
  moduleId: string;
  title: string;
  onClose: () => void;
  onPass: () => void;
}

export const ModuleQuiz: React.FC<ModuleQuizProps> = ({ 
  moduleId, 
  title, 
  onClose, 
  onPass 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const getQuizQuestions = (id: string): QuizQuestion[] => {
    const quizzes: Record<string, QuizQuestion[]> = {
      'mod-1': [
        {
          question: 'What is the most important aspect of effective communication in the lifestyle?',
          options: [
            'Speaking loudly and confidently',
            'Being clear, honest, and respectful',
            'Always agreeing with others',
            'Avoiding difficult topics'
          ],
          correctAnswer: 1,
          explanation: 'Effective communication requires clarity, honesty, and respect. This ensures all parties understand each other and feel valued.'
        },
        {
          question: 'Which of the following is an example of active listening?',
          options: [
            'Interrupting to share your own experiences',
            'Planning what you\'ll say next while someone is talking',
            'Giving full attention and asking clarifying questions',
            'Checking your phone during conversation'
          ],
          correctAnswer: 2,
          explanation: 'Active listening means giving your full attention and engaging thoughtfully with what the other person is saying.'
        },
        {
          question: 'Why is follow-through important in communication?',
          options: [
            'It makes you look good',
            'It builds trust and reliability',
            'It\'s required by community rules',
            'It doesn\'t really matter'
          ],
          correctAnswer: 1,
          explanation: 'Following through on your words builds trust and shows that you are reliable and respect others.'
        }
      ],
      'mod-2': [
        {
          question: 'What should you do if someone shares a boundary with you?',
          options: [
            'Try to convince them to change it',
            'Accept it without judgment',
            'Ignore it if it\'s inconvenient',
            'Ask them to explain why they have it'
          ],
          correctAnswer: 1,
          explanation: 'Boundaries should always be respected without question or judgment. They don\'t require explanation.'
        },
        {
          question: 'Can boundaries change over time?',
          options: [
            'No, once set they are permanent',
            'Yes, boundaries can evolve as comfort levels change',
            'Only if both people agree',
            'Boundaries never need to change'
          ],
          correctAnswer: 1,
          explanation: 'Boundaries are personal and can change as you grow and your comfort level evolves. This is completely normal and healthy.'
        },
        {
          question: 'Which is the best way to communicate a boundary?',
          options: [
            'Hint at it and hope they understand',
            'Wait until it\'s crossed then get upset',
            'State it clearly using "I" statements',
            'Let someone else tell them for you'
          ],
          correctAnswer: 2,
          explanation: 'Clear, direct communication using "I" statements is the most effective way to express your boundaries.'
        }
      ],
      'mod-3': [
        {
          question: 'What does the "R" in the FRIES model of consent stand for?',
          options: [
            'Required',
            'Reversible',
            'Respectful',
            'Responsible'
          ],
          correctAnswer: 1,
          explanation: 'Reversible means that consent can be withdrawn at any time, and anyone can change their mind.'
        },
        {
          question: 'When should negotiation happen?',
          options: [
            'During the activity',
            'After everything is done',
            'Before any interaction begins',
            'Only if problems arise'
          ],
          correctAnswer: 2,
          explanation: 'Negotiation should happen before any interaction to ensure all parties are clear on expectations and boundaries.'
        },
        {
          question: 'What does enthusiastic consent mean?',
          options: [
            'Shouting "yes" loudly',
            'Clear, positive agreement without hesitation',
            'Just not saying "no"',
            'Going along because someone else wants to'
          ],
          correctAnswer: 1,
          explanation: 'Enthusiastic consent is clear and positiveâit should be an active "yes," not just the absence of a "no."'
        }
      ],
      'mod-4': [
        {
          question: 'What is the best approach when having a difficult conversation?',
          options: [
            'Have it immediately when emotions are high',
            'Send a text message to avoid confrontation',
            'Choose a private setting when both parties are calm',
            'Bring it up at a party so others can mediate'
          ],
          correctAnswer: 2,
          explanation: 'Difficult conversations should happen in private, calm settings when both parties are composed and have time to discuss the issue properly.'
        },
        {
          question: 'What is the "I" statement formula for addressing issues?',
          options: [
            '"You always do this and it makes me angry"',
            '"When [behavior], I felt [emotion], because [reason]. I need [request]"',
            '"Everyone thinks you shouldn\'t do that"',
            '"This is wrong and you need to stop"'
          ],
          correctAnswer: 1,
          explanation: 'The "I" statement formula focuses on your experience without being accusatory, making it more effective for resolving issues.'
        },
        {
          question: 'How should you decline an unwanted invitation in the lifestyle?',
          options: [
            'Ghost them and hope they get the hint',
            'Make up vague excuses like "we\'re busy"',
            'Be clear, kind, and final in your response',
            'Say yes but then cancel repeatedly'
          ],
          correctAnswer: 2,
          explanation: 'Being clear, kind, and final prevents false hope and shows respect for everyone\'s time. Honesty is always the best approach.'
        }
      ],
      'mod-5': [
        {
          question: 'What percentage of the time should you aim to listen in initial conversations?',
          options: [
            '50% - equal talking and listening',
            '80% - listen more than you talk',
            '20% - talk more to make an impression',
            '100% - never talk, only listen'
          ],
          correctAnswer: 1,
          explanation: 'The 80/20 rule suggests listening 80% of the time in initial conversations. This helps you understand the other person and builds rapport.'
        },
        {
          question: 'What is paraphrasing and why is it important?',
          options: [
            'Repeating exactly what they said word-for-word',
            'Changing the subject to something more interesting',
            'Reflecting back what you heard in your own words to confirm understanding',
            'Interrupting to share your own similar story'
          ],
          correctAnswer: 2,
          explanation: 'Paraphrasing confirms you understood correctly, shows you\'re truly listening, and gives them a chance to clarify if needed.'
        },
        {
          question: 'Which is a common listening mistake to avoid?',
          options: [
            'Making eye contact with the speaker',
            'Asking clarifying questions',
            'Interrupting to share your own story',
            'Nodding to show engagement'
          ],
          correctAnswer: 2,
          explanation: 'Interrupting to share your own story (one-upping) is a common mistake that shows you\'re focused on yourself rather than truly listening to them.'
        }
      ],
      'mod-6': [
        {
          question: 'What are the three layers of communication mastery?',
          options: [
            'Speaking, Writing, and Texting',
            'Content (what you say), Emotion (how you say it), and Intention (why you say it)',
            'Talking, Listening, and Silence',
            'Verbal, Non-verbal, and Digital'
          ],
          correctAnswer: 1,
          explanation: 'The three-layer model includes Content, Emotion, and Intention. Mastery means aligning all three layers for authentic communication.'
        },
        {
          question: 'How should you handle rejection gracefully?',
          options: [
            'Ask "why not?" to understand their reasoning',
            'Thank them for their time and wish them well',
            'Try to convince them to change their mind',
            'Make negative comments about them to others'
          ],
          correctAnswer: 1,
          explanation: 'Graceful rejection handling means thanking them and moving on without arguing or getting upset. How you handle rejection demonstrates maturity.'
        },
        {
          question: 'In ongoing play relationships, what should regular check-ins include?',
          options: [
            'Only discussing what went wrong',
            'Just scheduling the next meeting',
            'Recent positives, areas for improvement, boundary updates, and desires exploration',
            'Avoiding difficult topics to keep things fun'
          ],
          correctAnswer: 2,
          explanation: 'Comprehensive check-ins cover positives, improvements, boundary updates, desires, relationship health, and scheduling to maintain healthy connections.'
        }
      ],
      // Safety & Privacy Path Quizzes
      'mod-7': [
        {
          question: 'What is the most important reason to create a separate email address for lifestyle activities?',
          options: [
            'It looks more professional',
            'To keep your lifestyle and vanilla identities separate for privacy',
            'Because lifestyle sites require it',
            'To get more spam filtered'
          ],
          correctAnswer: 1,
          explanation: 'Creating separate identities for lifestyle activities protects your privacy and prevents your lifestyle involvement from being connected to your professional or personal life.'
        },
        {
          question: 'What should you assume about anything you send digitally?',
          options: [
            'It will be kept completely private',
            'Only the recipient will see it',
            'It could be captured, screenshot, and shared',
            'It will automatically delete after viewing'
          ],
          correctAnswer: 2,
          explanation: 'Always assume anything you send digitally can be captured and shared. This mindset helps you make thoughtful decisions about what to share and with whom.'
        },
        {
          question: 'Why is reverse image search important for lifestyle privacy?',
          options: [
            'To find better photos',
            'To check if your photos appear on other platforms, risking identity exposure',
            'To verify other people\'s photos',
            'To improve photo quality'
          ],
          correctAnswer: 1,
          explanation: 'Reverse image search can reveal if your lifestyle photos appear on your vanilla social media or other platforms, which could expose your lifestyle involvement. Never use the same photos across both worlds.'
        }
      ],
      'mod-8': [
        {
          question: 'What is the most critical rule for first meetings in the lifestyle?',
          options: [
            'Dress to impress',
            'Always meet in a public, busy location',
            'Bring gifts for the other couple',
            'Meet at night for the best atmosphere'
          ],
          correctAnswer: 1,
          explanation: 'Always meet new connections in public, busy locations for first meetings. This provides safety, easy exits, and the ability to assess compatibility in a neutral environment.'
        },
        {
          question: 'What should you do before every first meeting?',
          options: [
            'Book a hotel room',
            'Buy new clothes',
            'Tell someone where you\'re going and schedule check-ins',
            'Delete your profile after matching'
          ],
          correctAnswer: 2,
          explanation: 'Always tell a trusted person where you\'re meeting, who you\'re meeting, and establish check-in times. This safety plan is essential for every first meeting.'
        },
        {
          question: 'When is it appropriate to progress to private meetings?',
          options: [
            'Immediately if you feel attracted',
            'After one public meeting',
            'Only after multiple public meetings and established trust',
            'Whenever they suggest it'
          ],
          correctAnswer: 2,
          explanation: 'Progress to private settings only after multiple public meetings, video chats, verification, and establishing genuine trust. Never rush this progression.'
        }
      ],
      'mod-9': [
        {
          question: 'What is the most important thing to do when you see red flags?',
          options: [
            'Ignore them and give the person a chance',
            'Rationalize them away',
            'Acknowledge them and assess severity',
            'Immediately tell everyone in the community'
          ],
          correctAnswer: 2,
          explanation: 'When you see red flags, acknowledge them rather than ignoring or rationalizing. Assess the severity and take appropriate action based on whether they\'re minor cautions or serious safety concerns.'
        },
        {
          question: 'Which of the following is a serious red flag about someone\'s relationship status?',
          options: [
            'They have a primary partner',
            'They say "My partner doesn\'t need to know"',
            'They prefer separate room play',
            'They\'re in a polyamorous relationship'
          ],
          correctAnswer: 1,
          explanation: '"My partner doesn\'t need to know" or "don\'t ask, don\'t tell" indicates they may be cheating. Never participate in non-consensual activityâit harms the community and puts you at risk.'
        },
        {
          question: 'What should you do when your gut feeling says something is wrong, even if you can\'t explain why?',
          options: [
            'Ignore itâgut feelings aren\'t logical',
            'Trust your intuition and end the interaction',
            'Ask permission to proceed anyway',
            'Wait for concrete proof before acting'
          ],
          correctAnswer: 1,
          explanation: 'Your gut feeling exists for a reasonâyour subconscious picks up on details you might not consciously notice. Trust your intuition even if you can\'t articulate exactly why. You don\'t need a logical reason to end an interaction.'
        }
      ],
      'mod-10': [
        {
          question: 'How often should you get tested for STIs when active in the lifestyle?',
          options: [
            'Once a year',
            'Every 3-6 months, or more frequently with multiple partners',
            'Only when symptoms appear',
            'Testing isn\'t necessary if you use condoms'
          ],
          correctAnswer: 1,
          explanation: 'Regular testing every 3-6 months (or more frequently with multiple partners) is essential for sexual health in the lifestyle. Know your status and share it honestly with partners.'
        },
        {
          question: 'What should happen if a condom breaks during play?',
          options: [
            'Continue and don\'t worry about it',
            'Stop immediately, communicate with all parties, and consider emergency contraception and PEP',
            'Just replace it and keep going',
            'Wait and see if anything develops'
          ],
          correctAnswer: 1,
          explanation: 'If a barrier fails, stop immediately, communicate with everyone involved, assess need for emergency contraception or PEP (for HIV), and plan appropriate testing. Immediate action is crucial.'
        },
        {
          question: 'When someone uses a safe word during play, what should happen?',
          options: [
            'Pause briefly and then continue',
            'Ask them why they used it',
            'Stop immediately without question or negotiation',
            'Finish the current activity then stop'
          ],
          correctAnswer: 2,
          explanation: 'When anyone uses a safe word, everything stops IMMEDIATELY. No questions, no negotiations, no finishing current activities. Check in with the person and only resume if everyone enthusiastically agrees.'
        }
      ],
      'mod-11': [
        {
          question: 'What is the most important principle of community safety standards?',
          options: [
            'Following venue dress codes',
            'Enthusiastic consent for all activities',
            'Being attractive and fit',
            'Attending every event'
          ],
          correctAnswer: 1,
          explanation: 'Consent is the absolute foundation of community safety. Everything in the lifestyle requires enthusiastic, ongoing consent. This is non-negotiable.'
        },
        {
          question: 'What should you do if you see someone at a lifestyle event or venue?',
          options: [
            'Post about it on social media',
            'Tell your vanilla friends who you saw',
            'Protect their privacyâwhat happens in lifestyle spaces stays private',
            'Message them to acknowledge you saw them there'
          ],
          correctAnswer: 2,
          explanation: 'Discretion is paramount. Never share who you saw at lifestyle events or venues, post about others on social media, or "out" people as lifestyle participants. Protecting privacy protects people\'s lives.'
        },
        {
          question: 'What is your role in maintaining community safety?',
          options: [
            'Nothingâit\'s the organizers\' job',
            'Just worry about your own behavior',
            'Be an active bystanderâwatch for violations, support survivors, report concerns',
            'Only intervene if asked'
          ],
          correctAnswer: 2,
          explanation: 'Everyone has responsibility for community safety. Be an active bystander by watching for consent violations, checking on people who seem uncomfortable, intervening when appropriate, reporting concerns, and supporting those who speak up.'
        }
      ],
      // Relationship Dynamics Path Quizzes
      'mod-12': [
        {
          question: 'What is the key difference between swinging and polyamory?',
          options: [
            'Swinging is illegal, polyamory is legal',
            'Swinging focuses on sexual experiences while polyamory focuses on emotional connections',
            'Swinging is for couples only, polyamory is for singles',
            'There is no difference'
          ],
          correctAnswer: 1,
          explanation: 'Swinging typically focuses on recreational sexual experiences with a couple-centric approach, while polyamory centers on building multiple emotional and romantic relationships. Both are valid but serve different needs.'
        },
        {
          question: 'What does "full swap" mean in swinging terminology?',
          options: [
            'Exchanging phone numbers',
            'Swapping houses',
            'All sexual activities including intercourse are on the table (within personal boundaries)',
            'Switching partners permanently'
          ],
          correctAnswer: 2,
          explanation: 'Full swap means all sexual activities, including intercourse, are within the agreed boundaries. This is different from soft swap, which typically excludes intercourse but may include other activities.'
        },
        {
          question: 'Why is it important to clearly communicate your relationship type?',
          options: [
            'To impress other people',
            'Because it\'s required by law',
            'To set appropriate expectations and find compatible connections',
            'To prove you\'re experienced'
          ],
          correctAnswer: 2,
          explanation: 'Clearly communicating your relationship structure (same-room couple, polyamorous, solo poly, etc.) helps set appropriate expectations, respect boundaries, and find compatible connections who want the same things.'
        }
      ],
      'mod-13': [
        {
          question: 'What is compersion in polyamory?',
          options: [
            'A type of jealousy',
            'Finding joy in your partner\'s happiness with others',
            'A required feeling for polyamory',
            'Compensation for sharing your partner'
          ],
          correctAnswer: 1,
          explanation: 'Compersion is feeling joy in your partner\'s joy with other partners. While beautiful, it\'s not required for successful polyamoryâit\'s a bonus that may develop over time, not a prerequisite.'
        },
        {
          question: 'What is a "metamour"?',
          options: [
            'A type of relationship structure',
            'Your partner\'s partner',
            'A romantic feeling',
            'A polyamory dating app'
          ],
          correctAnswer: 1,
          explanation: 'A metamour is your partner\'s partner. If you\'re dating Alex and Alex is dating Sam, then Sam is your metamour. Metamour relationships can range from close friendship to parallel (no interaction).'
        },
        {
          question: 'What is New Relationship Energy (NRE) and why does it matter?',
          options: [
            'Energy drinks for dates; they don\'t matter much',
            'The exciting, intense feeling at the start of relationships that can lead to neglecting existing partners',
            'A poly rule that must be followed',
            'The first month of any relationship'
          ],
          correctAnswer: 1,
          explanation: 'NRE is the intense, all-consuming excitement of new relationships. In polyamory, it requires conscious management to avoid neglecting existing partners, making rushed decisions, or breaking agreements during the dopamine high.'
        }
      ],
      'mod-14': [
        {
          question: 'What is the difference between jealousy and envy?',
          options: [
            'They are the same thing',
            'Jealousy is fear of losing something you have; envy is wanting something someone else has',
            'Jealousy is worse than envy',
            'Envy is fear of losing something; jealousy is wanting what others have'
          ],
          correctAnswer: 1,
          explanation: 'Jealousy is fear of losing something you have (e.g., "I\'m afraid my partner will prefer them"). Envy is wanting something someone else has (e.g., "I wish I had as many dates"). Both are valid but require different processing approaches.'
        },
        {
          question: 'What should you do first when feeling jealous?',
          options: [
            'Immediately confront your partner',
            'Pause, breathe, and investigate the root cause before reacting',
            'Ignore the feelingâjealousy is bad',
            'End the relationship'
          ],
          correctAnswer: 1,
          explanation: 'When jealousy hits, pause and breathe before reacting. Then investigate: What am I actually afraid of? What need isn\'t being met? This prevents reactive behavior and helps you address the real issue.'
        },
        {
          question: 'How should a partner respond when you share jealous feelings?',
          options: [
            'Tell you you\'re being irrational',
            'Immediately end other relationships',
            'Listen without defensiveness, validate feelings, and ask what you need',
            'Ignore the feelings and hope they go away'
          ],
          correctAnswer: 2,
          explanation: 'When a partner shares jealousy, listen without defensiveness, validate their feelings, thank them for sharing, and ask what they need. Defensiveness or dismissal breaks trust and makes the situation worse.'
        }
      ],
      'mod-15': [
        {
          question: 'What is trust built on in lifestyle relationships?',
          options: [
            'Just time together',
            'Physical attraction',
            'Honesty, reliability, consistency, transparency, and respect over time',
            'Hope and luck'
          ],
          correctAnswer: 2,
          explanation: 'Trust is built through consistent honesty, reliability, transparency, respect for boundaries, and demonstrated care over time. It requires all these components working together through countless small actions.'
        },
        {
          question: 'If trust is broken, what must the person who violated it do?',
          options: [
            'Just apologize and move on',
            'Blame the other person',
            'Take full accountability, show genuine remorse, answer questions honestly, and demonstrate changed behavior over time',
            'Wait for the hurt to fade naturally'
          ],
          correctAnswer: 2,
          explanation: 'Rebuilding trust requires full accountability without excuses, genuine remorse, complete transparency, and consistently changed behavior over time. Trust rebuilds slowly through actions, not just words.'
        },
        {
          question: 'What is the relationship between trust and control?',
          options: [
            'More control builds more trust',
            'Trust requires letting go of control',
            'Control and trust are the same thing',
            'Trust means you should control everything'
          ],
          correctAnswer: 1,
          explanation: 'Trust requires letting go of control. Control behaviors (tracking, reading messages, forbidding connections) actually break trust. Real trust is choosing to believe in your partner\'s good choices despite the inability to control outcomes.'
        }
      ]
    };

    return quizzes[id] || [];
  };

  const questions = getQuizQuestions(moduleId);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };

  const passingScore = Math.ceil(questions.length * 0.7); // 70% to pass
  const passed = score >= passingScore;

  if (quizComplete) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full border-2 border-pink-500/30 p-8">
          <div className="text-center space-y-6">
            {passed ? (
              <>
                <CheckCircle className="h-20 w-20 text-green-400 mx-auto" />
                <h2 className="text-3xl font-bold text-white">Congratulations!</h2>
                <p className="text-white/80">
                  You passed the quiz with a score of {score}/{questions.length}
                </p>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold">Module Complete! ð</p>
                  <p className="text-white/70 text-sm mt-2">
                    Your progress has been saved and you can now move on to the next module.
                  </p>
                </div>
                <Button
                  onClick={onPass}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-full"
                >
                  Continue Learning
                </Button>
              </>
            ) : (
              <>
                <XCircle className="h-20 w-20 text-red-400 mx-auto" />
                <h2 className="text-3xl font-bold text-white">Keep Trying!</h2>
                <p className="text-white/80">
                  You scored {score}/{questions.length}. You need {passingScore}/{questions.length} to pass.
                </p>
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold">Review the material and try again</p>
                  <p className="text-white/70 text-sm mt-2">
                    Don't worry! You can review the module content and retake the quiz.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-full"
                  >
                    Retake Quiz
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    Review Module
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full border-2 border-pink-500/30">
        {/* Header */}
        <div className="border-b border-pink-500/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{title} - Quiz</h2>
            <p className="text-white/60 text-sm mt-1">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-white">
            {questions[currentQuestion].question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === questions[currentQuestion].correctAnswer;
              const showResult = showExplanation;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-500 text-white'
                        : isSelected
                        ? 'bg-red-500/20 border-red-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/50'
                      : isSelected
                      ? 'bg-pink-500/20 border-pink-500 text-white'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-pink-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showResult && isCorrect
                        ? 'border-green-500 bg-green-500'
                        : showResult && isSelected
                        ? 'border-red-500 bg-red-500'
                        : 'border-white/30'
                    }`}>
                      {showResult && isCorrect && <CheckCircle className="h-4 w-4 text-white" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-white" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 animate-fade-in">
              <p className="text-blue-400 font-semibold mb-2">Explanation:</p>
              <p className="text-white/80">{questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {showExplanation && (
          <div className="border-t border-pink-500/30 p-6">
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-full"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
