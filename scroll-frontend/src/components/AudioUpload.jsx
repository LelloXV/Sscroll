import { useState, useEffect } from 'react';
import { Music, Upload, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useToast } from '../context/ToastContext.jsx';

export default function AudioUpload() {
    const [current, setCurrent] = useState(null); // traccia attuale da Firestore
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        getDoc(doc(db, 'config', 'audio'))
            .then(snap => { if (snap.exists()) setCurrent(snap.data()); })
            .catch(err => console.error(err));
    }, []);

    const handleUpload = async () => {
        if (!file) { showToast("Seleziona un file audio", "error"); return; }
        setLoading(true);
        try {
            const audioRef = ref(storage, `audio/weekly_${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(audioRef, file);
            const url = await getDownloadURL(snapshot.ref);
            await setDoc(doc(db, 'config', 'audio'), { url, title: title || file.name, storagePath: snapshot.ref.fullPath });
            setCurrent({ url, title: title || file.name });
            setFile(null);
            setTitle('');
            showToast("Traccia aggiornata!", "success");
        } catch (err) {
            console.error(err);
            showToast("Errore durante l'upload", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            if (current?.storagePath) {
                await deleteObject(ref(storage, current.storagePath)).catch(() => {});
            }
            await deleteDoc(doc(db, 'config', 'audio'));
            setCurrent(null);
            showToast("Traccia rimossa", "success");
        } catch (err) {
            console.error(err);
            showToast("Errore durante la rimozione", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 bg-white/5 border border-white/10 p-6 font-mono">
            <div className="flex items-center gap-2">
                <Music size={13} className="text-[#FF3355]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Traccia Audio della Settimana</span>
            </div>

            {/* Traccia attuale */}
            {current && (
                <div className="flex items-center justify-between bg-black/40 border border-white/10 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#FF3355] animate-pulse" />
                        <span className="text-xs text-white truncate max-w-[200px]">{current.title}</span>
                    </div>
                    <button onClick={handleDelete} disabled={loading}
                            className="text-slate-500 hover:text-red-500 transition-colors ml-4">
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Upload nuova traccia */}
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Titolo traccia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-2.5 bg-zinc-900 border border-white/20 focus:border-[#FF3355] text-white text-xs outline-none transition-colors"
                />
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-white file:text-black hover:file:bg-[#FF3355] hover:file:text-white transition-all cursor-pointer"
                />
                {file && <span className="text-[10px] text-green-400 uppercase font-bold">✓ {file.name}</span>}
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-[#FF3355] hover:text-white transition-colors disabled:opacity-40"
                >
                    <Upload size={13} />
                    {loading ? 'Caricamento...' : current ? 'Sostituisci traccia' : 'Carica traccia'}
                </button>
            </div>
        </div>
    );
}