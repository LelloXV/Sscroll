import { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase.js';
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { PenLine, UserCircle, LogOut, Trash2, ShieldCheck, ChevronDown, AlertTriangle } from "lucide-react";
import { useToast } from '../context/ToastContext.jsx';

export default function Navbar({ onUploadClick, onCollaborateClick, isAdmin, currentUser, onHomeClick, onPrivacyClick, onArchivioClick }) {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteStep, setDeleteStep] = useState(null); // null | 'confirm' | 'reauth'
    const [password, setPassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [loadingDelete, setLoadingDelete] = useState(false);
    const dropdownRef = useRef(null);
    const showToast = useToast();

    const isGoogleUser = currentUser?.providerData?.[0]?.providerId === 'google.com';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
                setDeleteStep(null);
                setPassword('');
                setDeleteError('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        setDropdownOpen(false);
    };

    const handleDeleteAccount = async () => {
        setLoadingDelete(true);
        setDeleteError('');
        try {
            // Prima prova diretta — funziona se il login è recente
            await deleteUser(currentUser);
            showToast('Account eliminato.', 'success');
            setDropdownOpen(false);
        } catch (err) {
            if (err.code === 'auth/requires-recent-login') {
                if (isGoogleUser) {
                    await auth.signOut();
                    showToast('Sessione scaduta: riaccedi e riprova subito.', 'error');
                    setDropdownOpen(false);
                } else {
                    setDeleteStep('reauth');
                }
            } else {
                setDeleteError('Errore durante la cancellazione. Riprova.');
            }
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleDeleteWithPassword = async () => {
        setLoadingDelete(true);
        setDeleteError('');
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(currentUser, credential);
            await deleteUser(currentUser);
            showToast('Account eliminato.', 'success');
            setDropdownOpen(false);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setDeleteError('Password errata.');
            } else {
                setDeleteError('Errore. Riprova.');
            }
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <nav className="fixed top-0 left-0 overflow-visible w-full z-50 bg-midnight backdrop-blur-md border-b border-white/10 py-4 px-6 flex justify-between items-center transition-all">

            {/* LOGO */}
            <a
                className="flex items-center gap-3 cursor-pointer group"
                href="/"
                onClick={(e) => { e.preventDefault(); if (onHomeClick) onHomeClick(); }}
            >
                <img
                    src="/logo.PNG"
                    alt="Scroll logo"
                    className="w-12 h-12 object-cover rounded-full group-hover:scale-110 transition-transform"
                />
            </a>

            {/* LINKS & ACTION */}
            <div className="flex items-center gap-8">
                <a
                    href="#archivio"
                    onClick={(e) => {
                        e.preventDefault();
                        onArchivioClick?.();
                    }}
                    className="hidden md:block text-slate-400 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                    Archivio
                </a>

                {isAdmin ? (
                    <button
                        onClick={onUploadClick}
                        className="bg-[#700B1A] text-white px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#FF3355] hover:shadow-[0_0_20px_rgba(255,51,85,0.4)] transition-all active:scale-95"
                    >
                        Upload Redazione
                    </button>
                ) : (
                    <button
                        onClick={onCollaborateClick}
                        className="bg-[#700B1A]/20 text-[#FF3355] px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#FF3355] hover:text-white transition-all active:scale-95 border border-[#FF3355]/40"
                    >
                        <PenLine size={24} />
                    </button>
                )}

                {/* DROPDOWN PROFILO */}
                {currentUser && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => { setDropdownOpen(!dropdownOpen); setDeleteStep(null); setDeleteError(''); setPassword(''); }}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                        >
                            <UserCircle size={30} />
                            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-3 w-72 bg-[#020412] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">

                                {/* Email utente */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                                    <div className="bg-[#700B1A] w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                                        {currentUser.email?.[0]?.toUpperCase()}
                                    </div>
                                    <p className="text-white font-mono text-xs truncate">{currentUser.email}</p>
                                </div>

                                {/* Step normale */}
                                {!deleteStep && (
                                    <>
                                        <button onClick={() => { onPrivacyClick?.(); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest border-b border-white/10">
                                            <ShieldCheck size={14} /> Privacy Policy
                                        </button>

                                        <button onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest border-b border-white/10">
                                            <LogOut size={14} /> Disconnetti
                                        </button>

                                        <button onClick={() => setDeleteStep('confirm')}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[#FF3355]/60 hover:text-[#FF3355] hover:bg-[#FF3355]/5 transition-colors text-xs font-mono uppercase tracking-widest">
                                            <Trash2 size={14} /> Elimina account
                                        </button>
                                    </>
                                )}

                                {/* Step conferma */}
                                {deleteStep === 'confirm' && (
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle size={14} className="text-[#FF3355] mt-0.5 shrink-0" />
                                            <p className="text-slate-400 font-mono text-xs leading-relaxed">
                                                Account eliminato definitivamente. Sei sicuro?
                                            </p>
                                        </div>
                                        {deleteError && (
                                            <p className="text-[#FF3355] text-[10px] font-mono uppercase">{deleteError}</p>
                                        )}
                                        <button onClick={handleDeleteAccount} disabled={loadingDelete}
                                                className="w-full bg-[#FF3355] text-white font-bold py-2.5 rounded-lg uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-50">
                                            {loadingDelete ? 'Eliminazione...' : 'Sì, elimina'}
                                        </button>
                                        <button onClick={() => { setDeleteStep(null); setDeleteError(''); }}
                                                className="text-slate-500 hover:text-white text-[10px] font-mono uppercase tracking-widest text-center transition-colors">
                                            Annulla
                                        </button>
                                    </div>
                                )}

                                {/* Step ri-autenticazione (solo email/password, solo se sessione scaduta) */}
                                {deleteStep === 'reauth' && (
                                    <div className="p-4 flex flex-col gap-3">
                                        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                                            Sessione scaduta. Inserisci la password per continuare.
                                        </p>
                                        <input type="password" placeholder="Password"
                                               value={password} onChange={(e) => setPassword(e.target.value)}
                                               className="w-full p-3 bg-black border border-white/10 rounded-lg text-white outline-none focus:border-[#FF3355] font-mono text-xs" />
                                        {deleteError && (
                                            <p className="text-[#FF3355] text-[10px] font-mono uppercase">{deleteError}</p>
                                        )}
                                        <button onClick={handleDeleteWithPassword} disabled={loadingDelete || !password}
                                                className="w-full bg-[#FF3355] text-white font-bold py-2.5 rounded-lg uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-50">
                                            {loadingDelete ? 'Eliminazione...' : 'Conferma'}
                                        </button>
                                        <button onClick={() => { setDeleteStep(null); setDeleteError(''); setPassword(''); }}
                                                className="text-slate-500 hover:text-white text-[10px] font-mono uppercase tracking-widest text-center">
                                            Annulla
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}