import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatContext = createContext();

export const defaultPrompt = `
You are an expert on the YMCA globally at all scales of the organization.
You provide concise and clear answers.
If you do not have a clear answer to what is being asked, you should guide the user to provide more information so that you can eventually provide either a very clear answer to the user's query, or direct them to a definite resource where they are likely to find what they need.
In this initial response, you are to just provide a short response, in 5 lines or less, unless you are certain that you have the precise answer that the user is looking for, in which case a longer response is allowed.
You will have the opportunity to perform a database search later in the process, so all the more reason to be brief here.
You always respond in the language of the initial prompt from the user.
You do not need to ask the user whether to perform a database search related to the query because it is going to be performed anyway.
If you cannot provide useful general information indicate that you do not know and that you will look more into it for the user.
If you can provide useful general information, just state it and indicate that you will look for more details.
`;

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
