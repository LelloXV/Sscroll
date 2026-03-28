import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { setPersistence, browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail, getAdditionalUserInfo, deleteUser } from 'firebase/auth';
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../context/ToastContext.jsx";
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';


export default function AuthForm({ onSuccess, onPrivacyClick }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false)
    const [gdprAccepted, setGdprAccepted] = useState(false);
    const [showGdprGate, setShowGdprGate] = useState(false);

    useEffect(() => {
        setPersistence(auth, browserSessionPersistence).catch(console.error);
    }, []);


    const saveGdprConsent = async (userId, method) => {
        await setDoc(doc(db, 'gdpr_consents', userId), {
            userId,
            email: auth.currentUser?.email,
            acceptedAt: new Date().toISOString(),
            method, // 'email' | 'google'
            policyVersion: '1.0',
            ip: null // non accessibile lato client, lascia null
        });
    };

    const showToast = useToast();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!isLogin && !gdprAccepted) {
                setError('Devi accettare la Privacy Policy per registrarti.');
                setLoading(false);
                return;
            }
            await setPersistence(auth, browserSessionPersistence);
            if (isLogin){
                await signInWithEmailAndPassword(auth, email, password);
            } else {

                //DA GESTIRE SUCCESSIVAMENTE IL SENDEMAILVERIFICATION

                //const userCredential =
                await createUserWithEmailAndPassword(auth, email, password);
                await saveGdprConsent(auth.currentUser.uid, 'email')
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
        setError('');
        try {
            //await setPersistence(auth, browserSessionPersistence);
            const result = await signInWithPopup(auth, provider);
            const details = getAdditionalUserInfo(result);
            if (isLogin) {
                if (details.isNewUser) {
                    await deleteUser(result.user);
                    setIsLogin(false);
                    setShowGdprGate(true);
                    setError("Sembra che tu sia un nuovo utente! Accetta la Privacy Policy per registrarti.");
                } else {
                    showToast("Accesso eseguito!", "success");
                    onSuccess();
                }
            } else {
                if (details.isNewUser) {
                    await saveGdprConsent(result.user.uid, 'google');
                }
                showToast("Registrazione completata!", "success");
                onSuccess();
            }
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                return;
            }
            console.error("Errore Google Auth:", err);
            setError("Errore durante l'accesso con Google.");
        }
    };

    const handleGoogleClick = () => {
        setShowGdprGate(true);
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
            {showGdprGate && !isLogin ? (
                <div className="border border-white/10 rounded-xl p-4 flex flex-col gap-3 mb-6">
                    <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                        Prima di continuare, accetta la{' '}
                        <button type="button" onClick={() => onPrivacyClick?.()}
                                className="text-white underline underline-offset-2 hover:text-[#FF3355] transition-colors">
                            Privacy Policy
                        </button>
                        {' '}e il trattamento dei dati ai sensi del GDPR.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={handleGoogleAuth}
                                className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                            Accetto, continua
                        </button>
                        <button type="button" onClick={() => setShowGdprGate(false)}
                                className="px-4 py-3 border border-white/10 rounded-xl text-slate-500 hover:text-white text-xs font-mono transition-colors">
                            Annulla
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={!isLogin ? handleGoogleClick : handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all mb-6"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continua con Google
                </button>
            )}

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
                {!isLogin && (
                    <div className="flex items-start gap-3">
                        <div
                            onClick={() => setGdprAccepted(!gdprAccepted)}
                            className={`w-4 h-4 mt-0.5 shrink-0 border rounded flex items-center justify-center transition-all cursor-pointer
                            ${gdprAccepted ? 'bg-[#700B1A] border-[#700B1A]' : 'bg-black border-white/20 hover:border-white/50'}`}>
                            {gdprAccepted && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 leading-relaxed select-none">
                            Ho letto e accetto la{' '}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onPrivacyClick?.(); }}
                                className="text-white underline underline-offset-2 hover:text-[#FF3355] transition-colors">
                                Privacy Policy
                            </button>
                            {' '}e il trattamento dei dati ai sensi del GDPR.
                        </span>
                    </div>
                )}


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
                        className={`w-full font-bold py-4 rounded-xl uppercase text-xs tracking-widest transition-all
        ${!isLogin && !gdprAccepted
                            ? 'bg-[#700B1A]/40 text-white/40 cursor-not-allowed'
                            : 'bg-[#700B1A] text-white hover:bg-[#FF3355]'
                        }`}>
                    {loading ? "Attendere..." : (isLogin ? "Accedi" : "Registrati")}
                </button>
            </form>

            <div className="mt-6 text-center border-t border-white/10 pt-6">
                <button onClick={() => {
                    setIsLogin(!isLogin);
                    setGdprAccepted(false);
                    setShowGdprGate(false);
                    setError('');
                }} className="text-white text-xs font-bold uppercase tracking-widest hover:text-[#FF3355] underline underline-offset-4">
                    {isLogin ? "Crea un account" : "Hai già un account? Accedi"}
                </button>
            </div>
        </div>
    );
}