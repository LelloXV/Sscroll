import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

// Disattiviamo i layer pesanti per eliminare i warning e velocizzare
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfReader({ url }) {
    const [numPages, setNumPages] = useState(null);

    return (
        <div className="w-full bg-midnight">
            <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="text-center p-10 font-bold animate-pulse">CARICAMENTO SCROLL...</div>}
                className="flex flex-col items-center w-full"
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <div
                        key={`p_${index + 1}`}
                        className="w-full flex justify-center border-b-4 border-white bg-white"
                    >
                        <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            // Calcola la larghezza per occupare quasi tutto lo schermo
                            width={Math.min(window.innerWidth, 1200)}
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
}