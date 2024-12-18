import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    return (
        <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="btn m-1 bg-white text-black border-none">{t('welcome')}</div>
            <ul tabIndex={0} className="dropdown-content menu mt-5 bg-light rounded-box z-[1] w-52 p-2 shadow">
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('en')}>English</button>
                </li>
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('es')}>Español</button>
                </li>
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('fr')}>Français</button>
                </li>
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('pt')}>Português</button>
                </li>
                {/* <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('ar')}>العربية</button>
                </li> */}
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('sw')}>Kiswahili</button>
                </li>
                <li>
                    <button className='focus:text-gray-500' onClick={() => i18n.changeLanguage('ro')}>Română</button>
                </li>
            </ul>
        </div>
    );
};

export default LanguageSwitcher;