export default function PrivacyPolicy({ onClose }) {
    const CONTACT_EMAIL = import.meta.env.VITE_REDAZIONE_EMAIL
    const WEB_SITE = "https://sscroll.it"

    const Section = ({ title, children }) => (
        <div className="mb-8">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#FF3355] mb-3 border-l-2 border-[#700B1A] pl-3">{title}</h3>
            <div className="text-slate-400 font-mono text-xs leading-relaxed space-y-2">{children}</div>
        </div>
    );

    return (
        <div className="w-full bg-[#020412] p-8 max-h-[80vh] overflow-y-auto">
            <div className="mb-8 border-b border-white/10 pb-6">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Documento legale</p>
                <h2 className="text-3xl font-serif font-black uppercase text-white">Informativa sulla Privacy (GDPR)</h2>
                <p className="text-slate-500 font-mono text-xs mt-2">Ai sensi del Regolamento UE 2016/679 (GDPR), questa pagina descrive come vengono gestiti i dati personali degli utenti che scelgono di registrarsi e collaborare con <strong className="text-white">sscroll.it.</strong></p>
            </div>

            <Section title="1. Titolare del trattamento">
                <p>Il titolare del trattamento dei dati è:</p>
                <ul>
                    <li> Nome e Cognome: Tommaso Bressan</li>
                    <li> Contatto Email:  <strong className="text-white">{CONTACT_EMAIL}</strong></li>
                    <li> Sito Web:  <strong className="text-white">{WEB_SITE}</strong></li>
                </ul>
            </Section>
            <Section title="2. Dati raccolti e Finalità">
                <p>Per permetterti di accedere alla redazione e pubblicare i tuoi articoli, raccogliamo:</p>
                <ul>
                    <li> Email e Password: Necessarie per la creazione dell'account e l'accesso all'area riservata. Le password sono criptate e non accessibili dal titolare.</li>
                    <li> Nome/Pseudonimo Autore: Il nome che scegli di associare ai tuoi articoli e che sarà visualizzato pubblicamente sul sito.</li>
                    <li> Dati Tecnici (IP): Raccolti automaticamente dai log del server per motivi di sicurezza e prevenzione di abusi.</li>
                </ul>
            </Section>
            <Section title="3. Base giuridica e Consenso">
                <p>Il trattamento dei dati avviene sulla base del tuo consenso esplicito, fornito spuntando la casella in fase di registrazione. L'invio e la pubblicazione degli articoli avvengono per tua spontanea volontà nell'ambito del servizio offerto da <strong className="text-white">sscroll.it.</strong></p>
            </Section>
            <Section title="4. Responsabilità dei Contentui">
                <p>L'utente che invia un articolo dichiara di esserne l'autore e il legittimo proprietario. Pubblicando su sscroll.it, l'utente si assume la piena responsabilità civile e penale del contenuto inviato, manlevando <strong className="text-white">Tommaso Bressan</strong> da ogni pretesa di terzi.</p>
            </Section>
            <Section title="5. Conservazione e Cancellazione">
                <p>I tuoi dati identificativi saranno conservati finché il tuo account rimarrà attivo.</p>
                <p>Diritto all'Oblio: Puoi richiedere la cancellazione del tuo account scrivendo a redazione@sscroll.it. In caso di cancellazione, i tuoi dati personali verranno eliminati, ma gli articoli già pubblicati potrebbero restare online (eventualmente in forma anonima) per non compromettere l'integrità dell'archivio editoriale del sito.</p>
            </Section>
            <Section title="6. I tuoi diritti (Artt. 15–22 GDPR)">
                <p>Hai il diritto di accedere ai tuoi dati, chiederne la rettifica, la portabilità o la cancellazione in qualsiasi momento contattando il titolare all'indirizzo sopra indicato.</p>
            </Section>

            <div className="border-t border-white/10 pt-6 mt-4">
                <button onClick={onClose}
                        className="w-full bg-[#700B1A] text-white font-bold py-4 rounded-xl uppercase text-xs tracking-widest hover:bg-[#FF3355] transition-all">
                    Ho letto e capito
                </button>
            </div>
        </div>
    );
}