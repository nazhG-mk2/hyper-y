
import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import menuIcon from '../assets/menu.svg';
import LanguageSwitcher from './common/LanguageSwitcher';

const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE;

const Header = ({
  className = '',
}) => {
  const location = useLocation();

  return (
    <header className={`${className} content-center items-center p-4 pb-2 border-b-2 lg:border-b lg:bg-transparent bg-primary border-primary lg:mx-3`}>
      <div className="flex transition-all justify-between w-full items-center">
        <div className="hidden lg:inline drawer-content">
          <label htmlFor="mobile-drawer" className="drawer-button">
            <img src={menuIcon} alt="" />
          </label>
        </div>
        <img className='h-6 hidden lg:block' src="/hyperY/logo.png" alt="" />
        <img className='h-6 block lg:hidden' src="/hyperY/logo2.png" alt="" />
        <LanguageSwitcher />
      </div>
    </header>

  )
};

Header.propTypes = {
  className: PropTypes.string,
};

export default memo(Header);
