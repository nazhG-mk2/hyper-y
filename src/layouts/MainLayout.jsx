import Header from '../componets/Header';
import Sidebar from '../componets/Sidebar';
import SidebarMobile from '../componets/SidebarMobile';
import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className={`${layoutStyles['main-layout']} drawer`}>
            <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
            <Header className={layoutStyles['main__header']} />
            <SidebarMobile />
            <Sidebar className='lg:hidden' />
            <main className={`${layoutStyles['main__content']} max-w-[100vw]`}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout