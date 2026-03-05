const BackgroundImage = ({ imageUrl }) => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020412]">
        <img
            src={imageUrl || "/placeholder-dark.jpg"} // Un fallback locale se l'immagine non carica
            alt="Background"
            className="w-full h-full object-cover opacity-20"
            style={{ filter: 'grayscale(100%) contrast(120%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020412] via-[#020412]/80 to-[#700B1A]/20 mix-blend-multiply" />
    </div>
);