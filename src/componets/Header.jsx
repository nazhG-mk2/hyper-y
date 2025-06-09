import { memo } from 'react';
import PropTypes from 'prop-types';
import LanguageSwitcher from './common/LanguageSwitcher';

const Header = ({
  className = '',
}) => {
  return (
    <header className={`${className} content-center items-center p-4 pb-2 border-b-2 lg:border-b lg:bg-transparent bg-primary border-primary lg:mx-3`}>
      <div className="flex transition-all justify-between w-full items-center">
        <div className="hidden lg:inline drawer-content">
          <label htmlFor="mobile-drawer" className="drawer-button">
          Graphics Programming Tutor
          </label>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Basic HTML Tutor</h1>
          <h2 className="text-lg font-medium text-gray-600 mt-2">The first step in a promising career</h2>
        </div>
        <LanguageSwitcher />
      </div>
    </header>

  )
};

Header.propTypes = {
  className: PropTypes.string,
};

export default memo(Header);
