import { useState, useRef } from 'react';
import { useToast } from "../context/ToastContext.jsx";
import { auth } from '../firebase';
import { CheckCircle, Paperclip, X } from 'lucide-react';

export default function CollaborateForm({ userEmail, onClose, articleTitle }) {
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const showToast = useToast();

    const handleSend = async () => {
        if (!text.trim()) {
            showToast("Scrivi qualcosa prima di inviare", "error");
            return;
        }

        if (text.length > 50000) {
            showToast("Testo troppo lungo (max 50.000 caratteri)", "error");
            return;
        }

        const allowedTypes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'];
        if (file && !allowedTypes.includes(file.type)) {
            showToast("Tipo file non supportato", "error");
            return;
        }

        setLoading(true);
        try {
            // FormData per supportare testo + file insieme
            const formData = new FormData();
            formData.append("userEmail", userEmail);
            formData.append("text", text);
            if (articleTitle) formData.append("articleTitle", articleTitle);
            if (file) formData.append("file", file);

            if (file && file.size > 10 * 1024 * 1024) {
                showToast("File troppo grande (max 10MB)", "error");
                return;
            }

            const token = await auth.currentUser.getIdToken();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaborate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // ← aggiunta
                    // NON aggiungere Content-Type, il browser lo gestisce da solo con FormData
                },
                body: formData
                // NON impostare Content-Type: il browser lo fa da solo con il boundary
            });

            if (!response.ok) throw new Error();
            setSent(true);
        } catch (e) {
            showToast("Errore nell'invio, riprova", "error");
            console.log(e)
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="w-full bg-[#020412] border border-white/10 p-8 shadow-2xl rounded-xl flex flex-col items-center justify-center gap-6 min-h-[300px] text-center">
                <CheckCircle size={48} className="text-[#FF3355]" />
                <h2 className="text-3xl font-serif font-black uppercase text-white italic">Grazie!</h2>
                <p className="font-mono text-xs text-slate-400 uppercase tracking-widest leading-relaxed">
                    Il tuo articolo è stato inviato.<br />
                    La redazione ti ricontatterà a:<br />
                    <span className="text-white font-bold mt-1 block">{userEmail}</span>
                </p>
                <button onClick={onClose} className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline underline-offset-4">
                    Chiudi
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#020412] border border-white/10 p-8 shadow-2xl rounded-xl">
            <h2 className="text-3xl font-serif font-black uppercase mb-2 text-white italic">
                {articleTitle ? "Rispondi all'articolo" : "La tua "}
                {!articleTitle && <span className="text-[#FF3355]">Voce.</span>}
            </h2>
            <p className="font-mono text-xs text-slate-400 mb-6 uppercase tracking-widest">
                La redazione valuterà la tua bozza. Sarai ricontattato a: <br />
                <span className="text-white font-bold">{userEmail || "Devi fare il login"}</span>
            </p>

            <textarea
                className="w-full h-48 bg-black border border-white/10 p-4 text-slate-200 outline-none focus:border-[#700B1A] transition-colors font-sans text-lg resize-none mb-4 rounded-lg"
                placeholder="Incolla qui il tuo testo o scrivi la tua bozza..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            {/* ALLEGATO */}
            <div className="mb-4">
                {file ? (
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Paperclip size={13} className="text-[#FF3355]" />
                            <span className="font-mono text-[10px] text-white truncate max-w-[220px]">{file.name}</span>
                            <span className="font-mono text-[9px] text-slate-500">
                                ({(file.size / 1024).toFixed(0)} KB)
                            </span>
                        </div>
                        <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-500 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        <Paperclip size={13} /> Allega un file (opzionale)
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
            </div>

            <button
                onClick={handleSend}
                disabled={!userEmail || loading}
                className="w-full bg-[#700B1A] text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#FF3355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Invio in corso..." : "Invia alla Redazione"}
            </button>
        </div>
    );
}