// src/components/KinkQuiz.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpiceLogo } from '@/components/SpiceComponents';

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// SPICE theme colors - pink gradient from disagree to agree
const COLORS = [
  '#ff1493', '#ff1493', '#ff1493', // Strongly disagree - Deep Pink
  '#ff69b4', '#ff69b4', '#ff69b4', // Neutral - Hot Pink
  '#ff91a4', '#ff91a4', '#ff91a4'  // Strongly agree - Light Pink
] as const;
const PAGESIZE = 6;

// === STATEMENTS (64 total) ===
const STATEMENTS = [
  "I like to be dominated, especially in the bedroom.",
  "I like receiving pain during sex/BDSM and seeing the results of it (marks/bruises, makeup running by tears, etc.) afterwards.",
  "I prefer making the sexual decisions for my partner, as this gives me more control.",
  "I like forcing my partner into submission, much more than them submitting spontaneously.",
  "I would like to have sex with multiple people at the same time.",
  "I enjoy it when people watch me being naked or having sex.",
  "I don't like making sexual decisions, I prefer my partner to make them for me.",
  "I am willing to try anything once, even if I don't think I will like it.",
  "Physically restricting my partner during sex/BDSM (with clothes, attributes, rope, chains, etc.) is arousing.",
  "I like to be totally helpless and at my partner's disposal, physically unable to resist what they do.",
  "I have a thing for large age differences in sexual encounters or relationships.",
  "I enjoy playing or acting like a pet animal (dog, cat, pony, etc.).",
  "Being treated with little or no respect during sex/BDSM arouses me.",
  "There is no reason why sex would have to happen in private spaces, isolated from the outside world.",
  "I find the romantic aspect in a relationship much more important than the sexual or kinky aspects.",
  "I would like to serve in a formal setting with explicit slave training, prescribed physical positions and rituals, etc.",
  "Assuming I was single, I would like to join an existing couple's or polygroup's relationship for sexual and/or emotional purposes.",
  "Being physically restricted during sex/BDSM (with clothes, attributes, rope, chains, etc.) is arousing.",
  "I enjoy feeling like a prey hunted by a predator.",
  "I don't have any sort of specific fetish or non-standard sexual turn-on.",
  "Being part of a group of slaves that serves one Master/Mistress, sounds like a life that would really suit me.",
  "I would like to be completely tied up during sex/BDSM.",
  "I enjoy being kept as a pet: in a cage, eating out of a bowl, being petted/caressed, etc.",
  "I love seeing the fear in my partner's eyes when they know I'm going to inflict pain on them.",
  "I like to be sexually degraded and humiliated by my partner(s) sometimes.",
  "I enjoy playing a different age than what I technically am.",
  "I would like to be nothing but a 24/7 sex slave (i.e., not having any human interaction outside of sex and BDSM).",
  "Treating my partner with little or no respect during sex/BDSM arouses me.",
  "I like being forced into submission, much more than submitting spontaneously.",
  "I would like it when my partner is completely tied up during sex/BDSM.",
  "I have plenty of sexual fantasies that I would like to try out, more than most of my kinky peers.",
  "I find it adorable when my partner acts or dresses childlike, or when they engage in childlike activities such as coloring in a coloring book or playing on a playground.",
  "I would be sexually submissive now, and be sexually dominant other time (either to the same, or to another partner).",
  "Living with a group of slaves owned by me and serving me, would be my ultimate life goal.",
  "It's no big deal when things I try turn out bad for me. It's part of the risk and it's a necessary part of discovering what works and what doesn't.",
  "I enjoy keeping my partner as a pet: providing them with a cage, feeding them out of a bowl, petting/caressing them, etc.",
  "If I could not fulfill all of my partner's sexual desires, I would encourage them to see other people to fill the gaps.",
  "I often behave in animalistic ways during sex (growling, howling, etc.).",
  "If part of my sexual desires are not fulfilled with my partner, I would want to see other people to fill the gaps.",
  "I enjoy feeling like a predator hunting its prey.",
  "I like it when my partner takes on a nurturing and guiding, almost parental role in the relationship.",
  "I enjoy watching other people being naked or having sex.",
  "I'd like my partner(s) to submit to me 24/7 and I'm willing to take the responsibility that comes with it.",
  "I like my partner(s) to be completely in charge in the bedroom, ordering me around.",
  "If I could make some money from selling porn clips of myself, I definitely would.",
  "Being in fear of what my partner is going to do to me physically, is arousing.",
  "I feel the need to serve my partner and treat them with the highest respect, addressing them as a superior.",
  "Talking back to one's dominant in a teasingly disobeying way, should be part of the sub's fun.",
  "I enjoy verbally degrading my partner or calling them humiliating names during sex/BDSM.",
  "I enjoy it when my partner plays or acts like a pet animal (dog, cat, pony, etc.).",
  "I like to be completely in charge in the bedroom, and order my partner(s) around.",
  "The idea of being tortured sexually, is appealing.",
  "I would be willing to leave everything I have behind, to live the BDSM-life of my dreams.",
  "I like inflicting pain during sex/BDSM and seeing the results of it (marks/bruises, makeup running by tears, etc.) afterwards.",
  "I could not be always dominant or always submissive, I need both.",
  "I like to dominate my partner(s), especially in the bedroom.",
  "I like to sexually degrade and/or humiliate my partner(s) sometimes.",
  "I will naturally take on a nurturing and guiding, almost parental role in a relationship.",
  "The idea of torturing someone sexually, is appealing.",
  "I'd like to submit to my partner 24/7 and see serving them as my life purpose.",
  "I want my partner to serve me and address me as superior.",
  "I enjoy dressing or behaving like a child, or engaging in child-appropriate activities such as coloring in a coloring book or going to a playground.",
  "I enjoy being verbally degraded or being called humiliating names during sex/BDSM.",
  "I enjoy taming bratty behavior in subs."
] as const;

