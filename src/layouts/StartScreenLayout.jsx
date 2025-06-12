import { Outlet } from 'react-router-dom';
const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

const StartScreenLayout = () => {
    return (
        <div className="flex">
            <div className="flex-1 grid place-content-between h-screen px-12 md:px-8 justify-center">
                <div>
                    <img src="/logo.png" className="hidden md:block h-[1.5rem] antialiased mx-auto mt-[12vh]" alt="" />
                </div>
                <Outlet />
                <footer className="mb-8">
                    {/* <p className="text-xs md:text-center">Powered by HyperCycle Inc.</p> */}
                </footer>
            </div>
            <div
                className={`flex-1 grid xxx place-content-center md:hidden`}
                style={{
                    backgroundImage: `url(${VITE_BASE_ROUTE}/bg-1.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <img src={`${VITE_BASE_ROUTE}/logo_tag_line.png`} alt="" />
            </div>
        </div>
    )
}

export default StartScreenLayout