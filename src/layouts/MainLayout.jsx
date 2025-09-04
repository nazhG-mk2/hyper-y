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
    const iframeLoading = state?.iframeLoading;
    const { setIframeLoading } = GlobalContext();

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
                        onClick={() => {
                            setIframeLoading(true);
                            hideStudyIframe();
                        }}
                        className="absolute top-6 right-5 z-50 rounded-full bg-red-200 text-black h-6 w-6 shadow-md hover:bg-gray-100"
                        aria-label="Cerrar estudio"
                    >
                        {/* close icon */}
                        ✕
                    </button>
                    {iframeLoading && (
                        // loader
                        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    )}
                    <iframe
                        title="study-iframe"
                        src="https://hyper-ystudygenie.academy"
                        className="w-full h-full"
                        frameBorder="0"
                        onLoad={() => setIframeLoading(false)}
                    />
                </div>
            )}

            <GradientBackground />
        </div>
    )
}

export default MainLayout