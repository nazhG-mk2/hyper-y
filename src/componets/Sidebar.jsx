import PropTypes from 'prop-types';
import sideBarStyle from './Sidebar.module.css';
import { GlobalContext } from '../contexts/Global';
import { useEffect, useState } from 'react';

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
}

const formatChatList = (chats) => {
    // Agrupar chats por fecha
    const groupedChats = {};
    chats.forEach(chat => {
        const date = formatDate(chat.date);
        if (!groupedChats[date]) groupedChats[date] = [];
        groupedChats[date].push(chat);
    });
    return groupedChats; // Retornar el valor inicial del estado
}


const Sidebar = ({
    className = '',
}) => {
    const { state, setChats } = GlobalContext();
    const { chats } = state;
    const [chatsList, setChatsList] = useState(formatChatList(chats));

    console.log({ chatsList });


    useEffect(() => {
        setChatsList(formatChatList(chats));
    }, [state, chats]);

    return (
        <section className={`${className} ${sideBarStyle['sidebar-grid']} gap-2 font-poppins p-5 bg-[#F8F8F8] lg:hidden`}>
            {
                <>
                    <div className={`${sideBarStyle['chat-list']} overflow-y-auto flex flex-col gap-1`}>
                        {
                            Object.entries(chatsList).map(([date, chats]) => (
                                <div key={date}>
                                    <p className="px-2 text-secondary text-sm">{date}</p>
                                    {chats.map(chat => (
                                        <p
                                            key={chat.id}
                                            className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer relative"
                                        >
                                            {chat.chat[0]?.txt || "Unnamed chat"}
                                            <span className="after:content-['×'] after:text-red-400 after:absolute after:right-2 cursor-pointer"
                                                onClick={() => {
                                                    console.log('Deleting chat:', chat.id);
                                                    console.log('asda', chats.filter((c) => {
                                                        console.log(c.id, chat.id, c.id !== chat.id);
                                                        
                                                        return c.id !== chat.id}));
                                                    
                                                    setChats(chats.filter(c => c.id !== chat.id));
                                                }}
                                            ></span>
                                        </p>
                                    ))}
                                </div>
                            ))
                        }
                        {/* <p className="px-2 text-secondary text-sm">Yesterday</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">YMCA Europe locations</p>
                            <p className="px-2 text-secondary text-sm">September 2024</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">YMCA US locations</p>
                            <p className="px-2 text-secondary text-sm">August 2024</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">Closest to me YMCA locations</p> */}
                    </div>
                    <button className={`${sideBarStyle['new-chat']} btn rounded-md bg-yellow hover:bg-darkYellow border-0 text-black`}
                        onClick={() => window.location.href = '/'}
                    >Create new Chat</button>
                </>
            }
            <p className={`${sideBarStyle['footer']} text-sm`}>Powered by HyperCycle Inc.</p>
        </section>
    )
}

Sidebar.propTypes = {
    className: PropTypes.string,
};

export default Sidebar