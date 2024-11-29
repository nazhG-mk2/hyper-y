import smallXIcon from "../assets/xSmall.svg"
import searchIcon from "../assets/search.svg"
import downArrowIcon from "../assets/downArrow.svg"
import { useRef, useState } from "react";
import Line from "./common/Line";
import CommonFooter from "./common/CommonFooter";
import Sidebar from "./Sidebar";

const SidebarMobile = () => {
    // const [archivedChatsIsOpen, setArchivedChatsIsOpen] = useState(false);
    // const searchRef = useRef(null);

    // const [search, setSearch] = useState('');
    // const [chats, setChats] = useState([
    //     { name: 'Launching a youth leadership program', id: 1 },
    //     { name: 'YMCA Funding Programs', id: 2 },
    //     { name: 'Sustainability', id: 3 },
    // ]);

    // const [chatsResults, setChatsResults] = useState(chats);

    return (
        <div className="drawer-side z-30">
            <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-[#F8F8F8] menu min-h-full py-2 px-0 border-r min-w-[80vw] border-secondary border-opacity-50">
                {/* <label htmlFor="mobile-drawer" aria-label="close sidebar" className="drawer-overlay">
                    <img src={xIcon} alt="" />
                    </label> */}
                <Sidebar className="flex-1" />
                {/* <div className="join rounded-full border border-secondary flex p-2 mx-4 gap-2 items-center justify-start">
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
                                <span key={chat.id} className="cursor-pointer transition-colors p-2 px-4 select-none active:bg-light">{chat.name}</span>
                            )) :
                            <span className="text-center text-sm text-secondary">No chats found</span>
                    }
                </div> */}
            </div>
        </div>
    )
}

export default SidebarMobile