import Header from '../componets/Header';
import Sidebar from '../componets/Sidebar';
import layoutStyles from './Layout.module.css'
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className={`${layoutStyles['main-layout']}`}>
            <Header className={layoutStyles['main__header']} />
            <Sidebar />
            <main className={`${layoutStyles['main__content']}`}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout