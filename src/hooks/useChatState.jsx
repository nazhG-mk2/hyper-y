import { useState, useEffect } from 'react';

// Función para cargar los chats desde el localStorage
const loadChats = () => {
    let chatsInLocalStorage = localStorage.getItem('chats');
    try {
        chatsInLocalStorage = JSON.parse(chatsInLocalStorage);
        const { chats, archivedChats } = chatsInLocalStorage;
        return { chats, archivedChats };
    } catch (e) {
        return { chats: [], archivedChats: [] };
    }
};

// Función para guardar los chats en el localStorage
const saveChats = (chats, archivedChats) => {
    console.log('Guardando chats en localStorage', chats);

    localStorage.setItem('chats', JSON.stringify({ chats, archivedChats }));
};

export const useChatState = () => {
    const [chats, setChats] = useState(loadChats().chats);
    const [archivedChats, setArchivedChats] = useState(loadChats().archivedChats);

    // Guardar en localStorage cada vez que `chats` o `archivedChats` cambian
    useEffect(() => {
        saveChats(chats, archivedChats);
    }, [chats, archivedChats]);

    return { chats, setChats, archivedChats, setArchivedChats };
};
