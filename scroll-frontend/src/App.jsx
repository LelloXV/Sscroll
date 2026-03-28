import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminUpload from './components/AdminUpload';
import Countdown from "./components/Countdown.jsx";
import ScrollReader from "./components/ScrollReadder.jsx";
import CollaborateForm from './components/CollaborateForm';
import AuthForm from "./components/AuthForm.jsx";
import ModalWrapper from "./components/ModalWrapper.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import AudioPlayer from "./components/Audioplayer.jsx";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';
import { ArrowRight, BookOpen } from 'lucide-react';

function App() {
    const [editions, setEditions] = useState([]);
    const [selectedEdition, setSelectedEdition] = useState(null);
    const [modalView, setModalView] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [readerOpen, setReaderOpen] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const LAUNCH_DATE = "2026-03-17T00:00:00";
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const isPreLaunch = !isAdmin && editions.length === 0 && new Date() < new Date(LAUNCH_DATE);

    useEffect(() => {
        const loadEditions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/editions`);
                if (!response.ok) { setLoading(false); return; }
                const data = await response.json();
                const sorted = data.sort((a, b) =>
                    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
                );
                setEditions(sorted);
                if (sorted.length > 0) setSelectedEdition(sorted[0]);
            } catch (err) {
                console.error("Errore di rete:", err);
                setLoadError(true);

            } finally {
                setLoading(false);
            }
        };
        loadEditions().catch(console.error);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setIsAdmin(!!(user && (
                user.email === import.meta.env.VITE_ADMIN_EMAIL ||
                user.email === import.meta.env.VITE_REDAZIONE_EMAIL
            )));
        });
        return () => unsubscribe();
    }, []);

    // Chiude il reader quando si preme back sul browser
    useEffect(() => {
        const handlePopState = (e) => {
            // Articolo aperto: lo gestisce ScrollReader
            if (e.state?.articleOpen) return;

            // Reader aperto: lo gestisce già ScrollReader per chiuderlo,
            // ma dobbiamo assicurarci che il reader sia visibile
            if (e.state?.readerOpen) {
                setReaderOpen(true);
                return;
            }

            // Cambio edizione (avanti o indietro)
            if (e.state?.editionId) {
                const edition = editions.find(ed => ed.id === e.state.editionId);
                if (edition) setSelectedEdition(edition);
                setReaderOpen(false);
                return;
            }

            // Stato null: homepage base
            if (editions.length > 0) setSelectedEdition(editions[0]);
            setReaderOpen(false);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [editions]); // <-- importante: editions come dipendenza per trovare l'edizione giusta

    useEffect(() => {
        if (editions.length > 0) {
            window.history.replaceState({ editionId: editions[0].id }, '');
        }
    }, [editions]);

    const getNextReleaseDate = () => {
        if (editions.length === 0) return LAUNCH_DATE;
        const lastUpload = new Date(editions[0].uploadDate);
        return new Date(lastUpload.getTime() + 7 * 24 * 60 * 60 * 1000);
    };

    const handleHomeClick = () => {
        document.body.style.overflow = 'auto';
        if (editions.length > 0) setSelectedEdition(editions[0]);
        if (window.history.state?.articleOpen || window.history.state?.readerOpen) {
            window.history.back();
        }
        setReaderOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleArchivioClick = () => {
        document.body.style.overflow = 'auto';
        if (window.history.state?.articleOpen || window.history.state?.readerOpen) {
            window.history.back();
        }
        setReaderOpen(false);
        setTimeout(() => {
            document.getElementById('archivio')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    };

    const handleOpenEdition = (edition) => {
        if (edition.id === selectedEdition?.id && readerOpen) return;
        setSelectedEdition(edition);
        setReaderOpen(false);
        window.history.pushState({ editionId: edition.id }, '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="bg-midnight min-h-screen flex flex-col items-center justify-center font-mono text-white">
                <img src="/sscroll.PNG" alt="Scroll logo" className="w-24 h-24 object-cover rounded-full animate-pulse mb-4" />
                <p className="text-neon-red tracking-[0.3em] uppercase text-sm animate-bounce">
                    Risveglio del server in corso...
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-[#020412] flex flex-col items-center justify-center gap-4 font-mono">
                <p className="text-[#FF3355] uppercase tracking-widest text-xs">
                    Errore di connessione
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#700B1A] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#FF3355] transition-colors"
                >
                    Riprova
                </button>
            </div>
        );
    }

    // --- PRE-LANCIO ---
    if (isPreLaunch) {
        return (
            <ToastProvider>
                <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-6">
                    <img src="/sscroll.PNG" alt="Scroll logo" className="w-48 h-48 md:w-72 md:h-72 object-cover rounded-full" />
                    <div className="border-t-4 border-b-4 border-white py-10 w-full max-w-4xl">
                        <p className="justify-center mb-6 text-xl uppercase italic flex font-mono text-neon-red animate-pulse tracking-widest">
                            Il countdown per il futuro è iniziato
                        </p>
                        <Countdown targetDate={LAUNCH_DATE} isPreLaunch={true} />
                    </div>
                    <p className="mt-4 font-mono text-sm text-slate-500 tracking-[0.3em] uppercase">Edizione Settimanale</p>
                    {currentUser ? (
                        <div className="mt-20 flex flex-col items-center animate-in fade-in duration-500">
                            <p className="font-mono text-xs text-[#FF3355] tracking-[0.3em] uppercase border border-[#FF3355]/30 bg-[#FF3355]/10 px-6 py-3 rounded-full">
                                Troppo presto, aspetta.
                            </p>
                            <button onClick={() => auth.signOut()}
                                    className="mt-6 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest underline underline-offset-4 transition-colors">
                                Disconnettiti
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setModalView('auth')}
                                className="mt-20 opacity-20 hover:opacity-100 transition-opacity uppercase text-xs font-bold tracking-[0.4em] underline underline-offset-4">
                            Accesso
                        </button>
                    )}
                    {modalView === 'auth' && (
                        <ModalWrapper onClose={() => setModalView(null)}>
                            <AuthForm onSuccess={() => setModalView(null)} onPrivacyClick={() => setIsPrivacyOpen(true)} />
                        </ModalWrapper>
                    )}
                    {isPrivacyOpen && (
                        <ModalWrapper onClose={() => setIsPrivacyOpen(false)} maxWidth="max-w-2xl">
                            <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
                        </ModalWrapper>
                    )}
                </div>
            </ToastProvider>
        );
    }

    // --- SITO LIVE ---
    return (
        <ToastProvider>
            <div className="min-h-screen bg-midnight text-white font-mono">
                <Navbar
                    isAdmin={isAdmin}
                    onUploadClick={() => setModalView('admin')}
                    onCollaborateClick={() => setModalView(currentUser ? 'collaborate' : 'auth')}
                    currentUser={currentUser}
                    onHomeClick={handleHomeClick}
                    onPrivacyClick={() => setIsPrivacyOpen(true)}
                    onArchivioClick={handleArchivioClick}
                />

                {/* READER */}
                {readerOpen && selectedEdition && (
                    <div className="pt-[73px]">
                        <ScrollReader
                            issueData={selectedEdition}
                            currentUser={currentUser}
                            onAuthRequired={() => setModalView('auth')}
                        />
                    </div>
                )}

                {/* HOMEPAGE */}
                {!readerOpen && (
                    <main className="pt-[73px] w-full">

                        {/* HERO TESTATA */}
                        <div className="flex flex-col items-center justify-center py-14 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#700B1A]/8 to-transparent pointer-events-none" />
                            <img src="/sscroll-removebg.png" alt="Scroll logo" className="w-48 md:w-72 object-contain" />
                            <div className="flex items-center gap-4 mt-4 w-full max-w-xs justify-center">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-[9px] tracking-[0.3em] text-slate-500 uppercase">Rallenta</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>
                        </div>

                        {/* COUNTDOWN */}
                        <div className="py-8 flex flex-col items-center bg-midnight">
                            <p className="font-mono text-[9px] uppercase mb-5 tracking-[0.4em] text-[#FF3355] font-bold">
                                Prossimo articolo tra
                            </p>
                            <Countdown targetDate={getNextReleaseDate()} isPreLaunch={false} />
                        </div>

                        <AudioPlayer
                            url={selectedEdition?.audioUrl}
                            title={selectedEdition?.audioTitle}
                        />

                        {/* CONTENUTO */}
                        <div className="max-w-lg md:max-w-2xl mx-auto px-5 py-12 flex flex-col gap-16">

                            {/* EDIZIONE CORRENTE */}
                            {editions.length > 0 && selectedEdition && (
                                <section>
                                    <div className="flex items-center gap-2 mb-5">
                                        <BookOpen size={11} className="text-[#FF3355]" />
                                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                                            Edizione Corrente
                                        </span>
                                    </div>

                                    {/* Card immagine grande — stile reference */}
                                    <div
                                        onClick={() => {
                                            setReaderOpen(true);
                                            window.history.pushState({ readerOpen: true }, '');
                                        }}
                                        className="group relative rounded-2xl overflow-hidden cursor-pointer
                                                    aspect-[4/5] md:aspect-[3/2]
                                                    active:scale-[0.98] transition-transform duration-200"
                                    >
                                        {/* Immagine di sfondo dalla cover */}
                                        {selectedEdition.articles?.[0]?.backgroundImage ? (
                                            <img
                                                src={selectedEdition.articles[0].backgroundImage}
                                                alt={selectedEdition.title}
                                                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[#0a0f2c]" />
                                        )}

                                        {/* Gradiente */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                        {/* Contenuto in basso */}
                                        <div className="absolute bottom-8 left-7 right-7">
                                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-3 block">
                                                VOL. {selectedEdition.issueNumber} • {selectedEdition.date}
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-serif italic font-black text-white leading-[0.85] tracking-tighter mb-5 hyphens-none">
                                                {selectedEdition.title}
                                            </h2>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[#FF3355] text-[9px] font-bold uppercase tracking-widest mb-1">
                                                        {selectedEdition.articles?.[0]?.subtitle || ''}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-white/40 text-[9px]">
                                                        <BookOpen size={9} />
                                                        <span>
                                                            {(() => {
                                                                const count = selectedEdition.articles?.filter(a => a.type === 'article').length || 0;
                                                                return `${count} ${count === 1 ? 'articolo' : 'articoli'} all'interno`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FF3355] group-hover:border-[#FF3355] transition-all duration-300">
                                                    <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ARCHIVIO */}
                            {editions.length > 1 && (
                                <section id="archivio">
                                    <h3 className="text-2xl font-serif italic font-black text-white mb-1 border-b border-white/10 pb-5">
                                        L'Archivio
                                    </h3>

                                    <div className="flex flex-col">
                                        {editions
                                            .filter(ed => ed.id !== selectedEdition?.id)
                                            .map((ed) => (
                                                <div
                                                    key={ed.id}
                                                    onClick={() => handleOpenEdition(ed)}
                                                    className="group flex items-center justify-between py-6 border-b border-white/5 hover:border-white/15 cursor-pointer transition-all duration-200"
                                                >
                                                    <div>
                                                        <p className="text-[9px] text-[#700B1A] font-bold uppercase tracking-widest mb-1">
                                                            Vol. {ed.issueNumber}
                                                        </p>
                                                        <h4 className="text-2xl font-serif italic font-black text-slate-300 group-hover:text-white transition-colors tracking-tighter">
                                                            {ed.title}
                                                        </h4>
                                                    </div>
                                                    <span className="font-mono text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 ml-4">
                                                        {new Date(ed.uploadDate).toLocaleDateString('it-IT', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </section>
                            )}

                            {/* DB vuoto — solo admin */}
                            {editions.length === 0 && (
                                <div className="py-32 text-center border border-white/10 rounded-2xl">
                                    <p className="font-mono text-[#FF3355] uppercase tracking-widest mb-3 text-xs">Database Vuoto</p>
                                    <p className="font-mono text-slate-500 text-xs italic">
                                        Usa <strong className="text-white">UPLOAD REDAZIONE</strong> nella Navbar.
                                    </p>
                                </div>
                            )}
                        </div>

                    </main>
                )}

                {/* MODALS */}
                {modalView && (
                    <ModalWrapper
                        onClose={() => setModalView(null)}
                        maxWidth={modalView === 'admin' ? "max-w-4xl" : modalView === 'collaborate' ? "max-w-2xl" : "max-w-md"}
                    >
                        {modalView === 'admin' && <AdminUpload />}
                        {modalView === 'collaborate' && currentUser && (
                            <CollaborateForm userEmail={currentUser.email} onClose={() => setModalView(null)} />
                        )}
                        {modalView === 'auth' && (
                            <AuthForm onSuccess={() => setModalView(null)} onPrivacyClick={() => setIsPrivacyOpen(true)} />
                        )}
                    </ModalWrapper>
                )}

                {isPrivacyOpen && (
                    <ModalWrapper onClose={() => setIsPrivacyOpen(false)} maxWidth="max-w-2xl">
                        <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
                    </ModalWrapper>
                )}
            </div>
        </ToastProvider>
    );
}

export default App;