import { useState } from 'react';
import { Plus, Trash2, Send, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new'; // Importa l'editor
import 'react-quill-new/dist/quill.snow.css'; // Importa lo stile dell'editor
import {useToast} from "../context/ToastContext.jsx";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase.js'


// COMPONENTE SPOSTATO FUORI PER NON PERDERE IL FOCUS
const InputField = ({ label, name, value, onChange, placeholder, isTextarea }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
        {isTextarea ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows="4"
                className="p-3 bg-zinc-900 border-2 border-white/20 focus:border-[#FF3355] text-white font-sans outline-none resize-none transition-colors"
                required
            />
        ) : (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="p-3 bg-zinc-900 border-2 border-white/20 focus:border-[#FF3355] text-white font-bold outline-none transition-colors"
                required
            />
        )}
    </div>
);

// Moduli di configurazione per l'editor Quill (Toolbar)
const quillModules = {
    toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

export default function AdminUpload() {
    const [loading, setLoading] = useState(false);
    const [edition, setEdition] = useState({
        title: '',
        issueNumber: '',
        date: ''
    });

    const [articles, setArticles] = useState([
        { type: 'cover', title: '', subtitle: '', backgroundImage: '', tempFile: null }
    ]);

    const showToast = useToast();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleEditionChange = (e) => {
        setEdition({ ...edition, [e.target.name]: e.target.value });
    };

    const handleArticleChange = (index, field, value) => {
        const newArticles = [...articles];
        newArticles[index][field] = value;
        setArticles(newArticles);
    };

    const handleFileChange = (index, file) => {
        const newArticles = [...articles];
        newArticles[index].tempFile = file;
        setArticles(newArticles);
    };

    // Gestione speciale per React Quill (non ha l'evento e.target)
    const handleQuillChange = (index, value) => {
        const newArticles = [...articles];
        newArticles[index]['fullContent'] = value;
        setArticles(newArticles);
    };

    const addArticle = () => {
        setArticles([
            ...articles,
            { type: 'article', category: '', title: '', extract: '', fullContent: '', backgroundImage: '', tempFile: null }
        ]);
    };

    const removeArticle = (index) => {
        if (index === 0) return;
        const newArticles = articles.filter((_, i) => i !== index);
        setArticles(newArticles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. UPLOAD IMMAGINI SU FIREBASE STORAGE
            const updatedArticles = await Promise.all(articles.map(async (article) => {
                if (article.tempFile) {
                    const storageRef = ref(storage, `backgrounds/${Date.now()}_${article.tempFile.name}`);
                    const snapshot = await uploadBytes(storageRef, article.tempFile);
                    const downloadURL = await getDownloadURL(snapshot.ref);
                    // Ritorna l'articolo con l'URL dell'immagine e senza il file temporaneo
                    const { tempFile, ...articleWithoutFile } = article;
                    return { ...articleWithoutFile, backgroundImage: downloadURL };
                }
                return article;
            }));

            // 2. RECUPERO DEL TOKEN FIREBASE E INVIO PAYLOAD AL BACKEND
            const user = auth.currentUser;
            if (!user) {
                showToast("Errore: Non sei autenticato!", "error");
                setLoading(false);
                return;
            }

            // Genera il token JWT fresco
            const token = await user.getIdToken();

            const payload = {
                ...edition,
                articles: updatedArticles
            };

            const response = await fetch(`${API_BASE_URL}/api/editions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast("Edizione pubblicata con successo!", "success");
                window.location.reload();
            } else {
                console.error("Errore Backend:", response.status);
                showToast("Errore durante l'upload!", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Errore durante il caricamento dei file!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 border-4 border-white bg-black font-mono shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-h-[85vh] overflow-y-auto no-scrollbar relative">
            <h2 className="text-3xl font-black mb-8 uppercase italic border-b-2 border-white/20 pb-4">Editor Edizione</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">

                <section className="flex flex-col gap-4 bg-white/5 p-6 border border-white/10">
                    <h3 className="text-[#FF3355] font-bold uppercase tracking-widest text-xs mb-2">1. Info Generali</h3>
                    <InputField label="Nome Interno" name="title" value={edition.title} onChange={handleEditionChange} placeholder="es. Lancio Marzo" />
                    <div className="flex gap-4">
                        <InputField label="Numero Volume" name="issueNumber" value={edition.issueNumber} onChange={handleEditionChange} placeholder="es. 43" />
                        <InputField label="Data Pubblicazione" name="date" value={edition.date} onChange={handleEditionChange} placeholder="es. 24 FEB 2026" />
                    </div>
                </section>

                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
                        <h3 className="text-[#FF3355] font-bold uppercase tracking-widest text-xs">2. Contenuti (Cover + Articoli)</h3>
                        <span className="text-xs text-slate-400">Totale: {articles.length}</span>
                    </div>

                    {articles.map((article, index) => (
                        <div key={index} className="relative flex flex-col gap-4 bg-zinc-950 p-6 border border-white/20">

                            <div className="flex justify-between items-center mb-2">
                                <span className="bg-[#700B1A] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                                    {article.type === 'cover' ? 'COPERTINA' : `ARTICOLO 0${index}`}
                                </span>
                                {article.type !== 'cover' && (
                                    <button type="button" onClick={() => removeArticle(index)} className="text-slate-500 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {article.type === 'cover' && (
                                <>
                                    <InputField label="Titolo Copertina" value={article.title} onChange={(e) => handleArticleChange(index, 'title', e.target.value)} placeholder="CHAOS THEORY" />
                                    <InputField label="Sottotitolo" value={article.subtitle} onChange={(e) => handleArticleChange(index, 'subtitle', e.target.value)} placeholder="Il nuovo disordine mondiale" />
                                </>
                            )}

                            {article.type === 'article' && (
                                <>
                                    <div className="flex gap-4">
                                        <div className="w-1/3">
                                            <InputField label="Categoria" value={article.category} onChange={(e) => handleArticleChange(index, 'category', e.target.value)} placeholder="CULTURA" />
                                        </div>
                                        <div className="w-2/3">
                                            <InputField label="Titolo" value={article.title} onChange={(e) => handleArticleChange(index, 'title', e.target.value)} placeholder="Distruggere il bello" />
                                        </div>
                                    </div>
                                    <InputField label="Abstract" value={article.extract} onChange={(e) => handleArticleChange(index, 'extract', e.target.value)} placeholder="L'estetica del brutto non è una provocazione..." isTextarea={true} />

                                    <div className="flex flex-col gap-1 w-full mt-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contenuto Completo</label>
                                        <div className="bg-white text-black">
                                            <ReactQuill
                                                theme="snow"
                                                value={article.fullContent || ''}
                                                onChange={(value) => handleQuillChange(index, value)}
                                                modules={quillModules}
                                                className="h-64 mb-12" // Spazio per evitare che l'editor venga coperto
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-2 mt-4 p-4 border-2 border-dashed border-white/10 bg-white/5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF3355] flex items-center gap-2">
                                    <ImageIcon size={14} /> Sfondo Articolo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-white file:text-black hover:file:bg-[#FF3355] hover:file:text-white transition-all cursor-pointer"
                                />
                                {article.tempFile && (
                                    <span className="text-[10px] text-green-400 uppercase font-bold">✓ {article.tempFile.name} pronto per l'upload</span>
                                )}
                            </div>

                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addArticle}
                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/30 hover:border-[#FF3355] hover:text-[#FF3355] transition-colors text-sm font-bold uppercase tracking-widest text-slate-300"
                    >
                        <Plus size={18} /> Aggiungi Articolo
                    </button>
                </section>

                <button
                    type="submit"
                    disabled={loading}
                    className="sticky bottom-0 mt-4 flex items-center justify-center gap-3 bg-white text-black font-black py-5 uppercase text-xl hover:bg-[#FF3355] hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] disabled:opacity-50 z-50"
                >
                    {loading ? "Pubblicazione..." : "Pubblica Edizione"} <Send size={20} />
                </button>
            </form>
        </div>
    );
}