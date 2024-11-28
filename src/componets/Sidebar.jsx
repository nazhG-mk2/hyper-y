import PropTypes from 'prop-types';
import sideBarStyle from './Sidebar.module.css';
import ChatContext, { useChatContext } from '../contexts/Chat';

const formatDate = (dateString) => {
    const inputDate = new Date(dateString);
    const now = new Date();

    const diffTime = now - inputDate; // Diferencia en ms
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (inputDate >= startOfWeek) return "this week";
    if (inputDate >= startOfMonth) return "this month";

    const month = inputDate.toLocaleString('default', { month: 'long' });
    return `${month} ${inputDate.getFullYear()}`;
};

const formatChatList = (chats) => {
    const groupedChats = {};
    chats.forEach(chat => {
        const date = formatDate(chat.date);
        if (!groupedChats[date]) groupedChats[date] = [];
        groupedChats[date].push(chat);
    });
    return groupedChats;
};

const Sidebar = ({ className = '' }) => {
    const { chats, deleteChat, currentChat, setCurrentChat } = useChatContext();
    const chatsList = formatChatList(chats);

    const handleDeleteChat = (chatId) => {
        deleteChat(chatId);
    };

    const handleSelectChat = (chatId) => {
        const selectedChat = chats.find(chat => chat.id === chatId);
        setCurrentChat(selectedChat); // Actualiza el chat activo
    };

    return (
        <section className={`${className} ${sideBarStyle['sidebar-grid']} gap-2 font-poppins p-5 bg-[#F8F8F8] lg:hidden`}>
            <div className={`${sideBarStyle['chat-list']} overflow-y-auto`}>
                {Object.entries(chatsList).map(([date, chats]) => (
                    <div className="flex flex-col gap-1" key={date}>
                        <p className="px-2 text-secondary text-sm">{date}</p>
                        {chats.map(chat => {
                            return (
                            <div
                                key={chat.id}
                                className={`px-2 group text-black transition-all flex hover:bg-light justify-between items-center rounded-md cursor-pointer ${
                                    currentChat?.id === chat.id ? 'bg-light' : ''
                                }`}
                                onClick={() => handleSelectChat(chat.id)} // Cambia el chat activo
                            >
                                <p
                                    className="py-1 whitespace-nowrap overflow-hidden overflow-ellipsis"
                                    title={chat.chat[0]?.txt || "Unnamed chat"}
                                >
                                    {chat.chat[0]?.txt || "Unnamed chat"}
                                </p>
                                <span
                                    className="text-red-400 invisible group-hover:visible cursor-pointer w-4 h-4 text-center my-auto"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evita activar el `onClick` del padre
                                        handleDeleteChat(chat.id);
                                    }}
                                >
                                    ×
                                </span>
                            </div>
                        )})}
                    </div>
                ))}
            </div>
            <button
                className={`${sideBarStyle['new-chat']} btn rounded-md bg-primary hover:bg-dark border-0 text-white`}
                onClick={() => window.location.href = '/chat'}
            >
                Create new Chat
            </button>
            <p className={`${sideBarStyle['footer']} text-sm`}>Powered by HyperCycle Inc.</p>
        </section>
    );
};

Sidebar.propTypes = {
    className: PropTypes.string,
};

export default Sidebar;
