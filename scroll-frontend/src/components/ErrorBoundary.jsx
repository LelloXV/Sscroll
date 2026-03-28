import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Errore inaspettato:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020412] flex flex-col items-center justify-center gap-6 font-mono">
                    <h1 className="text-4xl font-serif font-black italic text-white">
                        Qualcosa è andato storto<span className="text-[#FF3355]">.</span>
                    </h1>
                    <p className="text-slate-400 text-xs uppercase tracking-widest">
                        Ricarica la pagina per continuare
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-[#700B1A] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#FF3355] transition-colors"
                    >
                        Ricarica
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}