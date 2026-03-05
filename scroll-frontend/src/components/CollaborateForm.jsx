import { useState } from 'react';
import { useToast } from "../context/ToastContext.jsx";

export default function CollaborateForm({ userEmail, onClose, articleTitle }) {
    const [text, setText] = useState("");
    const showToast = useToast();

    const handleSend = () => {
        if (!text.trim()) {
            showToast("Scrivi qualcosa prima di inviare", "error");
            return;
        }

        const emailRedazione = import.meta.env.VITE_ADMIN_EMAIL;
        const subject = encodeURIComponent(
            articleTitle ? `Risposta a: ${articleTitle}` : `Bozza Articolo da: ${userEmail}`
        );
        const body = encodeURIComponent(`${text}\n\n---\nAutore: ${userEmail}`);
        window.location.href = `mailto:${emailRedazione}?subject=${subject}&body=${body}`;
        onClose();
    };

    return (
        <div className="w-full bg-[#020412] border border-white/10 p-8 shadow-2xl rounded-xl">
            <h2 className="text-3xl font-serif font-black uppercase mb-2 text-white italic">
                {articleTitle ? "Rispondi all'articolo" : "La tua "}
                {!articleTitle && <span className="text-[#FF3355]">Voce.</span>}
            </h2>
            <p className="font-mono text-xs text-slate-400 mb-6 uppercase tracking-widest">
                La redazione valuterà la tua bozza. Sarai ricontattato a: <br/>
                <span className="text-white font-bold">{userEmail || "Devi fare il login"}</span>
            </p>

            <textarea
                className="w-full h-64 bg-black border border-white/10 p-4 text-slate-200 outline-none focus:border-[#700B1A] transition-colors font-sans text-lg resize-none mb-4 rounded-lg"
                placeholder="Incolla qui il tuo testo o scrivi la tua bozza..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button
                onClick={handleSend}
                disabled={!userEmail}
                className="w-full bg-[#700B1A] text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#FF3355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Invia alla Redazione
            </button>
        </div>
    );
}