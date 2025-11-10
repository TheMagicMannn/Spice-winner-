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
          explanation: 'Enthusiastic consent is clear and positive—it should be an active "yes," not just the absence of a "no."'
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
                  <p className="text-green-400 font-semibold">Module Complete! 🎉</p>
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
