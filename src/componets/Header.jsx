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
    <header className={`${className} content-center items-center p-4 md:px-2 pb-2 border-b-2 lg:border-b lg:bg-transparent bg-primary border-primary`}>
      <div className="flex transition-all justify-between w-full items-center">
        {!state.showIframe && (
          <div className="hidden lg:inline drawer-content">
            <label htmlFor="mobile-drawer" className="drawer-button">
              <img className="brightness-0" src={menuIcon} alt="" />
            </label>
          </div>
        )}
        <div className="relative hidden lg:flex w-32 h-fit">
          <DynamicLogo />
        </div>
        <img className='h-6 block lg:hidden' src={`${VITE_BASE_ROUTE}/logo2.png`} alt="" />
        <div className="flex gap-2">
          <FaEdit
           size={24}
            className=" my-auto cursor-pointer hover:text-gray-400 text-white"
            title="Editar prompt"
            onClick={() => setShowPromptModal(true)}
          />
          <LanguageSwitcher />
          <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="hover:text-gray-400 text-white m-1 bg-none border-none">
              <MdBuild size={24} title="Tools" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu mt-6 bg-opacity-50 bg-slate-400 rounded-box z-1 w-52 p-2 shadow-sm text-white">
              <li><a>
                <FaRobot size={20} title="HyperY Core (default)" />
                <span>HyperY Core</span>
              </a></li>
              <li><a onClick={() => { showStudyIframe(); }} className="cursor-pointer">
                <FaBook size={24} title="Study Assistant" />
                <span>Study Assistant</span></a></li>
            </ul>
          </div>
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