// === CATEGORIES ===
const CATEGORIES = {
  Ageplayer: [11, 26, 32, 62],
  Experimentalist: [8, 31, 35],
  Pet: [12, 23, 36, 50],
  Ropebunny: [10, 18, 22],
  Masochist: [2, 52],
  Degradee: [13, 25, 63],
  Submissive: [1, 7, 29, 44, 55],
  Exhibitionist: [6, 14, 45],
  PrimalPrey: [19, 46],
  Nonmonogamist: [5, 17, 37, 39],
  Rigger: [9, 30],
  Switch: [33, 55],
  DaddyMommy: [41, 58],
  Voyeur: [42, 6],
  Sadist: [24, 54, 59],
  Dominant: [3, 51, 56],
  MasterMistress: [43, 61],
  BratTamer: [64],
  Slave: [16, 21, 27, 47, 53, 60],
  Owner: [34, 36],
  Degrader: [4, 28, 49, 57],
  Little: [32, 62],
  Brat: [48],
  Vanilla: [15, 20],
  PrimalHunter: [38, 40]
} as const;

// === TYPES ===
type Archetype = keyof typeof CATEGORIES;
type KinkResults = Record<Archetype, number>;
type Result = { name: string; pct: number };

interface Props {
  onClose: () => void;
  onSaveResults?: (results: KinkResults) => void;
}

