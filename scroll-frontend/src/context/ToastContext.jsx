import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast'; // Assicurati che il percorso sia corretto

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

    // Funzione per mostrare il toast
    const showToast = useCallback((message, type = 'info') => {
        setToast({ isVisible: true, message, type });
    }, []);

    // Funzione per nasconderlo
    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {/* Il componente Toast è qui, così è unico per tutta l'app */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
};

// Hook per usare il toast nei componenti
export const useToast = () => useContext(ToastContext);