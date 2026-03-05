import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Flame, PenLine } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import ModalWrapper from "./ModalWrapper.jsx";
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import CollaborateForm from './CollaborateForm';
import {useToast} from "../context/ToastContext.jsx";


const BackgroundImage = ({ imageUrl }) => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020412]">
        <img
            src={imageUrl} // Fallback se l'URL è vuoto
            alt="Background"
            className="w-full h-full object-cover opacity-20"
            style={{ filter: 'grayscale(100%) contrast(120%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020412] via-[#020412]/80 to-[#700B1A]/20 mix-blend-multiply" />
    </div>
);

// --- 1. IL LETTORE DETTAGLIO ---
const ArticleReader = ({ article, onClose, currentUser, onAuthRequired }) => {
    const containerRef = useRef(null);
    const [hidden, setHidden] = useState(false);
    const [fireCount, setFireCount] = useState(0);
    const [hasFired, setHasFired] = useState(false); // Controlla se l'utente attuale ha già cliccato
    const [showReplyForm, setShowReplyForm] = useState(false);
    const showToast = useToast();

    // Manteniamo lo scroll interno per il modale dell'articolo
    const { scrollY } = useScroll({ container: containerRef });

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        const articleRef = doc(db, 'article_stats', article.title);
        getDoc(articleRef).then(docSnap => {
            if (docSnap.exists()) {
                setFireCount(docSnap.data().fires || 0);
            }
        }).catch(err => console.error("Errore lettura db:", err));
        const localMemory = localStorage.getItem(`scroll_fire_${article.title}`);
        if (currentUser) {
            const userStorageKey = `scroll_fire_${currentUser.uid}_${article.title}`;
            const hasUserFired = localStorage.getItem(userStorageKey);
            setHasFired(hasUserFired === 'true');
        } else {
            // Se non è loggato, resetta lo stato (così non vede i like di altri o di sessioni passate)
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
        if (currentUser) {
            const userStorageKey = `scroll_fire_${currentUser.uid}_${article.title}`;
            if (newState) {
                localStorage.setItem(userStorageKey, 'true');
            } else {
                localStorage.removeItem(userStorageKey);
            }
        }
        const articleRef = doc(db, 'article_stats', article.title);
        try {
            await setDoc(articleRef, {
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

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // RISOLUZIONE OVERLAP: Usiamo `fixed` ma con `top-[80px]` (o l'altezza della tua Navbar)
            // per far iniziare l'overlay appena sotto la Navbar principale.
            className="fixed left-0 right-0 bottom-0 top-[73px] z-40 bg-[#020412] text-slate-200 flex flex-col overflow-y-auto no-scrollbar"
            ref={containerRef}
        >
            {showReplyForm && (
                <ModalWrapper
                    onClose={() => setShowReplyForm(false)}
                    maxWidth="max-w-2xl"
                >
                    <CollaborateForm
                        userEmail={currentUser?.email}
                        onClose={() => setShowReplyForm(false)}
                        articleTitle={article.title}
                    />
                </ModalWrapper>
            )}

            {/* NAVBAR INTELLIGENTE */}
            <motion.div
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: "-100%", opacity: 0 }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sticky top-0 left-0 w-full flex items-center px-6 py-4 border-t border-white/10 bg-[#020412]/90 backdrop-blur-md z-50"
            >
                <button
                    onClick={onClose}
                    className="flex items-center text-xs font-bold uppercase tracking-widest hover:text-[#FF3355] transition-colors"
                >
                    <ChevronLeft size={18} /> Torna al Feed
                </button>
            </motion.div>

            {/* Header Immagine Articolo */}
            <div className="relative h-96 w-full shrink-0 mt-0">
                <img
                    src={article.backgroundImage}
                    className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                    alt="Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020412] to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 max-w-3xl mx-auto">
                    <span className="bg-[#700B1A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white mb-4 inline-block shadow-lg shadow-red-900/50">
                        {article.category}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-serif italic leading-none mb-2 text-white">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Corpo del Testo */}
            <div className="px-6 py-12 max-w-3xl mx-auto w-full min-w-0 shrink-0">
                <div
                    className="prose prose-invert prose-lg prose-headings:font-serif prose-headings:italic prose-a:text-[#FF3355] prose-p:text-slate-300 prose-p:leading-relaxed font-sans break-words whitespace-pre-wrap max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.fullContent }}
                />

                <div className="mt-16 pt-10 border-t border-white/10 flex items-center justify-center gap-6">
                    <button
                        onClick={handleFireClick}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full font-mono text-xl font-black transition-all duration-300 active:scale-95 ${
                            hasFired ? 'bg-[#FF3355]/10 text-[#FF3355] border border-[#FF3355] shadow-[0_0_20px_rgba(255,51,85,0.3)]' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Flame size={28} className={hasFired ? "fill-[#FF3355]" : ""} />
                        <span>{fireCount}</span>
                    </button>

                    <button
                        onClick={handlePenClick}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-slate-400 border border-white/10 hover:bg-white hover:text-black transition-all duration-300 active:scale-95 text-white"
                    >
                        <PenLine size={24} />
                    </button>
                </div>
                <div className="h-32" />
            </div>
        </motion.div>
    );
};

// --- 2. IL FEED PRINCIPALE ---
export default function ScrollReader({ issueData, currentUser, onAuthRequired }) {
    const [readingArticle, setReadingArticle] = useState(null);

    useEffect(() => {
        const handlePopState = () => {
            // Se l'utente preme "Indietro" sul browser/telefono, chiudiamo l'articolo.
            setReadingArticle(null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const openArticle = (item) => {
        if (item.type === 'article') {
            // Aggiungiamo uno stato fittizio alla cronologia del browser
            window.history.pushState({ articleOpen: true }, "");
            setReadingArticle(item);
        }
    };

    const closeArticle = () => {
        // Se clicchiamo "Torna al Feed", forziamo il browser a tornare indietro.
        // Questo attiverà in automatico l'evento 'popstate' qui sopra, che metterà readingArticle a null!
        window.history.back();
    };

    // RISOLUZIONE SCROLL: Usiamo lo scroll globale della finestra, niente più riferimenti a container interni
    const { scrollYProgress } = useScroll();

    if (!issueData || !issueData.articles) return null;

    return (
        <div className="relative w-full bg-[#020412] text-white flex flex-col border-y border-white/10 md:border-none">

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

            <div className="w-full flex flex-col">
                {issueData.articles.map((item, index) => (
                    <article
                        key={index}
                        // Ogni articolo mantiene un'altezza minima per dare l'effetto copertina, ma fa parte del flusso normale della pagina
                        className={`relative w-full flex flex-col p-8 md:p-16 cursor-pointer group border-b border-white/10 overflow-hidden ${
                            item.type === 'cover'
                                ? 'min-h-[55vh] md:min-h-[45vh] justify-center'
                                : 'min-h-[50vh] md:min-h-[30vh] justify-center py-24'
                        }`}
                        onClick={() => openArticle(item)}
                    >
                        <BackgroundImage imageUrl={item.backgroundImage} />

                        {/* COVER SECTION */}
                        {item.type === 'cover' && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: false, amount: 0.3 }}
                                className="relative z-10 flex flex-col items-start flex-1 justify-center"
                            >
                                <span className="inline-block px-3 py-1 bg-[#700B1A] text-white text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                                    VOL. {issueData.issueNumber} • {issueData.date}
                                </span>
                                <h1 className="text-6xl md:text-[8rem] font-black font-serif italic leading-[0.85] tracking-tighter mb-4">
                                    {item.title}
                                </h1>
                                <p className="font-mono text-sm uppercase tracking-widest text-[#FF3355]">{item.subtitle}</p>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="relative z-20 mt-8 cursor-pointer self-start"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evita che il clic si propaghi all'intero div
                                        // Scrolla giù di una schermata in modo fluido
                                        window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <ChevronDown size={32} className="text-[#FF3355] opacity-50 hover:opacity-100 transition-opacity" />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ARTICLE PREVIEW SECTION */}
                        {item.type === 'article' && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                                viewport={{ once: false, amount: 0.2 }}
                                className="relative z-10 max-w-3xl w-full"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-6xl font-serif font-black text-white/10 select-none">0{index}</span>
                                    <span className="px-3 py-1 bg-black/50 border border-white/10 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-[#FF3355]">
                                        {item.category}
                                    </span>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-black font-serif italic mb-6 leading-[0.9] tracking-tight group-hover:text-[#FF3355] transition-colors duration-300">
                                    {item.title}
                                </h2>

                                <p className="text-lg md:text-xl font-sans text-slate-300 leading-relaxed border-l-2 border-[#700B1A] pl-4">
                                    {item.extract}
                                </p>

                            </motion.div>
                        )}
                    </article>
                ))}
            </div>

            {/* BARRA PROGRESSO FLUIDA: Ora ancorata al fondo dello schermo intero */}
            {!readingArticle && (
                <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5 z-40 pointer-events-none">
                    <motion.div
                        className="h-full bg-[#FF3355] origin-left"
                        style={{ scaleX: scrollYProgress }}
                    />
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .prose p { margin-bottom: 1.5rem; }
                .prose strong { color: white; }
                .prose h3 { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 2rem; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1; color: white; }
            `}</style>
        </div>
    );
}