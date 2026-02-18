import { useState, useRef } from 'react';

export default function AdminUpload() {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null); // Riferimento all'input nascosto

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return alert("Inserisci titolo e file!");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/editions', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert("Pubblicato nelle news!");
                window.location.reload(); // Ricarica per vedere i nuovi dati
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="max-w-md mx-auto p-8 border-4 border-white bg-black font-mono shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-2xl font-black mb-6 uppercase italic">Caricamento Rapido</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-6">
                <input
                    type="text"
                    placeholder="NOME EDIZIONE..."
                    className="p-3 bg-zinc-900 border-2 border-white text-white font-bold outline-none"
                    onChange={(e) => setTitle(e.target.value)}
                />

                <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-500 p-8 text-center cursor-pointer hover:bg-zinc-900 transition"
                >
                    <p className="text-sm font-bold uppercase">
                        {file ? `✅ ${file.name}` : "Trascina qui il PDF o clicca"}
                    </p>
                </div>

                {/* Input reale nascosto */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button type="submit" className="text-white font-black py-4 uppercase text-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    PUBBLICA ORA
                </button>
            </form>
        </div>
    );
}