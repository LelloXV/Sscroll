import React from 'react';

export default function ModalWrapper({ children, onClose, maxWidth = "max-w-md" }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Sfondo */}
            <div
                className="absolute inset-0 bg-[#020412]/80 backdrop-blur-md cursor-pointer"
                onClick={onClose}
            />

            {/* Contenitore */}
            <div className={`relative z-[210] w-full ${maxWidth} mx-auto transition-all duration-300`}>
                <div className="flex justify-end mb-3">
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-[#FF3355] font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        Chiudi <span className="text-xl leading-none mb-0.5">&times;</span>
                    </button>
                </div>
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}