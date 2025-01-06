import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

// Función para cargar los chats desde el localStorage
const loadChats = () => {
    let chatsInLocalStorage = localStorage.getItem('chats');

    try {
        chatsInLocalStorage = JSON.parse(chatsInLocalStorage);
        const { chats, archivedChats } = chatsInLocalStorage;
        // console.log('Loading 📤', chats);
        return { chats: chats || [], archivedChats };
    } catch (e) {
        return { chats: [], archivedChats: [] };
    }
};

// Función para guardar los chats en el localStorage
const saveChats = (chats, archivedChats = []) => {
    // console.log('Saving 📥', chats);
    localStorage.setItem('chats', JSON.stringify({ chats: chats || [], archivedChats }));
};

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [archivedChats, setArchivedChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);

    const AddToCurrentChat = (newMsg) => {
        const date = new Date().toISOString();
        setChats((prevChats) => {
            console.log({ prevChats, newMsg, currentChat });
            
            if (!currentChat) {
                const id = `id-${Math.random().toString(36).slice(2, 9)}`;
                const _newChat = { id, date, chat: [newMsg] };
                setCurrentChat(_newChat);
                return [...prevChats, _newChat];
            }

            const _currentChat = [...currentChat.chat];
            _currentChat.push(newMsg);
            const _newChat = { ...currentChat, date, chat: _currentChat };
            
            setCurrentChat(_newChat);

            const newChats = prevChats.map(chat => chat.id === _newChat.id ? _newChat : chat).sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            saveChats(newChats);
            return newChats
        });
    };

    const deleteChat = (chatId) => {
        const newChats = chats.filter(chat => chat.id !== chatId);
        setChats(newChats);
        saveChats(newChats);
    }

    // Cargar chats desde localStorage cuando el componente se monte
    useEffect(() => {
        const { chats: loadedChats, archivedChats: loadedArchivedChats } = loadChats();
        setChats(() => loadedChats);
        setArchivedChats(loadedArchivedChats);
    }, []);

    return (
        <ChatContext.Provider value={{ chats, AddToCurrentChat, deleteChat, archivedChats, setArchivedChats, currentChat, setCurrentChat }}>
            {children}
        </ChatContext.Provider>
    );
};

ChatProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ChatContext;
