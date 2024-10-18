import PropTypes from 'prop-types';
import xIcon from '../assets/x.svg';
import gearIcon from '../assets/gear.svg';
import { useLocation } from 'react-router-dom';
import { memo } from 'react';

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
    <header className={`${className} flex items-center justify-between p-4 pb-2 border-b-2 border-yellow`}>
      <img className='h-14 brightness-0' src="/logo_tag_line.png" alt="" />
      <div className='flex items-center gap-6'>

        <span className="font-semibold">John Smith</span>

        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>

        <label className="swap swap-rotate p-[2px] transition-all hover:bg-gray-100 rounded-full"
        >
          <input type="checkbox" />
          <img onClick={handleClick} className={`${location.pathname === '/chat' ? 'swap-off' : 'swap-on'} fill-current w-6 h-6`} src={gearIcon} alt="" />
          <img onClick={handleClick} className={`${location.pathname === '/chat' ? 'swap-on' : 'swap-off'}  fill-current w-6 h-6`} src={xIcon} alt="" />
        </label>
      </div>
    </header>

  )
};

Header.propTypes = {
  className: PropTypes.string,
};

export default memo(Header);
