import GradientBackground from '../componets/GradientBackground';
import Header from '../componets/Header';
import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';

const BasicLayout = () => {
    return (
        <div className={`${layoutStyles['main-layout']} drawer`}>
            <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
            <Header className={layoutStyles['main__header']} />
            <main className={`col-start-1 col-end-3 max-w-[100dvw]`}>
                <Outlet />
            </main>
            <GradientBackground />
        </div>
    )
}

export default BasicLayout