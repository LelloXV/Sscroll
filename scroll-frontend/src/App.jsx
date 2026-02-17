import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminUpload from './components/AdminUpload';
import PdfReader from './components/PdfReader';
import Countdown from "./components/Countdown.jsx";

function App() {
    const [editions, setEditions] = useState([]);
    const [currentPdf, setCurrentPdf] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const LAUNCH_DATE = "2026-03-17T00:00:00";

    useEffect(() => {
        fetch('http://localhost:8080/api/editions')
            .then(res => res.json())
            .then(data => {
                // Ordiniamo per data decrescente (la più recente prima)
                const sorted = data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                setEditions(sorted);
                // Impostiamo l'ultima edizione come quella da mostrare subito
                if (sorted.length > 0) setCurrentPdf(sorted[0].pdfUrl);
                setLoading(false);
            })
            .catch(err => {
                console.error("Errore fetch:", err);
                setLoading(false);
            });
    }, []);

    // Calcola la data della prossima uscita (7 giorni dopo l'ultima)
    const getNextReleaseDate = () => {
        if (editions.length === 0) return LAUNCH_DATE;
        const lastUpload = new Date(editions[0].uploadDate);
        return new Date(lastUpload.getTime() + 7 * 24 * 60 * 60 * 1000);
    };

    if (loading) return <div className="bg-midnight min-h-screen"></div>;

    // CASO 1: PRE-LANCIO (Nessun PDF ancora caricato)
    if (editions.length === 0) {
        return (
            <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-6">
                <h1 className="text-9xl md:text-[15rem] font-serif font-black uppercase leading-[0.8]">
                    SCROLL<span className="text-neon-red">.</span>
                </h1>
                <div className="border-t-4 border-b-4 border-white py-10 w-full max-w-4xl">
                    <p className="justify-center mb-6 justify-center text-xl uppercase italic flex text-neon-red animate-pulse">Il countdown per il futuro è iniziato</p>
                    <Countdown targetDate={LAUNCH_DATE} isPreLaunch={true} />
                </div>
                <p className="mt-4 font-mono text-sm text-slate-500 tracking-[0.3em] uppercase">
                    La voce dei giovani • Edizione Settimanale
                </p>
                <button onClick={() => setIsModalOpen(true)} className="mt-20 opacity-20 hover:opacity-100 transition-opacity uppercase text-xs font-bold underline">Admin Access</button>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95">
                        <AdminUpload />
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-white font-bold">X</button>
                    </div>
                )}
            </div>
        );
    }

    // CASO 2: SITO LIVE
    return (
        <div className="min-h-screen bg-midnight text-white">
            <Navbar onUploadClick={() => setIsModalOpen(true)} />

            {/* SEZIONE COUNTDOWN (1/4 di pagina o meno) */}
            <section className="h-[25vh] border-b-4 border-white flex flex-col items-center justify-center bg-zinc-900/50">
                <p className="font-mono text-xs uppercase mb-4 tracking-[0.3em]">Prossima edizione in uscita tra:</p>
                <Countdown targetDate={getNextReleaseDate()} isPreLaunch={false} />
            </section>

            <main className="w-full">
                {/* TITOLO SITO */}
                <div className="text-center py-10 border-b-4 border-white">
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
                        La voce dei <span className="text-neon-lime">giovani.</span>
                    </h1>
                </div>

                {/* GIORNALE ATTUALE */}
                {currentPdf && (
                    <section className="w-full">
                        <PdfReader url={currentPdf} />
                    </section>
                )}

                {/* ARCHIVIO */}
                <section id="archivio" className="p-8 max-w-7xl mx-auto mt-20">
                    <h2 className="text-5xl font-black uppercase mb-10 italic border-l-8 border-neon-lime pl-4">Archivio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {editions.slice(1).map((ed) => (
                            <div
                                key={ed.id}
                                onClick={() => { setCurrentPdf(ed.pdfUrl); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="border-4 border-white p-6 cursor-pointer hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_white]"
                            >
                                <h3 className="text-2xl font-black uppercase italic">{ed.title}</h3>
                                <p className="font-mono opacity-60">{new Date(ed.uploadDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* MODAL UPLOAD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="w-full max-w-xl">
                        <button onClick={() => setIsModalOpen(false)} className="text-white mb-2 uppercase font-bold underline">Annulla</button>
                        <AdminUpload />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;