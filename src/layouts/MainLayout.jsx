import GradientBackground from '../componets/GradientBackground';
import Header from '../componets/Header';
import Sidebar from '../componets/Sidebar';
import SidebarMobile from '../componets/SidebarMobile';
import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';
import { GlobalContext } from '../contexts/Global';

const MainLayout = () => {
    const { state, hideStudyIframe } = GlobalContext();

    const showIframe = state?.showIframe;

    return (
        <div className={`${showIframe ? "grid grid-rows-[auto_1fr] w-screen h-screen" : layoutStyles['main-layout']} drawer`}>
            <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
            <Header className={`${showIframe ? "row-start-1 row-end-2" : layoutStyles['main__header']}`} />

            {/* If not showing iframe, render normal sidebar and main */}
            {!showIframe && (
                <>
                    <SidebarMobile />
                    <Sidebar className='lg:hidden' />
                    <main className={`${layoutStyles['main__content']} !w-full max-w-full`}>
                        <Outlet />
                    </main>
                </>
            )}

            {/* If showing iframe, render it full area */}
            {showIframe && (
                <div className="w-screen row-start-2 row-end-3 relative">
                    <button
                        onClick={() => hideStudyIframe()}
                        className="absolute top-4 right-4 z-50 bg-white text-black rounded px-3 py-1 shadow-md hover:bg-gray-100"
                        aria-label="Cerrar estudio"
                    >
                        X
                    </button>
                    <iframe title="study-iframe" src="http://144.126.215.186/webchat" className="w-full h-full" frameBorder="0" />
                </div>
            )}

            <GradientBackground />
        </div>
    )
}

export default MainLayout