import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";


export default function AuthForm({ onSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false)
    const showToast = useToast();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin){
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                //const userCredential =
                await createUserWithEmailAndPassword(auth, email, password);
                //await sendEmailVerification(userCredential.user);
            }
            showToast("Accesso eseguito!", "success");
            onSuccess();
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') setError('Questa email è già registrata.');
            else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') setError('Email o password errate.');
            else if (err.code === 'auth/weak-password' || err.code === 'auth/password-does-not-meet-requirements') setError('Password troppo debole: usa almeno 6 caratteri, con una lettera maiuscola');
            else setError('Si è verificato un errore. Riprova.' + err.code);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Errore durante l'accesso con Google.");
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError("Inserisci la tua email nel campo qui sopra per recuperare la password.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            showToast("Email di reset inviata!", "success");
        } catch (err) {
            if (err.code === 'auth/invalid-email') setError('Inserisci una mail valida.');
            else setError("Errore nel recupero password.");
        }
    };

    return (
        <div className="w-full bg-[#020412] p-8">
            <div className="text-center mb-8">
                <div className="bg-[#700B1A] w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-[0_0_15px_rgba(112,11,26,0.5)]">S</div>
                <h2 className="text-3xl font-serif font-black uppercase text-white">
                    {isLogin ? 'Bentornato' : 'Benvenuto'}
                </h2>
            </div>

            {error && <div className="mb-4 p-3 border border-[#FF3355] text-[#FF3355] text-xs font-mono uppercase text-center">{error}</div>}

            {/* BOTTONE GOOGLE (Super sicuro e veloce) */}
            <button
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all mb-6"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continua con Google
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs font-mono text-slate-500 uppercase">Oppure</span>
                <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* FORM EMAIL/PASSWORD CLASSICO */}
            {/* metti occhio per password*/}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
                <input type="email" required placeholder="Email"
                       className="p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-[#700B1A] transition-all font-mono text-sm"
                       onChange={(e) => setEmail(e.target.value)}/>
                <div className="relative w-full">
                    <input type={showPassword ?"text" : "password" } required placeholder="Password"
                           className="p-4 pr-12 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-[#700B1A] transition-all font-mono text-sm w-full"
                           onChange={(e) => setPassword(e.target.value)}/>

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {isLogin && (
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-center text-[10px] text-slate-500 hover:text-white uppercase tracking-widest mt-1"
                    >
                        Password dimenticata?
                    </button>
                )}
                <button type="submit" disabled={loading}
                        className="bg-[#700B1A] text-white font-bold py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-[#FF3355] transition-all">
                    {loading ? "Attendere..." : (isLogin ? "Accedi" : "Registrati")}
                </button>
            </form>

            <div className="mt-6 text-center border-t border-white/10 pt-6">
                <button onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                }} className="text-white text-xs font-bold uppercase tracking-widest hover:text-[#FF3355] underline underline-offset-4">
                    {isLogin ? "Crea un account" : "Hai già un account? Accedi"}
                </button>
            </div>
        </div>
    );
}