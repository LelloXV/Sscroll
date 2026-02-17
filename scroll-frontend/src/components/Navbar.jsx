export default function Navbar({ onUploadClick }) {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#020412]/80 backdrop-blur-md border-b border-white/10 py-4 px-6 flex justify-between items-center transition-all">

            {/* LOGO: Cerchio Rosso + Scritta Serif */}
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => window.location.reload()}
            >
                <div className="bg-[#700B1A] w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-black shadow-[0_0_15px_rgba(112,11,26,0.5)] group-hover:scale-110 transition-transform">
                    S
                </div>
                <span className="text-2xl font-serif font-black tracking-tighter text-white uppercase italic">
                    Scroll<span className="text-[#FF3355]">.</span>
                </span>
            </div>

            {/* LINKS & ACTION */}
            <div className="flex items-center gap-8">
                <a
                    href="#archivio"
                    className="hidden md:block text-slate-400 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                    Archivio
                </a>

                <button
                    onClick={onUploadClick}
                    className="bg-[#700B1A] text-white px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#FF3355] hover:shadow-[0_0_20px_rgba(255,51,85,0.4)] transition-all active:scale-95"
                >
                    Upload
                </button>
            </div>
        </nav>
    );
}