import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';

const StartScreenLayout = () => {
    return (
        <div className="flex">
            <div className="flex-1 grid place-content-between h-screen px-12 md:px-8 justify-center">
                <div>
                    <img src="/logo.png" className="hidden md:block h-[1.5rem] antialiased mx-auto mt-[12vh]" alt="" />
                </div>
                <Outlet />
                <footer className="mb-8">
                    <p className="text-xs md:text-center">Powered by HyperCycle Inc.</p>
                </footer>
            </div>
            <div className={
                `flex-1 grid place-content-center ${layoutStyles['bg-1']} md:hidden`
            }
                style={{
                    backgroundImage: 'url(/bg-1.png)',
                }}
            >
                <img src="/hyperY/logo_tag_line.png" alt="" />
            </div>
        </div>
    )
}

export default StartScreenLayout