import PropTypes from 'prop-types';
import sideBarStyle from './Sidebar.module.css';
import { useLocation } from 'react-router-dom';

const Sidebar = ({
    className = '',
}) => {
    const location = useLocation();
    return (
        <section className={`${className} ${sideBarStyle['sidebar-grid']} gap-2 font-poppins p-5 bg-[#F8F8F8]`}>
            {
                location.pathname === '/chat' ? (
                    <>
                        <div className={`${sideBarStyle['chat-list']} overflow-y-auto flex flex-col gap-1`}>
                            <p className="px-2 text-secondary text-sm">Today</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">What is YMCA?</p>
                            <p className="px-2 text-secondary text-sm">Yesterday</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">YMCA Europe locations</p>
                            <p className="px-2 text-secondary text-sm">September 2024</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">YMCA US locations</p>
                            <p className="px-2 text-secondary text-sm">August 2024</p>
                            <p className="px-2 py-1 rounded-md hover:bg-lightYellow cursor-pointer">Closest to me YMCA locations</p>
                        </div>
                        <button className={`${sideBarStyle['new-chat']} btn rounded-md bg-yellow hover:bg-darkYellow border-0 text-black`}>Create new Chat</button>
                    </>) : (
                    <>
                        <div className={`${sideBarStyle['chat-list']} overflow-y-auto flex flex-col gap-6 transition-colors`}>
                            <p className="w-full cursor-pointer text-yellow hover:text-darkYellow">Account Settings</p>
                            <p className="w-full cursor-pointer hover:text-darkYellow">App Settings</p>
                            <p className="w-full cursor-pointer hover:text-darkYellow">Privacy Settings</p>
                            <p className="w-full cursor-pointer hover:text-darkYellow">Terms and Conditions</p>
                            <p className="w-full cursor-pointer hover:text-darkYellow">Contact us</p>
                        </div>
                        <button className={`${sideBarStyle['new-chat']} btn rounded-md bg-yellow hover:bg-darkYellow border-0 text-black`}>Back to Chat</button>
                    </>
                )
            }
            <p className={`${sideBarStyle['footer']} text-sm`}>Powered by HyperCycle Inc.</p>
        </section>
    )
}

Sidebar.propTypes = {
    className: PropTypes.string,
};

export default Sidebar