import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Flame, PenLine } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import ModalWrapper from "./ModalWrapper.jsx";
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import CollaborateForm from './CollaborateForm';
import { useToast } from "../context/ToastContext.jsx";
import DOMPurify from 'dompurify';

const BackgroundImage = ({ imageUrl }) => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020412]">
        <img
            src={imageUrl}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020412] via-[#020412]/80 to-[#700B1A]/20 mix-blend-multiply" />
    </div>
);

// --- LETTORE ARTICOLO ---
const ArticleReader = ({ article, onClose, currentUser, onAuthRequired }) => {
    const containerRef = useRef(null);
    const [hidden, setHidden] = useState(false);
    const [fireCount, setFireCount] = useState(0);
    const [hasFired, setHasFired] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const showToast = useToast();

    const { scrollY } = useScroll({ container: containerRef });



    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) setHidden(true);
        else setHidden(false);
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        const articleRef = doc(db, 'article_stats', article.title);
        getDoc(articleRef).then(docSnap => {
            if (docSnap.exists()) setFireCount(docSnap.data().fires || 0);
        }).catch(err => console.error("Errore lettura db:", err));

        if (currentUser) {
            const userStorageKey = `scroll_fire_${currentUser.uid}_${article.title}`;
            setHasFired(localStorage.getItem(userStorageKey) === 'true');
        } else {
            setHasFired(false);
        }
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, [article.title, currentUser]);

    const handleFireClick = async () => {
        if (!currentUser) {
            showToast("Devi loggarti per mettere una reazione", "error");
            return;
        }
        const newState = !hasFired;
        setHasFired(newState);
        setFireCount(prev => newState ? prev + 1 : prev - 1);
        const userStorageKey = `scroll_fire_${currentUser.uid}_${article.title}`;
        if (newState) localStorage.setItem(userStorageKey, 'true');
        else localStorage.removeItem(userStorageKey);
        try {
            await setDoc(doc(db, 'article_stats', article.title), {
                fires: increment(newState ? 1 : -1)
            }, { merge: true });
        } catch (e) {
            console.error("Errore salvataggio fuoco:", e);
        }
    };

    const handlePenClick = () => {
        if (!currentUser) {
            showToast("Devi loggarti per rispondere", "error");
            onAuthRequired();
            return;
        }
        setShowReplyForm(true);
    };

    const cleanContent = (html) => {
        if (!html) return '';
        return html
            .replace(/&nbsp;/gi, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
            .replace(/<br\s*\/?>/gi, ' ')
            .trim();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed left-0 right-0 bottom-0 top-[73px] z-[60] bg-[#020412] text-slate-300 flex flex-col overflow-y-auto no-scrollbar"
            ref={containerRef}
        >
            {showReplyForm && (
                <ModalWrapper onClose={() => setShowReplyForm(false)} maxWidth="max-w-2xl">
                    <CollaborateForm
                        userEmail={currentUser?.email}
                        onClose={() => setShowReplyForm(false)}
                        articleTitle={article.title}
                    />
                </ModalWrapper>
            )}

            {/* NAVBAR */}
            <motion.div
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: "-100%", opacity: 0 }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sticky top-0 left-0 w-full flex items-center px-6 py-4 border-b border-white/10 bg-[#020412]/90 backdrop-blur-md z-[70]"
            >
                <button
                    onClick={onClose}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-[#FF3355] transition-colors"
                >
                    <ChevronLeft size={16} /> Torna al Feed
                </button>
            </motion.div>

            {/* HEADER IMMAGINE — altezza fissa responsiva */}
            <div className="relative h-72 md:h-[28rem] w-full shrink-0">
                <img
                    src={article.backgroundImage}
                    className="w-full h-full object-cover opacity-50 contrast-125"
                    alt="Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020412] to-transparent" />
                <div className="absolute bottom-5 left-4 right-4 md:left-6 md:right-6 max-w-2xl mx-auto">
                    <span className="bg-[#700B1A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-3 inline-block">
                        {article.category}
                    </span>
                    {/* Titolo responsivo: 2xl su mobile, 5xl su desktop */}
                    <h1 className="text-2xl md:text-5xl font-black font-serif italic leading-tight md:leading-none mb-1 text-white hyphens-none">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* CORPO — centrato con max-w, padding responsivo */}
            <div className="px-4 md:px-6 py-10 md:py-12 w-full max-w-2xl mx-auto shrink-0">
                <div
                    className="prose prose-invert prose-base md:prose-lg prose-headings:font-serif prose-headings:italic prose-a:text-[#FF3355] prose-p:text-slate-200 prose-p:leading-relaxed font-sans max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cleanContent(article.fullContent)) }}
                />

                <div className="mt-14 pt-8 border-t border-white/10 flex items-center justify-center gap-4">
                    <button
                        onClick={handleFireClick}
                        className={`flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full font-mono text-lg md:text-xl font-black transition-all duration-300 active:scale-95 ${
                            hasFired
                                ? 'bg-[#FF3355]/10 text-[#FF3355] border border-[#FF3355] shadow-[0_0_20px_rgba(255,51,85,0.3)]'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Flame size={22} className={hasFired ? "fill-[#FF3355]" : ""} />
                        <span>{fireCount}</span>
                    </button>

                    <button
                        onClick={handlePenClick}
                        className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#700B1A]/20 text-[#FF3355] border border-[#FF3355]/40 hover:bg-[#FF3355] hover:text-white transition-all duration-300 active:scale-95"
                    >
                        <PenLine size={20} />
                    </button>
                </div>
                <div className="h-24" />
            </div>
        </motion.div>
    );
};

// --- FEED ---
export default function ScrollReader({ issueData, currentUser, onAuthRequired }) {

    const [readingArticle, setReadingArticle] = useState(null);

    const openArticle = (item) => {
        if (item.type === 'article') {
            setReadingArticle(item);
            window.history.pushState({ articleOpen: true }, '');
        }
    };

    const closeArticle = () => {
        // Se c'è uno stato articolo nella cronologia, torna indietro
        // Questo triggera il popstate che poi chiama setReadingArticle(null)
        if (window.history.state?.articleOpen) {
            window.history.back();
        } else {
            setReadingArticle(null);
        }
    };

    useEffect(() => {
        const handlePopState = (e) => {
            // Il browser è tornato indietro: chiudi l'articolo
            if (readingArticle) {
                setReadingArticle(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [readingArticle]);

    if (!issueData || !issueData.articles) return null;

    return (
        <div className="relative w-full bg-[#020412] text-white">

            <AnimatePresence>
                {readingArticle && (
                    <ArticleReader
                        key="reader"
                        article={readingArticle}
                        onClose={closeArticle}
                        currentUser={currentUser}
                        onAuthRequired={onAuthRequired}
                    />
                )}
            </AnimatePresence>

            {/* FEED ARTICOLI — colonna centrata con max-w */}
            <div className="w-full flex flex-col overflow-y-scroll h-screen snap-y snap-mandatory no-scrollbar">
            {issueData.articles.map((item, index) => (
                <article
                    key={index}
                    className={`relative w-full h-screen flex-shrink-0 flex flex-col cursor-pointer group overflow-hidden snap-start ${
                        item.type === 'cover'
                            ? 'justify-center p-8 md:p-14'
                            : 'justify-center p-8 md:p-12'
                    }`}
                    onClick={() => openArticle(item)}
                >
                        <BackgroundImage imageUrl={item.backgroundImage} />

                        {/* COVER */}
                        {item.type === 'cover' && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: false, amount: 0.3 }}
                                className="relative z-10 flex flex-col items-start justify-center"
                            >
                                <span className="inline-block px-3 py-1 bg-[#700B1A] text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-5">
                                    VOL. {issueData.issueNumber} • {issueData.date}
                                </span>
                                {/* Cover title: grande ma non enorme su mobile */}
                                <h1 className="text-5xl md:text-[7rem] font-black font-serif italic leading-[0.85] tracking-tighter mb-3 hyphens-none">
                                    {item.title}
                                </h1>
                                <p className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#FF3355]">
                                    {item.subtitle}
                                </p>
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="relative z-20 mt-6 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.closest('.snap-y').scrollBy({ top: window.innerHeight, behavior: 'smooth' });
                                    }}
                                >
                                    <ChevronDown size={28} className="text-[#FF3355] opacity-50 hover:opacity-100 transition-opacity" />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ANTEPRIMA ARTICOLO */}
                        {item.type === 'article' && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                                viewport={{ once: false, amount: 0.2 }}
                                className="relative z-10 w-full max-w-2xl mx-auto"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl md:text-5xl font-serif font-black text-white/10 select-none">
                                        0{index}
                                    </span>
                                    <span className="px-2 py-1 bg-black/50 border border-white/10 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-[#FF3355]">
                                        {item.category}
                                    </span>
                                </div>
                                {/* Titolo anteprima: responsivo */}
                                <h2 className="text-3xl md:text-5xl font-black font-serif italic mb-4 leading-[0.9] tracking-tight group-hover:text-[#FF3355] transition-colors duration-300 hyphens-none">
                                    {item.title}
                                </h2>
                                <p className="text-sm md:text-base font-sans text-slate-300 leading-relaxed border-l-2 border-[#700B1A] pl-3">
                                    {item.extract}
                                </p>

                            </motion.div>
                        )}
                    </article>
                ))}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .prose p { margin-bottom: 1.5rem; color: #cbd5e1; }
                .prose strong { color: white; }
                .prose h3 {
                    font-family: 'Bodoni Moda', serif;
                    font-style: italic;
                    font-size: 1.6rem;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    line-height: 1;
                    color: white;
                }
                .prose * { color: #cbd5e1 !important; }
                .prose strong { color: white !important; }
                .prose h1, .prose h2, .prose h3 { color: white !important; }
                .prose a { color: #FF3355 !important; }
            `}</style>
        </div>
    );
}