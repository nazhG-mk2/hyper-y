import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';

const StartScreenLayout = () => {
    return (
        <div className="flex">
            <div className="flex-1 grid place-content-between h-screen px-12">
                <div></div>
                <Outlet />
                <footer className="mb-8">
                    <p className="text-xs">Powered by HyperCycle Inc.</p>
                </footer>
            </div>
            <div className={
                `flex-1 grid place-content-center ${layoutStyles.bg1}`
            }>
                <img src="./logo_tag_line.png" alt="" />
            </div>
        </div>
    )
}

export default StartScreenLayout