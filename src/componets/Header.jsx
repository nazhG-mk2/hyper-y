import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import menuIcon from '../assets/menu.svg';
import LanguageSwitcher from './common/LanguageSwitcher';
import { FaBook, FaEdit, FaRobot } from "react-icons/fa";
import PromptModal from './common/PromptModal';
import { GlobalContext } from '../contexts/Global';
import { defaultPrompt } from '../contexts/Chat';
import { MdBuild } from 'react-icons/md';
import { AiOutlineTool } from 'react-icons/ai';

const VITE_BASE_ROUTE = import.meta.env.VITE_BASE_ROUTE || '';

// Componente para el logo dinámico con Tailwind
const DynamicLogo = ({ className = "" }) => {
  return (
    <div
      className={`h-6 w-32 bg-primary transition-colors duration-300 ${className}`}
      style={{
        maskImage: `url(${VITE_BASE_ROUTE}/logo.png)`,
        WebkitMaskImage: `url(${VITE_BASE_ROUTE}/logo.png)`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'left center',
        WebkitMaskPosition: 'left center',
      }}
    />
  );
};

DynamicLogo.propTypes = {
  className: PropTypes.string,
};

const Header = ({
  className = '',
}) => {
  const [showPromptModal, setShowPromptModal] = useState(false);
  const { state, setPrompt, showStudyIframe } = GlobalContext();
  const prompt = state.prompt || defaultPrompt;
  return (
    <header className={`${className} content-center items-center p-4 pb-2 border-b-2 lg:border-b lg:bg-transparent bg-primary border-primary lg:mx-3`}>
      <div className="flex transition-all justify-between w-full items-center">
        <div className="hidden lg:inline drawer-content">
          <label htmlFor="mobile-drawer" className="drawer-button">
            <img src={menuIcon} alt="" />
          </label>
        </div>
        <div className="flex-none">
          <ul className="menu z-30 menu-horizontal px-1">
            <li>
              <details>
                <summary className="text-white">
                  <MdBuild size={24} title="Tools" />
                  <span>Tools</span></summary>
                <ul className="p-2 text-white bg-slate-700 bg-opacity-35">
                  <li><a>
                    <FaRobot size={20} title="HyperY Core (default)" />
                    <span>HyperY Core</span>
                  </a></li>
                  <li><a onClick={() => { showStudyIframe(); }} className="cursor-pointer">
                    <FaBook size={24} title="Study Assistant" />
                    <span>Study Assistant</span></a></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
        <div className="relative hidden lg:flex w-32 h-fit">
          <DynamicLogo />
        </div>
        <img className='h-6 block lg:hidden' src={`${VITE_BASE_ROUTE}/logo2.png`} alt="" />
        <div className="flex gap-2">
          <FaEdit
            className="w-7 sm:w-6 h-7 sm:h-6 my-auto cursor-pointer text-white -mr-2"
            title="Editar prompt"
            onClick={() => setShowPromptModal(true)}
          />
          <LanguageSwitcher />
        </div>
        <PromptModal open={showPromptModal} setOpen={setShowPromptModal} prompt={prompt} setPrompt={setPrompt} />
      </div>
    </header>

  )
};

Header.propTypes = {
  className: PropTypes.string,
};

export default memo(Header);
