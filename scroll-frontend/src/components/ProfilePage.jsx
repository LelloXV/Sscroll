import { useState } from 'react';
import { auth } from '../firebase';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { useToast } from '../context/ToastContext.jsx';
import { LogOut, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ProfilePage({ currentUser, onClose, onPrivacyClick }) {
    const [step, setStep] = useState('profile'); // 'profile' | 'confirm'
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const showToast = useToast();

    const isGoogleUser = currentUser?.providerData?.[0]?.providerId === 'google.com';

    const handleSignOut = async () => {
        await auth.signOut();
        showToast('Disconnesso.', 'success');
        onClose();
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            if (isGoogleUser) {
                await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
            } else {
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(currentUser, credential);
            }
            await deleteUser(currentUser);
            showToast('Account eliminato.', 'success');
            onClose();
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Password errata.');
            else if (err.code === 'auth/popup-closed-by-user') setError('Operazione annullata.');
            else setError('Errore durante la cancellazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-[#020412] p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#700B1A] w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(112,11,26,0.5)]">
                    {currentUser?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Account</p>
                    <p className="text-white font-mono text-sm truncate max-w-[200px]">{currentUser?.email}</p>
                </div>
            </div>

            {/* STEP 1: Profilo */}
            {step === 'profile' && (
                <div className="flex flex-col gap-4">
                    <button onClick={() => onPrivacyClick?.()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest border border-white/10 p-4 rounded-xl hover:border-white/30">
                        <ShieldCheck size={14} /> Privacy Policy & GDPR
                    </button>

                    <button onClick={handleSignOut}
                            className="flex items-center justify-center gap-2 w-full bg-black border border-white/10 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">
                        <LogOut size={14} /> Disconnetti
                    </button>

                    <button onClick={() => setStep('confirm')}
                            className="flex items-center justify-center gap-2 w-full border border-[#FF3355]/40 text-[#FF3355]/70 font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-[#FF3355]/10 hover:text-[#FF3355] hover:border-[#FF3355] transition-all mt-2">
                        <Trash2 size={14} /> Elimina account
                    </button>
                </div>
            )}

            {/* STEP 2: Conferma cancellazione */}
            {step === 'confirm' && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3 border border-[#FF3355]/30 bg-[#FF3355]/5 p-4 rounded-xl">
                        <AlertTriangle size={18} className="text-[#FF3355] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-white font-bold text-sm uppercase tracking-widest mb-1">Sei sicuro?</p>
                            <p className="text-slate-400 font-mono text-xs leading-relaxed">
                                Il tuo account verrà eliminato definitivamente. Non potrai recuperarlo.
                            </p>
                        </div>
                    </div>

                    {!isGoogleUser && (
                        <input type="password" placeholder="Conferma con la tua password"
                               value={password} onChange={(e) => setPassword(e.target.value)}
                               className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-[#FF3355] font-mono text-sm" />
                    )}
                    {isGoogleUser && (
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center">
                            Ti verrà chiesto di ri-autenticarti con Google.
                        </p>
                    )}

                    {error && <p className="text-[#FF3355] text-xs font-mono uppercase text-center border border-[#FF3355]/30 p-3 rounded-xl">{error}</p>}

                    <button onClick={handleDeleteConfirm}
                            disabled={loading || (!isGoogleUser && !password)}
                            className="w-full bg-[#FF3355] text-white font-bold py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-red-700 transition-all disabled:opacity-50">
                        {loading ? 'Eliminazione...' : 'Conferma eliminazione'}
                    </button>

                    <button onClick={() => { setStep('profile'); setError(''); setPassword(''); }}
                            className="text-slate-500 hover:text-white text-xs font-mono uppercase tracking-widest text-center">
                        Annulla
                    </button>
                </div>
            )}
        </div>
    );
}