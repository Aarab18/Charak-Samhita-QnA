import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Book, HelpCircle, User, ServerCrash, Leaf, History, X, MessageSquare, Send, CheckCircle } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// --- Custom Loader Component ---
const LotusLoader = () => (
    <div className="flex flex-col items-center justify-center p-6">
        <div className="lotus-loader"></div>
        <p className="mt-4 text-lg text-teal-100">Seeking wisdom from the ancients...</p>
    </div>
);

// --- Wisdom of the Day Component ---
const WisdomOfTheDay = () => {
    const verses = [
        { text: "The body and the mind are the abodes of both disease and happiness. The balanced use of them is the cause of happiness.", citation: "Sutra Sthana 1:55" },
        { text: "Life (Ayu) is the combination of body, senses, mind and reincarnating soul. Ayurveda is the most sacred science of life, beneficial to humans in both this world and the world beyond.", citation: "Sutra Sthana 1:42-43" },
        { text: "That which is wholesome and that which is unwholesome for a happy and unhappy life, and the measure of life itself, is explained in Ayurveda.", citation: "Sutra Sthana 1:41" },
    ];
    const [verse, setVerse] = useState(null);

    useEffect(() => {
        setVerse(verses[Math.floor(Math.random() * verses.length)]);
    }, []);

    if (!verse) return null;

    return (
        <div className="mb-8 text-center bg-stone-800/30 backdrop-blur-md p-6 rounded-lg border border-stone-700 shadow-lg animate-fade-in">
            <h3 className="font-serif-lora text-lg text-amber-400 mb-2">Wisdom of the Day</h3>
            <p className="text-stone-200 italic">"{verse.text}"</p>
            <p className="text-stone-400 text-sm mt-2">- Charak Samhita, {verse.citation}</p>
        </div>
    );
};


