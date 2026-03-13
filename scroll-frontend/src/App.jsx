import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminUpload from './components/AdminUpload';
import Countdown from "./components/Countdown.jsx";
import ScrollReader from "./components/ScrollReadder.jsx";
import CollaborateForm from './components/CollaborateForm';
import AuthForm from "./components/AuthForm.jsx";
import ModalWrapper from "./components/ModalWrapper.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.js';


/**
 * @typedef {Object} Edition
 * @property {string} id
 * @property {string} title
 * @property {string} issueNumber
 * @property {string} date
 * @property {string} uploadDate
 */

/* @type {[Edition[], Function]} */
function App() {
    const [editions, setEditions] = useState([]);
    const [selectedEdition, setSelectedEdition] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const LAUNCH_DATE = "2026-03-17T00:00:00";
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // 1. Fetch edizioni dal backend
    useEffect(() => {
        // Definiamo la funzione all'interno
        const loadEditions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/editions`);
                if (!response.ok) {
                    console.error("Errore Server:", response.status);
                    setLoading(false);
                    return;
                }
                const data = await response.json();
                const sorted = data.sort((a, b) =>
                    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
                );
                setEditions(sorted);
                if (sorted.length > 0) {
                    setSelectedEdition(sorted[0]);
                }
            } catch (err) {
                console.error("Errore di rete/connessione:", err);
            } finally {
                setLoading(false);
            }
        };
        loadEditions().catch(console.error);

    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user && user.email ===  import.meta.env.VITE_ADMIN_EMAIL) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const getNextReleaseDate = () => {
        if (editions.length === 0) return LAUNCH_DATE;
        const lastUpload = new Date(editions[0].uploadDate);
        return new Date(lastUpload.getTime() + 7 * 24 * 60 * 60 * 1000);
    };

    const handleHomeClick = () => {
        // 1. Sblocca forzatamente lo scroll (nel caso un articolo lo avesse bloccato)
        document.body.style.overflow = 'auto';

        // 2. Seleziona l'ultima edizione disponibile
        if (editions.length > 0) {
            setSelectedEdition(editions[0]);
        }

        // 3. Se un articolo è attualmente aperto (tramite pushState in ScrollReader),
        // simuliamo il tasto "indietro" per chiuderlo
        if (window.history.state && window.history.state.articleOpen) {
            window.history.back();
        }

        // 4. Scorre fluidamente in cima alla pagina
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="bg-midnight min-h-screen flex flex-col items-center justify-center font-mono text-white">
                <h1 className="text-4xl md:text-6xl font-serif font-black uppercase mb-4 animate-pulse">
                    SCROLL<span className="text-neon-red">.</span>
                </h1>
                <p className="text-neon-red tracking-[0.3em] uppercase text-sm animate-bounce">
                    Risveglio del server in corso...
                </p>
            </div>
        );
    }

    // --- RENDER PRE-LANCIO ---
    if (editions.length === 0 && !isAdmin) {
        return (
            <ToastProvider>
                <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-6">
                    <h1 className="text-9xl md:text-[15rem] font-serif font-black uppercase leading-[0.8] ">
                        SCROLL<span className="text-neon-red">.</span>
                    </h1>
                    <div className="border-t-4 border-b-4 border-white py-10 w-full max-w-4xl ">
                        <p className="justify-center mb-6 text-xl uppercase italic flex font-mono text-neon-red animate-pulse tracking-widest">
                            Il countdown per il futuro è iniziato
                        </p>
                        <Countdown targetDate={LAUNCH_DATE} isPreLaunch={true} />
                    </div>
                    <p className="mt-4 font-mono text-sm text-slate-500 tracking-[0.3em] uppercase">
                        Edizione Settimanale
                    </p>
                    {currentUser ? (
                        <div className="mt-20 flex flex-col items-center animate-in fade-in duration-500">
                            <p className="font-mono text-xs text-[#FF3355] tracking-[0.3em] uppercase border border-[#FF3355]/30 bg-[#FF3355]/10 px-6 py-3 rounded-full">
                                Troppo presto, aspetta.
                            </p>
                            {/* Tasto per permettere all'utente di sloggarsi se vuole riprovare */}
                            <button
                                onClick={() => auth.signOut()}
                                className="mt-6 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest underline underline-offset-4 transition-colors"
                            >
                                Disconnettiti
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-20 opacity-20 hover:opacity-100 transition-opacity uppercase text-xs font-bold tracking-[0.4em] underline underline-offset-4"
                        >
                            Accesso
                        </button>
                    )}

                    {/* MODAL GESTITO DENTRO IL PRE-LANCIO */}
                    {isModalOpen && (
                        <ModalWrapper onClose={() => setIsModalOpen(false)}>
                            <AuthForm onSuccess={() => setIsModalOpen(false)} />
                        </ModalWrapper>
                    )}
                </div>
            </ToastProvider>

        );
    }

    // --- RENDER SITO LIVE ---
    return (
        <ToastProvider>
            <div className="min-h-screen bg-midnight text-white font-mono">
                <Navbar isAdmin={isAdmin}
                        onUploadClick={() => setIsModalOpen(true)}
                        onCollaborateClick={() => setIsModalOpen(true)}
                        currentUser={currentUser}
                        onHomeClick={handleHomeClick}
                    //showUpload={isAdmin}
                />

                <main className="pt-19 w-full">
                    {/* COUNTDOWN HEADER (1/4 pag) */}
                    <section className="h-[25vh] border-b border-white  border-t border-white flex flex-col items-center justify-center bg-midnight">
                        <p className="font-mono text-xs uppercase mb-4 tracking-[0.4em] ">Prossima edizione in uscita tra:</p>
                        <Countdown targetDate={getNextReleaseDate()} isPreLaunch={false} />
                    </section>


                    <main className="w-full">
                        <div className="text-center py-10 border-b border-white/10">
                            <h1 className="text-7xl md:text-[10rem] font-serif font-black uppercase leading-[0.8] tracking-tight">
                                <span className="text-neon-red italic">Scroll.</span>
                            </h1>
                            <p className="text-neon-red font-mono">
                                Rallenta
                            </p>
                        </div>

                        <section id="reader-section" className="w-full max-w-5xl mx-auto shadow-2xl">
                            {editions.length > 0 ? (
                                <ScrollReader issueData={selectedEdition} currentUser={currentUser} onAuthRequired={() => setIsModalOpen(true)}/>
                            ) : (
                                /* MESSAGGIO VISIBILE SOLO ALL'ADMIN AL PRIMO ACCESSO */
                                <div className="py-32 text-center border-y border-white/10 bg-black/50 mx-4">
                                    <p className="font-mono text-[#FF3355] uppercase tracking-widest mb-4">Database Vuoto</p>
                                    <p className="font-mono text-3xl text-slate-400 italic">
                                        Usa il tasto <strong className="text-white">UPLOAD REDAZIONE</strong> nella Navbar per pubblicare la prima edizione.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* ARCHIVIO */}
                        <section id="archivio" className="p-8 max-w-7xl mx-auto py-32">
                            <h2 className="text-5xl font-serif font-black uppercase mb-16 italic border-l-4 border-[#700B1A] pl-6 tracking-wide">Archivio</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {editions.filter(ed => ed.id !== selectedEdition?.id).map((ed) => (
                                    <div
                                        key={ed.id}
                                        onClick={() => { setSelectedEdition(ed); document.getElementById('reader-section').scrollIntoView({ behavior: 'smooth' }); }}
                                        className="group border border-white/10 p-8 cursor-pointer bg-[#0a0f2c]/20 hover:bg-white hover:text-black transition-all duration-500 shadow-2xl flex flex-col justify-between"
                                    >
                                        <div>
                                        <span className="text-[#700B1A] text-[10px] font-bold tracking-widest uppercase mb-2 block">
                                            VOL. {ed.issueNumber}
                                        </span>
                                            <h3 className="text-3xl font-serif font-bold uppercase leading-tight">{ed.title}</h3>
                                        </div>
                                        <p className="font-mono text-xs opacity-50 mt-4 group-hover:text-black">{new Date(ed.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </main>



                {/* MODAL GENERALE (SFONDO CLICCABILE CORRETTO) */}
                {isModalOpen && (
                    <ModalWrapper onClose={() => setIsModalOpen(false)}
                                  maxWidth={isAdmin ? "max-w-4xl" : currentUser ? "max-w-2xl" : "max-w-md"}>
                        {isAdmin ? (
                            <AdminUpload />
                        ) : currentUser ? (
                            <CollaborateForm userEmail={currentUser.email} onClose={() => setIsModalOpen(false)} />
                        ) : (
                            <AuthForm onSuccess={() => setIsModalOpen(false)} />
                        )}
                    </ModalWrapper>
                )}
            </div>
        </ToastProvider>

    );
}


export default App;