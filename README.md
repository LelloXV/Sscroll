# SSCROLL.

Sscroll è una web-zine settimanale pensata per chi vuole leggere contenuti approfonditi. L'estetica è minimalista per rimettere al centro il testo e le immagini.

---

## 🛠️ Come funziona?

Il progetto è diviso in due macro-aree che comunicano tra loro:

- **Frontend (React + Vite):** Un'interfaccia single-page (SPA) pensata per la massima leggibilità, con un editor integrato per pubblicare articoli al volo.
- **Backend (Spring Boot):** Gestisce le edizioni, i contenuti e la sicurezza. È compilato come **Native Image (GraalVM)** per garantire tempi di risposta immediati.


## ⚡ Caratteristiche tecniche

* **Avvio istantaneo:** Grazie alla compilazione nativa, il backend non ha il classico "Cold Start" tipico delle applicazioni Java.
* **Sicurezza:** Le rotte di pubblicazione sono protette tramite **Firebase Authentication** e **JWT tokens**. Nessuno può manomettere le edizioni se non ha i permessi da admin.
* **Storage:** Le immagini vengono caricate direttamente su **Cloud Storage** tramite il frontend e gestite in sicurezza grazie a regole CORS dedicate.
