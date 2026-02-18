import { useState, useEffect } from 'react';

export default function Countdown({ targetDate, isPreLaunch }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                giorni: Math.floor(difference / (1000 * 60 * 60 * 24)),
                ore: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minuti: Math.floor((difference / 1000 / 60) % 60),
                secondi: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (!timeLeft[interval] && interval !== 'secondi') return null;
        return (
            <div key={interval} className="flex flex-col items-center mx-2 md:mx-4">
        <span className={`font-black font-mono ${isPreLaunch ? 'text-5xl md:text-8xl' : 'text-3xl md:text-5xl'}`}>
          {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
        </span>
                <span className="text-xs uppercase font-bold tracking-widest">{interval}</span>
            </div>
        );
    });

    return (
        <div className={`flex items-center justify-center font-mono ${isPreLaunch ? 'text-white' : 'text-neon-lime'}`}>
            {timerComponents.length ? timerComponents : <span className="text-2xl font-black italic">EDIZIONE IN ARRIVO...</span>}
        </div>
    );
}