// --- Helper Component for Formatted Bot Answers ---
const BotAnswer = ({ text }) => {
    if (!text) return null;

    const formatText = (rawText) => {
        if (!rawText) return null;
        const parts = rawText.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-stone-700">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const citationMarker = "Citation:";
    const citationIndex = text.indexOf(citationMarker);

    if (citationIndex !== -1) {
        const answer = text.substring(0, citationIndex).trim();
        const citation = text.substring(citationIndex).trim();
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8 mt-6 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-teal-400"></div>
                <div className="text-stone-800 text-base leading-relaxed whitespace-pre-wrap pt-4">{formatText(answer)}</div>
                <p className="mt-6 pt-4 border-t border-amber-200 text-sm italic text-amber-800 font-medium">
                    {citation}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8 mt-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-teal-400"></div>
            <div className="text-stone-800 text-base leading-relaxed whitespace-pre-wrap pt-4">{formatText(text)}</div>
        </div>
    );
};

// --- Feedback Modal Component (UI Improved) ---
const FeedbackModal = ({ isOpen, onClose, username, userId, db }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, submitted, error

    const handleSubmit = async () => {
        if (!feedbackText.trim() || !db || !userId) return;
        setStatus('submitting');
        try {
            await addDoc(collection(db, 'feedback'), {
                text: feedbackText,
                userId: userId,
                username: username,
                timestamp: serverTimestamp(),
                url: window.location.href,
            });
            setStatus('submitted');
            setFeedbackText('');
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2500);
        } catch (e) {
            console.error("Error submitting feedback:", e);
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-stone-800/90 border border-stone-700 rounded-lg shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                
                {status === 'submitted' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-serif-lora font-bold text-stone-100">Thank You!</h3>
                        <p className="text-stone-300">Your wisdom has been shared.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-serif-lora font-bold text-amber-400 mb-2">Share Feedback</h2>
                        <p className="text-stone-300 mb-6">Help us improve this experience. What are your thoughts?</p>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Your feedback helps us grow..."
                            className="w-full h-32 px-4 py-3 bg-stone-700/50 border border-stone-600 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder:text-stone-400 mb-4"
                            disabled={status === 'submitting'}
                        />
                        {status === 'error' && <p className="text-red-400 text-sm mb-4">Sorry, an error occurred. Please try again.</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={!feedbackText.trim() || status === 'submitting'}
                            className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 disabled:bg-stone-600 transition-all flex items-center justify-center gap-2 transform hover:scale-105"
                        >
                            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
                            {status !== 'submitting' && <Send size={18} />}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [questionHistory, setQuestionHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const suggestedTopics = ["What is Tridosha?", "Explain the concept of Agni", "What are the Pancha Mahabhutas?", "Describe the importance of Dinacharya"];

    // --- Effect for CSS and Fonts ---
    useEffect(() => {
        const styleId = 'app-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Inter:wght@400;500;700&display=swap');
            body { font-family: 'Inter', sans-serif; scrollbar-width: thin; scrollbar-color: #14b8a6 #1c1917; }
            .font-serif-lora { font-family: 'Lora', serif; }
            .bg-ayurveda-texture { background-color: #292524; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2392400e' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
            ::-webkit-scrollbar { width: 12px; }
            ::-webkit-scrollbar-track { background: #1c1917; }
            ::-webkit-scrollbar-thumb { background-color: #14b8a6; border-radius: 20px; border: 3px solid #1c1917; }
            @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            @keyframes pulse-glow { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
            .input-focus-glow { animation: pulse-glow 2s infinite; }
            .lotus-loader { width: 60px; height: 60px; border-radius: 50%; position: relative; animation: rotate 2s linear infinite; }
            .lotus-loader::before, .lotus-loader::after { content: ''; position: absolute; width: 30px; height: 30px; border-radius: 50% 0; background: #f59e0b; animation: scale-up 1s ease-in-out infinite alternate; }
            .lotus-loader::before { top: 0; left: 0; transform-origin: bottom right; }
            .lotus-loader::after { bottom: 0; right: 0; transform-origin: top left; animation-delay: -1s; }
            @keyframes rotate { to { transform: rotate(360deg); } }
            @keyframes scale-up { to { transform: scale(1.5); } }
        `;
        document.head.append(style);
    }, []);

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    const userDocRef = doc(dbInstance, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUsername(userDocSnap.data().username);
                        setShowLogin(false);
                    } else {
                        setShowLogin(true);
                    }
                } else {
                    await signInAnonymously(authInstance);
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase initialization error:", e);
            setError("Failed to connect to services. Please refresh.");
        }
    }, []);

    // --- Fetch History from Firestore ---
    useEffect(() => {
        if (isAuthReady && db && userId) {
            const historyCollection = collection(db, `users/${userId}/history`);
            const q = query(historyCollection);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const history = [];
                querySnapshot.forEach((doc) => {
                    history.push({ id: doc.id, ...doc.data() });
                });
                history.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                setQuestionHistory(history);
            });
            return () => unsubscribe();
        }
    }, [isAuthReady, db, userId]);


    // --- Event Handlers ---
    const handleLogin = async () => {
        if (!inputUsername.trim() || !userId || !db) return;
        try {
            const userDocRef = doc(db, "users", userId);
            await setDoc(userDocRef, { username: inputUsername });
            setUsername(inputUsername);
            setShowLogin(false);
        } catch (e) {
            console.error("Error saving username:", e);
            setError("Could not save your username. Please try again.");
        }
    };

    const handleAskQuestion = async (q) => {
        if (!q.trim() || isLoading) return;

        setAnswer('');
        setError(null);
        setIsLoading(true);
        setLastQuestion(q);
        setQuestion('');

        try {
            const prompt = `You are an AI expert on the Charak Samhita, an ancient Sanskrit text on Ayurveda. Your knowledge is strictly limited to the teachings within this text. Answer the user's question in as much detail as possible. Use bold formatting (**text**) sparingly and only for the most critical Ayurvedic terms and concepts. Do not overuse bolding. Do not use italics in the main body of your answer. After your detailed answer, on a new line, you MUST provide a specific citation from the Charak Samhita that supports your answer (e.g., "Citation: Sutra Sthana, Chapter 1, Verse 42"). Do not provide information from other sources. User question: "${q}"`;

            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            let botText = "I apologize, I couldn't retrieve an answer. Please try rephrasing your question.";

            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                botText = result.candidates[0].content.parts[0].text;
            }
            setAnswer(botText);

            // Save to history
            if (db && userId) {
                await addDoc(collection(db, `users/${userId}/history`), {
                    question: q,
                    answer: botText,
                    timestamp: serverTimestamp()
                });
            }

        } catch (e) {
            console.error("API or Firestore error:", e);
            setError("Failed to get a response or save history. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectHistory = (item) => {
        setLastQuestion(item.question);
        setAnswer(item.answer);
        setIsHistoryOpen(false);
    };

    // --- Render Logic ---
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-stone-800 font-sans">
                <div className="text-center">
                    <Book className="w-12 h-12 text-teal-500 mx-auto animate-pulse" />
                    <p className="mt-4 text-lg text-stone-300">Initializing Wisdom...</p>
                </div>
            </div>
        );
    }

    if (showLogin) {
        return (
            <div className="fixed inset-0 bg-stone-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm text-center">
                    <Book className="w-16 h-16 text-teal-700 mx-auto mb-4" />
                    <h1 className="text-2xl font-serif-lora font-bold text-stone-800 mb-2">Charak Samhita Q&A</h1>
                    <p className="text-stone-600 mb-6">Enter your name to begin your journey into ancient Ayurvedic wisdom.</p>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            placeholder="Your Name"
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                        />
                        <button
                            onClick={handleLogin}
                            disabled={!inputUsername.trim()}
                            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-stone-400 transition-transform transform hover:scale-105"
                        >
                            Enter
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ayurveda-texture font-sans text-stone-200">
            <FeedbackModal 
                isOpen={isFeedbackOpen} 
                onClose={() => setIsFeedbackOpen(false)}
                db={db}
                userId={userId}
                username={username}
            />

            <div className={`fixed top-0 left-0 h-full w-80 bg-stone-900/80 backdrop-blur-lg shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-stone-700">
                    <h2 className="font-serif-lora text-xl text-stone-100">History</h2>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-stone-400 hover:text-white"><X /></button>
                </div>
                <div className="p-2 overflow-y-auto h-[calc(100%-60px)]">
                    {questionHistory.length > 0 ? questionHistory.map(item => (
                        <div key={item.id} onClick={() => handleSelectHistory(item)} className="p-3 text-sm text-stone-300 hover:bg-stone-700/50 rounded-lg cursor-pointer truncate">
                            {item.question}
                        </div>
                    )) : <div className="p-4 text-center text-stone-500">No history yet.</div>}
                </div>
            </div>

            <header className="bg-stone-900/30 backdrop-blur-sm shadow-lg sticky top-0 z-20 border-b border-stone-700">
                <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsHistoryOpen(true)} title="View History" className="p-2 rounded-full hover:bg-stone-700/50 text-stone-300 hover:text-white transition">
                            <History size={20} />
                        </button>
                        <h1 className="text-2xl font-serif-lora font-bold text-stone-100 hidden sm:block">Charak Samhita Q&A</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-300 bg-stone-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-stone-700">
                        <User className="w-5 h-5 text-teal-400" />
                        <span>{username}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-8">
                <WisdomOfTheDay />
                <div className="bg-stone-800/50 backdrop-blur-md rounded-lg shadow-2xl p-6 relative overflow-hidden border border-stone-700 glow-card">
                    <div className="relative z-10">
                        <h2 className="text-lg font-semibold text-stone-200 mb-4 font-serif-lora">Ask a question</h2>
                        <div className={`flex items-center gap-4 rounded-lg transition-all ${isInputFocused ? 'input-focus-glow' : ''}`}>
                            <input
                                type="text"
                                value={question}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion(question)}
                                placeholder="e.g., What is the concept of 'Tridosha'?"
                                className="flex-grow px-4 py-3 bg-stone-700/50 border border-stone-600 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder:text-stone-400"
                            />
                            <button
                                onClick={() => handleAskQuestion(question)}
                                disabled={isLoading || !question.trim()}
                                className="bg-amber-500 text-white p-3 rounded-full hover:bg-amber-600 disabled:bg-stone-600 transition-all transform hover:scale-110"
                            >
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-md font-semibold text-stone-300 mb-3 text-center font-serif-lora">Or explore a suggested topic</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {suggestedTopics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => handleAskQuestion(topic)}
                                disabled={isLoading}
                                className="bg-teal-900/50 text-teal-200 font-medium px-4 py-2 rounded-full text-sm hover:bg-teal-800/70 hover:shadow-lg transition-all disabled:opacity-50 border border-teal-800 flex items-center gap-2"
                            >
                                <Leaf size={14} />
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 min-h-[200px]">
                    {isLoading && <LotusLoader />}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-center gap-3">
                            <ServerCrash className="w-6 h-6" />
                            <div>
                                <p className="font-bold">An Error Occurred</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !answer && !error && (
                        <div className="text-center text-stone-400 mt-12 p-6">
                            <HelpCircle size={48} className="mx-auto mb-4 text-stone-500" />
                            <p className="text-lg font-serif-lora">Your answer will appear here</p>
                            <p className="text-sm">Ask any question about the Charak Samhita to get a detailed, cited response.</p>
                        </div>
                    )}
                    {answer && (
                        <div>
                            <h3 className="text-xl font-bold font-serif-lora text-stone-100 mb-2">Answer for: "{lastQuestion}"</h3>
                            <BotAnswer text={answer} />
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button for Feedback */}
            <button
                onClick={() => setIsFeedbackOpen(true)}
                title="Submit Feedback"
                className="fixed bottom-8 right-8 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all transform hover:scale-110 z-30"
            >
                <MessageSquare size={24} />
            </button>
        </div>
    );
}
