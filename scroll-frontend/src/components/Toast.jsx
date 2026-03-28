import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const config = {
        success: { icon: <CheckCircle size={22} />, color: 'border-[#700B1A] text-white', bg: 'bg-[#020412]' },
        error: { icon: <AlertCircle size={22} />, color: 'border-red-500 text-red-500', bg: 'bg-[#020412]' },
        info: { icon: <Info size={22} />, color: 'border-white/20 text-slate-300', bg: 'bg-[#020412]' },
    };

    const current = config[type] || config.info;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    // CAMBIO ANIMAZIONE: Parte da -100 (sopra lo schermo) e scende a 0
                    initial={{ opacity: 0, y: -100, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
                    transition={{ type: "spring", damping: 20, stiffness: 120 }}
                    // CAMBIO POSIZIONE: top-10 invece di bottom-10
                    // CAMBIO GRANDEZZA: px-10 py-6, min-w-[450px], text-sm
                    className={`fixed top-4 left-1/2 z-[300] flex items-center gap-3 px-5 py-4 md:px-10 md:py-6 border-2 ${current.color} ${current.bg} backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[calc(100vw-2rem)] md:w-auto md:min-w-[450px] max-w-[500px] rounded-2xl`}
                >
                    <div className={type === 'success' ? 'text-[#FF3355]' : ''}>
                        {current.icon}
                    </div>

                    {/* Testo più grande (text-sm o text-base) */}
                    <p className="font-mono text-sm uppercase tracking-[0.2em] font-bold flex-1">
                        {message}
                    </p>

                    <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
                        <X size={18} className="opacity-40 hover:opacity-100" />
                    </button>

                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 4, ease: "linear" }}
                        className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${type === 'success' ? 'bg-[#FF3355]' : 'bg-white/20'}`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}