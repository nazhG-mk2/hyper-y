import smallXIcon from "../assets/xSmall.svg"
import searchIcon from "../assets/search.svg"
import downArrowIcon from "../assets/downArrow.svg"
import { useRef, useState } from "react";
import Line from "./common/Line";
import CommonFooter from "./common/CommonFooter";

const SidebarMobile = () => {
    const [archivedChatsIsOpen, setArchivedChatsIsOpen] = useState(false);
    const searchRef = useRef(null);

    const [search, setSearch] = useState('');
    const [chats, setChats] = useState([
        { name: 'Launching a youth leadership program', id: 1 },
        { name: 'YMCA Funding Programs', id: 2 },
        { name: 'Sustainability', id: 3 },
    ]);

    const [chatsResults, setChatsResults] = useState(chats);

    return (
        <div className="drawer-side z-30">
            <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-white menu min-h-full py-6 px-0 border-r min-w-[80vw] border-secondary border-opacity-50">
                {/* <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay">
                    <img src={xIcon} alt="" />
                    </label> */}
                <div className="join rounded-full border border-secondary flex p-2 mx-4 gap-2 items-center justify-start">
                    <img src={searchIcon} alt=""
                        onClick={() => searchRef.current.focus()}
                    />
                    <input ref={searchRef} value={search} onChange={(e) => {
                        setSearch(e.target.value);
                        setChatsResults(chats.filter(chat => chat.name.toLowerCase().includes(e.target.value.toLowerCase())));
                    }}
                        className="w-full"
                        type="text"
                        placeholder="Search"
                        name="chat-searh" />
                    <img className="pr-1" src={smallXIcon} alt=""
                        onClick={() => {
                            setSearch('');
                            setChatsResults(chats);
                            // set focus
                            searchRef.current.focus();
                        }}
                    />
                </div>
                <Line />
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold px-4">Recent Chats</h3>
                    {
                        chatsResults.length ?
                            chatsResults.map(chat => (
                                <span key={chat.id} className="cursor-pointer transition-colors p-2 px-4 select-none active:bg-lightYellow">{chat.name}</span>
                            )) :
                            <span className="text-center text-sm text-secondary">No chats found</span>
                    }
                </div>
                <Line />
                <h3 
                    className="text-lg font-semibold px-4 select-none cursor-pointer transition-colors active:text-yellow"
                    onClick={() => { window.location.href = '/dashboard'; }}
                >
                    Dashboard
                </h3>
                <Line />
                <div className="collapse">
                    <input type="checkbox" value={archivedChatsIsOpen} onChange={
                        () => setArchivedChatsIsOpen(!archivedChatsIsOpen)
                    } />
                    <h3 className="collapse-title text-lg flex gap-2 items-center font-semibold px-4 cursor-pointer">
                        Archived Chats
                        <img className={`w-4 h-4 transition-all duration-500 ${archivedChatsIsOpen ? 'rotate-180' : ''}`} src={downArrowIcon} alt="" />
                    </h3>
                    <div className="collapse-content p-0">
                        <span className="cursor-pointer transition-colors py-2 px-4 block w-full select-none active:bg-lightYellow">old chats</span>
                    </div>
                </div>
                <button className="btn border border-yellow bg-transparent font-normal w-fit text-black mx-4 my-6">Create new Chat</button>
                <CommonFooter />
            </div>
        </div>
    )
}

export default SidebarMobile