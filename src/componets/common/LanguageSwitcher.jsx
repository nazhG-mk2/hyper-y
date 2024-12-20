import { useTranslation } from 'react-i18next';
import gearIcon from "../../assets/gear.svg"

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="m-1 border-none filter brightness-100">
                <img src={gearIcon} className={`sm:w-6 sm:h-6 my-auto`} alt=""/>
            </div>
            <ul tabIndex={0} className="dropdown-content menu mt-6 bg-light opacity-100 rounded-box z-[1] w-52 p-2 shadow">
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('en')}>English</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('es')}>Español</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('fr')}>Français</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('pt')}>Português</button>
                </li>
                {/* <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('ar')}>العربية</button>
                </li> */}
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('sw')}>Kiswahili</button>
                </li>
                <li>
                    <button className='focus:text-dark' onClick={() => i18n.changeLanguage('ro')}>Română</button>
                </li>
            </ul>
        </div>
    );
};

export default LanguageSwitcher;