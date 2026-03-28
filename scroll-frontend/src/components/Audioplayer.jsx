import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ url, title }) {
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);

    // Reset quando cambia edizione
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
    }, [url]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };
        const onLoaded = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('ended', onEnded);
        const onError = () => {
            console.error("Errore caricamento audio");
        };
        audio.addEventListener('error', onError);
        return () => {
            audio.removeEventListener('error', onError);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('ended', onEnded);
        };
    }, [url]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        audioRef.current.muted = !muted;
        setMuted(!muted);
    };

    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    };

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    };

    if (!url) return null;

    return (
        <div className="w-full border-b border-white/10 bg-[#020412]">
            <audio ref={audioRef} src={url} preload="metadata" />
            <div className="max-w-sm md:max-w-2xl mx-auto px-5 py-4 flex items-center gap-4">
                <button onClick={togglePlay}
                        className="w-9 h-9 shrink-0 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#FF3355] hover:border-[#FF3355] transition-all duration-200 active:scale-95">
                    {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                </button>
                <div className="flex-1 flex flex-col gap-2">
                    {title && (
                        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest truncate">
                            {title}
                        </span>
                    )}
                    <div ref={progressRef} onClick={handleProgressClick}
                         className="relative w-full h-[2px] bg-white/10 rounded-full cursor-pointer group">
                        <div className="absolute left-0 top-0 h-full bg-[#FF3355] rounded-full"
                             style={{ width: `${progress}%` }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{ left: `calc(${progress}% - 5px)` }} />
                    </div>
                    <div className="flex justify-between">
                        <span className="font-mono text-[8px] text-slate-600">{formatTime(currentTime)}</span>
                        <span className="font-mono text-[8px] text-slate-600">{formatTime(duration)}</span>
                    </div>
                </div>
                <button onClick={toggleMute} className="text-slate-500 hover:text-white transition-colors shrink-0">
                    {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
            </div>
        </div>
    );
}