// === COMPONENT ===
export const KinkQuiz: React.FC<Props> = ({ onClose, onSaveResults }) => {
  const [page, setPage] = useState(0);
  const [scores, setScores] = useState(() => Array(STATEMENTS.length).fill(null));
  const [results, setResults] = useState<Result[] | null>(null);
  const [dir, setDir] = useState(1);
  const [showCompletion, setShowCompletion] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Prevent background scrolling when quiz is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const totalPages = Math.ceil(STATEMENTS.length / PAGESIZE);
  const start = page * PAGESIZE;
  const pageStmts = STATEMENTS.slice(start, start + PAGESIZE);
  
  // Check if all questions on current page are answered
  const currentPageAnswered = pageStmts.every((_, i) => scores[start + i] !== null);
  
  // Calculate question progress (not page progress)
  const answeredCount = scores.filter(s => s !== null).length;
  const totalQuestions = STATEMENTS.length;
  const questionProgress = Math.round((answeredCount / totalQuestions) * 100);

  const select = (i: number, v: number) => {
    const newScores = [...scores];
    newScores[start + i] = v;
    setScores(newScores);
  };

  const next = () => {
    if (!currentPageAnswered) return;
    
    if (page < totalPages - 1) {
      setDir(1); 
      setPage(p => p + 1);
      // Scroll to top of content area when moving to next page
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } else {
      // Show completion message before results
      setShowCompletion(true);
      setTimeout(() => {
        calculate();
        setShowCompletion(false);
      }, 2000);
    }
  };

  const prev = () => {
    if (page > 0) {
      setDir(-1); 
      setPage(p => p - 1);
      // Scroll to top of content area when moving to previous page
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  const calculate = () => {
    // Replace null values with 5 (neutral) for calculation
    const finalScores = scores.map(s => s === null ? 5 : s);
    
    const vanillaPct = Math.round(
      CATEGORIES.Vanilla.reduce((s, i) => s + finalScores[i - 1], 0) / (9 * CATEGORIES.Vanilla.length) * 100
    );

    const cats: Partial<KinkResults> = {};
    (Object.keys(CATEGORIES) as Archetype[]).forEach(cat => {
      const stmts = CATEGORIES[cat];
      const pct = Math.round(
        stmts.reduce((s, i) => s + finalScores[i - 1], 0) / (9 * stmts.length) * 100
      );
      cats[cat] = vanillaPct > 80 && cat !== 'Vanilla' ? Math.max(0, pct - 10) : pct;
    });

    const sorted: Result[] = Object.entries(cats)
      .sort(([,a], [,b]) => b - a)
      .map(([k, v]) => ({ name: k.replace(/([A-Z])/g, ' $1').trim(), pct: v }));

    setResults(sorted);
    onSaveResults?.(cats as KinkResults);
  };

  const copy = async () => {
    if (!results) return;
    await navigator.clipboard.writeText(results.slice(0, 10).map(r => `${r.pct}% ${r.name}`).join('\n'));
    alert('Results copied to clipboard!');
  };

  const share = async () => {
    if (!results) return;
    const text = results.slice(0, 10).map(r => `${r.pct}% ${r.name}`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My SPICE Kink Quiz Results', text });
      } catch (error) {
        console.error('Error sharing:', error);
        copy();
      }
    } else {
      copy();
    }
  };

  // === ANIMATIONS ===
  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 1000 : -1000, opacity: 0 })
  };

  if (results) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
        {/* Top Header - sticky */}
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Quiz Results</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-pink-500/10"
              data-testid="close-results-button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* SPICE Logo below header */}
          <div className="pb-4">
            <SpiceLogo className="text-4xl sm:text-5xl" showUnderline={true} />
            <p className="text-center text-white/70 text-sm mt-2">Your Kink Profile</p>
          </div>
        </div>

        {/* Results content - with proper padding for bottom nav */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 pb-40">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="max-w-3xl mx-auto space-y-3"
            >
              {results.map((r, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  className="bg-black/50 border border-pink-500/30 rounded-lg p-4 hover:border-pink-500/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <motion.span 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", delay: i * 0.05 + 0.2 }}
                      className="text-xl font-bold text-pink-400 min-w-[60px]"
                    >
                      {r.pct}%
                    </motion.span>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full"
                        />
                      </div>
                      <span className="text-white font-medium">{r.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Action buttons at bottom - fixed with extra padding */}
        <motion.div 
          initial={{ y: 50 }} 
          animate={{ y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="sticky bottom-0 p-4 pb-24 border-t border-pink-500/30 bg-black/95 backdrop-blur-sm flex-shrink-0"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex gap-3 max-w-3xl mx-auto">
            <Button
              onClick={copy}
              className="flex-1 bg-gray-900 text-pink-400 font-bold rounded-full border-2 border-pink-500/50 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all py-3"
              data-testid="copy-results-button"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Results
            </Button>
            <Button
              onClick={share}
              className="flex-1 bg-gray-900 text-pink-400 font-bold rounded-full border-2 border-pink-500/50 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all py-3"
              data-testid="share-results-button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Completion screen
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="text-6xl mb-4">🎉</div>
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white"
          >
            Quiz Complete!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-lg"
          >
            Calculating your results...
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Top Header - sticky */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">BDSM/Kink Quiz</h2>
            <p className="text-xs text-white/70">To what extent do you agree?</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-pink-500/10"
            data-testid="close-quiz-button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* SPICE Logo below header */}
        <div className="pb-3">
          <SpiceLogo className="text-4xl sm:text-5xl" showUnderline={true} />
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-600 to-pink-400"
                  animate={{ width: `${questionProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.span 
                key={answeredCount} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-pink-400 font-bold min-w-[50px] text-right"
              >
                {questionProgress}%
              </motion.span>
            </div>
            <p className="text-center text-white/60 text-xs sm:text-sm mt-2">
              {answeredCount} of {totalQuestions} questions answered • Page {page + 1} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Questions area - with proper padding for bottom nav (increased significantly) */}
      <div ref={contentRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 pb-64">
          {/* Scale Legend */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-black/50 border border-pink-500/30 rounded-lg p-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-pink-400 font-semibold">Strongly Disagree</span>
                <span className="text-white/50">←</span>
                <span className="text-white/70 font-medium">Neutral</span>
                <span className="text-white/50">→</span>
                <span className="text-pink-400 font-semibold">Strongly Agree</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={page}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="space-y-5 max-w-3xl mx-auto"
            >
              {pageStmts.map((stmt, i) => {
                const isAnswered = scores[start + i] !== null;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-black/50 border rounded-lg p-5 transition-all ${
                      isAnswered 
                        ? 'border-pink-500/50' 
                        : 'border-pink-500/20'
                    }`}
                    data-testid={`question-${start + i}`}
                  >
                    <p className="text-white mb-4 leading-relaxed text-sm sm:text-base">{stmt}</p>
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {SCALE.map(v => (
                        <motion.button
                          key={v}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 font-bold text-white text-sm transition-all ${
                            scores[start + i] === v
                              ? 'border-white scale-110 shadow-lg shadow-pink-500/50'
                              : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: COLORS[v - 1] }}
                          onClick={() => select(i, v)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ scale: 0 }}
                          animate={{ scale: scores[start + i] === v ? 1.1 : 1 }}
                          transition={{ delay: i * 0.03 + 0.1 }}
                          data-testid={`answer-${start + i}-${v}`}
                        >
                          {v === 5 ? 'N' : ''}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation at bottom - fixed with extra padding to avoid bottom nav bar */}
      <motion.div 
        initial={{ y: 50 }} 
        animate={{ y: 0 }} 
        className="sticky bottom-0 p-4 pb-24 border-t border-pink-500/30 bg-black/95 backdrop-blur-sm flex-shrink-0"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex justify-between gap-3">
            {page > 0 ? (
              <Button
                onClick={prev}
                className="bg-gray-900 text-white font-bold rounded-full border-2 border-pink-500/50 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all px-6 sm:px-8 py-3"
                data-testid="previous-button"
              >
                ← Previous
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={next}
              disabled={!currentPageAnswered}
              className={`font-bold rounded-full border-2 transition-all px-6 sm:px-8 py-3 ${
                currentPageAnswered
                  ? 'bg-pink-600 text-white border-pink-500 hover:bg-pink-700 animate-glow-pink'
                  : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              }`}
              data-testid="next-button"
            >
              {page === totalPages - 1 ? 'Finish' : 'Next'} →
            </Button>
          </div>
          {!currentPageAnswered && (
            <p className="text-center text-pink-400 text-sm animate-pulse">
              Please answer all questions to continue
            </p>
          )}
        </div>
      </motion.div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-glow-pink {
          animation: glowPink 2.4s ease-in-out infinite;
        }
        @keyframes glowPink {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
            border-color: rgba(255, 20, 147, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 20, 147, 1), 0 0 30px rgba(255, 105, 180, 0.8);
            border-color: rgba(255, 20, 147, 1);
          }
        }
      `}</style>
    </div>
  );
};
