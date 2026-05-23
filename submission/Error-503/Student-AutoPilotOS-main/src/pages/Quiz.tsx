import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { generateQuiz } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
  Check,
  Award,
  BookmarkCheck,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface QuizProps {
  onNavigate: (view: string) => void;
  selectedText?: string;
}

export const Quiz: React.FC<QuizProps> = ({ onNavigate, selectedText }) => {
  const { user, profile, updateProfileStats } = useAuth();
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState(selectedText || "");
  const [activeTab, setActiveTab] = useState<"mcq" | "flashcards" | "viva">("mcq");

  // AI Generated quiz data
  const [quizData, setQuizData] = useState<{
    title: string;
    questions: {
      id: number;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }[];
    flashcards: {
      front: string;
      back: string;
    }[];
    vivaQuestions?: {
      question: string;
      idealAnswer: string;
    }[];
  } | null>(null);

  // MCQ Engine states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectTracker, setIncorrectTracker] = useState<number[]>([]); // holds indexes of wrong questions
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcards state
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Viva state
  const [revealedVivaIdxs, setRevealedVivaIdxs] = useState<number[]>([]);

  useEffect(() => {
    if (selectedText) {
      setMaterial(selectedText);
    }
  }, [selectedText]);

  const handleBuildQuiz = async () => {
    if (!material.trim()) {
      toast.error("Please paste textbook study notes in the textbox, or summarize notes in the Summarizer tab first!");
      return;
    }

    setLoading(true);
    setQuizData(null);
    setQuizFinished(false);
    setCurrentQuestionIdx(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setIncorrectTracker([]);

    try {
      const parsedData = await generateQuiz(material);
      setQuizData(parsedData);
      toast.success("AI Quiz created! Booting study interface...");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate dynamic review quiz.");
    } finally {
      setLoading(false);
    }
  };

  // MCQ Selection Handler
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!quizData || !selectedOption || isAnswered) return;

    const currentQuestion = quizData.questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success("Option verified! Correct.", { duration: 1500 });
    } else {
      setIncorrectTracker(prev => [...prev, currentQuestionIdx]);
      toast.error("Verified incorrect. Review explanation below.", { duration: 2500 });
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!quizData) return;

    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finalizeQuizAndSync();
    }
  };

  const finalizeQuizAndSync = async () => {
    if (!quizData || !user) return;
    setQuizFinished(true);

    // Calc score values
    const scorePct = Math.round((score / quizData.questions.length) * 100);
    
    // Log study statistics in Firebase user profile and state
    try {
      // Reward user profile stats!
      const hoursCredit = 0.25; // 15 mins study credit
      const fScoreInc = scorePct >= 80 ? 5 : scorePct >= 50 ? 2 : -2;
      await updateProfileStats(hoursCredit, fScoreInc);

      // Save quiz score history to Firestore
      await addDoc(collection(db, "quizzes"), {
        ownerId: user.uid,
        title: quizData.title,
        questions: quizData.questions,
        score: score,
        maxScore: quizData.questions.length,
        completed: true,
        createdAt: serverTimestamp()
      });

      // Save matching log entry to analytics history
      await addDoc(collection(db, "analytics"), {
        ownerId: user.uid,
        date: new Date().toISOString().split("T")[0],
        hoursStudied: hoursCredit,
        focusScore: profile?.focusScore || 100,
        quizPerformance: scorePct,
        completedAssignments: 0,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "quizzes");
    }
  };

  const toggleRevealViva = (idx: number) => {
    if (revealedVivaIdxs.includes(idx)) {
      setRevealedVivaIdxs(prev => prev.filter(v => v !== idx));
    } else {
      setRevealedVivaIdxs(prev => [...prev, idx]);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none bg-slate-950/10 min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <GraduationCap className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Intelligent Testing Environment</span>
        </div>
        <h1 className="text-2xl font-black text-white">Interactive AI Quiz Generator</h1>
        <p className="text-xs text-slate-450 mt-1">
          Turn your summarized study guides into Multiple-Choice Questions (MCQs), flip flashcards, and oral viva exam questions.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="rounded-2xl border border-slate-800 bg-slate-900/30 py-20 flex justify-center items-center"
          >
            <LoadingSpinner label="Compiling interactive revision questions..." />
          </motion.div>
        ) : !quizData ? (
          // Input view
          <motion.div
            key="input"
            className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-5"
          >
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">Source Notes Input</label>
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Paste your textbooks notes or course descriptions here, or type some concepts to construct a custom test..."
                rows={8}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed font-sans"
                id="quiz-material-textarea"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 max-w-sm font-mono">
                <Info className="h-4 w-4 text-slate-450 shrink-0" />
                <span>Completing quizzes awards Study Hours and optimizes your student profile Focus Score!</span>
              </div>
              <button
                onClick={handleBuildQuiz}
                className="rounded bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-6 py-3 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                id="build-quiz-btn"
              >
                <Sparkles className="h-4.5 w-4.5" />
                <span>Assemble AI Diagnostics</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Testing grounds */
          <motion.div
            key="testing"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Tab header selector */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex space-x-2 bg-slate-900/80 p-1 border border-slate-850 rounded-lg">
                <button
                  onClick={() => setActiveTab("mcq")}
                  className={`px-4 py-2 rounded text-[10px] font-mono tracking-wider transition-all uppercase cursor-pointer ${
                    activeTab === "mcq" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  MCQ Diagnostics
                </button>
                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={`px-4 py-2 rounded text-[10px] font-mono tracking-wider transition-all uppercase cursor-pointer ${
                    activeTab === "flashcards" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Active Recall Cards
                </button>
                <button
                  onClick={() => setActiveTab("viva")}
                  className={`px-4 py-2 rounded text-[10px] font-mono tracking-wider transition-all uppercase cursor-pointer ${
                    activeTab === "viva" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Viva Prep
                </button>
              </div>

              <button
                onClick={() => setQuizData(null)}
                className="text-[10px] font-mono text-slate-400 hover:text-white"
              >
                Assemble Different Quiz
              </button>
            </div>

            {/* TAB 1: MCQ Interactive Arena */}
            {activeTab === "mcq" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main question and option card */}
                <div className="lg:col-span-8 space-y-6">
                  {!quizFinished ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-5">
                      {/* Quest progress header */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 border-b border-slate-900 pb-3">
                        <span className="uppercase">Verify Option Answers</span>
                        <span>Question {currentQuestionIdx + 1} of {quizData.questions.length}</span>
                      </div>

                      {/* Question box */}
                      <h2 className="text-sm font-semibold text-slate-100 leading-normal font-sans">
                        {quizData.questions[currentQuestionIdx].question}
                      </h2>

                      {/* Options stack split */}
                      <div className="space-y-2.5">
                        {quizData.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                          const isSelected = selectedOption === opt;
                          const showCorrectness = isAnswered;
                          const isCorrectOpt = opt === quizData.questions[currentQuestionIdx].correctAnswer;

                          let btnClasses = "border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/30";
                          if (isSelected) btnClasses = "border-indigo-500 bg-indigo-500/5 text-indigo-400 font-semibold";
                          
                          if (showCorrectness) {
                            if (isCorrectOpt) {
                              btnClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                            } else if (isSelected) {
                              btnClasses = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold";
                            } else {
                              btnClasses = "border-slate-800 bg-slate-900/30 opacity-40 text-slate-500";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(opt)}
                              disabled={isAnswered}
                              className={`w-full flex items-center justify-between px-4 py-3 border.5 rounded-xl text-xs text-left transition-all ${btnClasses} cursor-pointer`}
                              id={`mcq-opt-${oIdx}`}
                            >
                              <span>{opt}</span>
                              {showCorrectness && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                              {showCorrectness && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Action command bar */}
                      <div className="flex justify-end pt-3 border-t border-slate-900">
                        {!isAnswered ? (
                          <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedOption}
                            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded cursor-pointer"
                            id="submit-mcq-btn"
                          >
                            Verify Choice
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuestion}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded flex items-center space-x-1.5 cursor-pointer"
                            id="next-mcq-btn"
                          >
                            <span>{currentQuestionIdx === quizData.questions.length - 1 ? "Complete Diagnostics" : "Next Segment"}</span>
                            <ChevronRight className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>

                      {/* Diagnostic explanation block when evaluated */}
                      {isAnswered && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-xs leading-relaxed text-slate-350 font-sans">
                          <strong className="text-slate-200 font-bold">Feedback Loop:</strong> {quizData.questions[currentQuestionIdx].explanation}
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Score Completion layout with interactive review card */
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center space-y-6"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <Award className="h-8 w-8" />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Diagnostics Finalized!</h2>
                        <p className="text-xs text-slate-450 max-w-sm mx-auto">
                          You completed the AI Review Board diagnostics module. Your study hours and metrics have been synced.
                        </p>
                      </div>

                      {/* Performance stats summary card */}
                      <div className="max-w-xs mx-auto border border-slate-800 bg-slate-950 border-spacing-1 rounded-2xl p-5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Score Matrix</span>
                        <h1 className="text-4xl font-extrabold text-indigo-400 font-mono">
                          {Math.round((score / quizData.questions.length) * 100)}%
                        </h1>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                          Correct answers: {score} of {quizData.questions.length}
                        </span>
                      </div>

                      {/* Restart diagnostic or check study planner */}
                      <div className="flex justify-center space-x-3 pt-2">
                        <button
                          onClick={() => {
                            setQuizFinished(false);
                            setCurrentQuestionIdx(0);
                            setScore(0);
                            setIsAnswered(false);
                            setSelectedOption(null);
                            setIncorrectTracker([]);
                          }}
                          className="text-[10px] font-mono text-slate-400 hover:text-white px-4 py-2 border border-slate-800 bg-slate-950 rounded cursor-pointer"
                        >
                          Restart Diagnostic
                        </button>
                        <button
                          onClick={() => onNavigate("planner")}
                          className="rounded bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-5 py-2 flex items-center space-x-1 cursor-pointer"
                        >
                          Check Study Plan
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Left stats rail panel */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Academic Metric Credit</h3>
                    <div className="space-y-3.5 text-xs text-slate-350">
                      <div className="flex justify-between">
                        <span>Total Study Rewards:</span>
                        <strong className="text-emerald-400">+0.25 Hrs Study Time</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Focus Score potential:</span>
                        <strong className="text-indigo-400">+5 FPS score points</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ACTIVE RECALL FLASHCARDS (With 3D flips!) */}
            {activeTab === "flashcards" && (
              <div className="max-w-lg mx-auto space-y-6">
                
                {/* 3D flip card card frame wrapper */}
                <div 
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="h-64 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-900 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 p-6 flex flex-col justify-between cursor-pointer relative shadow-lg overflow-hidden group select-none"
                  id="flashcard-click-area"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Card metadata label header */}
                  <div className="flex justify-between items-center text-[9px] font-mono text-indigo-400 uppercase tracking-widest">
                    <span>Active Recall Flashcard</span>
                    <span>{activeFlashcardIdx + 1} of {quizData.flashcards.length}</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!flashcardFlipped ? (
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex items-center justify-center text-center p-4"
                      >
                        <h1 className="text-sm font-bold text-slate-100 font-sans tracking-wide leading-relaxed">
                          {quizData.flashcards[activeFlashcardIdx].front}
                        </h1>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex items-center justify-center text-center p-3"
                      >
                        <p className="text-xs text-slate-300 italic font-mono bg-slate-950/50 p-4 rounded-xl border border-slate-900 w-full leading-relaxed">
                          {quizData.flashcards[activeFlashcardIdx].back}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-center text-[9px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                    Click card to flip
                  </div>
                </div>

                {/* Selector controllers */}
                <div className="flex justify-between items-center">
                  <button
                    disabled={activeFlashcardIdx === 0}
                    onClick={() => {
                      setActiveFlashcardIdx(prev => prev - 1);
                      setFlashcardFlipped(false);
                    }}
                    className="text-[10px] font-mono text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    Previous Card
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">
                    Active Module: {activeFlashcardIdx + 1}/{quizData.flashcards.length}
                  </span>
                  <button
                    disabled={activeFlashcardIdx === quizData.flashcards.length - 1}
                    onClick={() => {
                      setActiveFlashcardIdx(prev => prev + 1);
                      setFlashcardFlipped(false);
                    }}
                    className="text-[10px] font-mono text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    Next Card
                  </button>
                </div>

              </div>
            )}

            {/* TAB 3: oral preparation VIVA questions */}
            {activeTab === "viva" && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl space-y-2 mb-6">
                  <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wide flex items-center space-x-1.5 font-bold">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Viva Oral Boards preparation active</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    These questions represent deep academic issues often queried during live lab defenses, oral tests, or startup reviews. Formulate your verbal response, then check our ideal answering metrics.
                  </p>
                </div>

                {quizData.vivaQuestions && quizData.vivaQuestions.map((v, vIdx) => {
                  const revealed = revealedVivaIdxs.includes(vIdx);

                  return (
                    <div 
                      key={vIdx}
                      className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex items-start space-x-3 leading-relaxed">
                          <span className="text-xs font-mono font-black text-indigo-400 mt-0.5">Q{vIdx+1}.</span>
                          <h3 className="text-xs font-bold text-slate-200">{v.question}</h3>
                        </div>
                        <button
                          onClick={() => toggleRevealViva(vIdx)}
                          className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 shrink-0 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{revealed ? "Cover" : "Ideal Answer"}</span>
                        </button>
                      </div>

                      {revealed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="border-t border-slate-900 pt-3 text-xs text-slate-350 leading-relaxed font-sans"
                        >
                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-1">
                            <strong className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide block mb-1">AI Recommendation Answer Guide:</strong>
                            <p>{v.idealAnswer}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
