import { useTranslation } from 'react-i18next';
import { FaGlobe } from "react-icons/fa";
import { useEffect } from 'react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // set locale in local storage
        localStorage.setItem('locale', lng);
    }

    // load locale from local storage
    useEffect(() => {
        const locale = localStorage.getItem('locale');
        if (locale) {
            i18n.changeLanguage(locale);
        }
    }, [i18n]);

    return (
        <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="m-1 hover:text-gray-400 border-none filter brightness-100">
                <FaGlobe size={24} className="my-auto hover:text-gray-400 text-white" />
            </div>
            <ul tabIndex={0} className="dropdown-content text-white menu mt-6 bg-opacity-50 bg-slate-400 rounded-box z-[1] w-52 p-2 shadow">
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('en')}>English</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('es')}>Español</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('fr')}>Français</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('pt')}>Português</button>
                </li>
                {/* <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('ar')}>العربية</button>
                </li> */}
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('sw')}>Kiswahili</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => changeLanguage('ro')}>Română</button>
                </li>
            </ul>
        </div>
    );
};

export default LanguageSwitcher;