import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import sideBarStyle from './Sidebar.module.css';
import { useChatContext } from '../contexts/Chat';
const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

const Sidebar = ({ className = '' }) => {
    const { t } = useTranslation();
    const { chats, deleteChat, currentChat, setCurrentChat } = useChatContext();
    const modalRef = useRef(null);

    const formatDate = (dateString) => {
        const inputDate = new Date(dateString);
        const now = new Date();

        const diffTime = now - inputDate; // Diferencia en ms
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('today');
        if (diffDays === 1) return t('yesterday');

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        if (inputDate >= startOfWeek) return t('thisWeek');
        if (inputDate >= startOfMonth) return t('thisMonth');

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

    const [chatToDelete, setChatToDelete] = useState(null);

    const handleDeleteChat = (chatId) => {
        deleteChat(chatId);
        window.location.pathname = `${VITE_BASE_ROUTE}/chat/`;
    };

    const handleSelectChat = (chatId) => {
        const selectedChat = chats.find(chat => chat.id === chatId);
        setCurrentChat(selectedChat); // Actualiza el chat activo
    };

    const chatsList = formatChatList(chats);


    return (
        <section className={`${className} ${sideBarStyle['sidebar-grid']} gap-2 font-poppins p-5 bg-[#F8F8F8]`}>
            <div className={`${sideBarStyle['chat-list']} overflow-y-auto`}>
                {chats.length === 0 ? <p className="text-center text-secondary hidden lg:block lg:mt-10">{t('noChats')}</p> : (
                    Object.entries(chatsList).map(([date, chats]) => (
                        <div className="flex flex-col gap-1" key={date}>
                            <p className="px-2 text-secondary text-sm">{date}</p>
                            {chats.map(chat => {
                                return (
                                    <div
                                        key={chat.id}
                                        className={`px-2 group text-black transition-all flex hover:bg-light justify-between items-center rounded-md cursor-pointer ${currentChat?.id === chat.id ? 'bg-light' : ''
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
                                            className="text-red-400 invisible group-hover:visible cursor-pointer text-center"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita activar el `onClick` del padre
                                                // handleDeleteChat(chat.id);
                                                setChatToDelete(() => chat);
                                                modalRef.current.showModal();
                                            }}
                                        >
                                            ×
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )))}
            </div>
            <button
                className={`${sideBarStyle['new-chat']} btn rounded-md max-w-[320px] min-w-[210] bg-primary hover:bg-dark border-0 text-white`}
                onClick={() => window.location.reload()}
            >
                {t('createNewChat')}
            </button>
            <p className={`${sideBarStyle['footer']} text-sm`}>{t('footer')}</p>
            <dialog ref={modalRef} className="modal">
                <div className="modal-box bg-white">
                    <h3 className="font-bold text-lg">
                        {t('deleteChat')}
                    </h3>
                    <p className="p-3 rounded-xl mt-4 mx-auto w-fit border border-gray-400 border-dashed">{
                        chatToDelete?.chat[0]?.txt || "Unnamed chat"
                    }</p>
                    <div className="modal-action">
                        <form method="dialog" className='flex gap-3'>
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn border font-normal bg-white border-gray-950 text-gray-950 hover:bg-gray-100 hover:text-gray-950">Cancel</button>
                            <button className="btn bg-primary border-0 hover:bg-dark transition-colors text-white" onClick={() => handleDeleteChat(chatToDelete.id)}>{t('confirm')}</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>{t('close')}</button>
                </form>
            </dialog>
        </section>
    );
};

Sidebar.propTypes = {
    className: PropTypes.string,
};

export default Sidebar;
