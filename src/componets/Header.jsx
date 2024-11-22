import PropTypes from 'prop-types';
import xIcon from '../assets/x.svg';
import gearIcon from '../assets/gear.svg';
import { useLocation } from 'react-router-dom';
import backArrowIcon from '../assets/backArrow.svg';
import { memo } from 'react';
import menuIcon from '../assets/menu.svg';

const Header = ({
  className = '',
}) => {
  const location = useLocation();

  const handleClick = () => {
    setTimeout(() => { // animation delay
      if (location.pathname === '/chat') {
        window.location.pathname = '/settings';
      } else {
        window.location.pathname = '/chat';
      }
    }, 200);
  }

  return (
    <header className={`${className} content-center p-4 pb-2 border-b-2 lg:border-b border-yellow lg:mx-3`}>
      <div className="flex transition-all lg:justify-between justify-center w-full">
        <div className="hidden lg:inline drawer-content">
          <label htmlFor="mobile-drawer" className="drawer-button">
            <img src={menuIcon} alt="" />
          </label>
        </div>
        <img className='h-6' src="/logo2.png" alt="" />
        <div></div>
      </div>
    </header>

  )
};

Header.propTypes = {
  className: PropTypes.string,
};

export default memo(Header);
