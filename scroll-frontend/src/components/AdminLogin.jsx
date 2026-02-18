import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const auth = getAuth();

        try {
            // Firebase gestisce crittografia e sicurezza
            await signInWithEmailAndPassword(auth, email, password);
            alert("Accesso Autorizzato, Redattore.");
            onLoginSuccess(); // Funzione che chiude il modal e mostra i tasti admin
        } catch (err) {
            console.error(err);
            alert("Credenziali errate. Accesso negato.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-[#020412] border border-white/10 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
                <div className="bg-[#700B1A] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black mx-auto mb-4">S</div>
                <h2 className="text-2xl font-serif font-black uppercase tracking-tighter text-white">Area Redazione</h2>
                <p className="text-slate-500 text-xs font-mono mt-2 uppercase">Identificati per pubblicare</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email</label>
                    <input
                        type="email"
                        placeholder="admin@scroll.it"
                        className="p-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-[#700B1A] transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="p-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-[#700B1A] transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-[#700B1A] text-white font-bold py-4 rounded-xl uppercase text-sm tracking-widest hover:bg-[#FF3355] transition-all disabled:opacity-50"
                >
                    {loading ? "Verifica in corso..." : "Entra nel sistema"}
                </button>
            </form>
        </div>
    );
}