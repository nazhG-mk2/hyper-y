import mailIcon from '../assets/mail.svg';
import locationIcon from '../assets/location.svg';
import worldIcon from '../assets/world.svg';
import dialogIcon from '../assets/dialog.svg';
import Line from '../componets/common/Line';
import changeThemeIcon from '../assets/changeTheme.svg';
import changeLanguageIcon from '../assets/changeLanguage.svg';
import iIcon from '../assets/i.svg';
import bookIcon from '../assets/book.svg';
import questionIcon from '../assets/question.svg';
import policyIcon from '../assets/policy.svg';
import downArrowIcon from "../assets/downArrow.svg"

const SettingsMobile = () => {
    return (
        <div className="hidden md:flex md:flex-col gap-4 p-8 pb-4 font-poppins font-light">
            <div className="flex items-center gap-4 border-b pb-4 mt-auto border-secondary">
                <div className="avatar">
                    <div className="w-10 rounded-full">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
                <span className="font-semibold">John Smith</span>
            </div>
            <p className="text-sm text-secondary">
                Account
            </p>
            <div className="flex items-center gap-2">
                <img src={mailIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Email</span>
                <span className="text-secondary justify-self-end ml-auto">J.Smith08@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={locationIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Location</span>
                <span className="text-secondary justify-self-end ml-auto">London, UK</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={worldIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>App Language</span>
                <span className="text-secondary justify-self-end ml-auto">English</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={dialogIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Archived Chats</span>
            </div>
            <Line className='!m-0' />
            <p className="text-sm text-secondary">
                App Settings
            </p>
            <div className="flex items-center justify-between gap-2">
                <span className='font-normal flex'><img src={changeThemeIcon} className="w-5 h-5 mr-2" alt="" /> Color Scheme</span>
                <div className="flex relative items-center pl-4">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <img className='opacity-75 w-4 h-4' src={downArrowIcon} alt="" />
                    </div>
                    <select className="bg-transparent appearance-none outline-none pl-1 text-secondary focus:text-secondary placeholder-secondary">
                        <option>System</option>
                        <option>Light</option>
                        <option>Dark</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <img src={changeLanguageIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Chat Language</span>
                <span className="text-secondary justify-self-end ml-auto">English</span>
            </div>
            <Line className='!m-0' />
            <p className="text-sm text-secondary">
                About
            </p>
            <div className="flex items-center gap-2">
                <img src={iIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Help Center</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={bookIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Terms and Conditions</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={questionIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Contact us</span>
            </div>
            <div className="flex items-center gap-2">
                <img src={policyIcon} className="w-5 h-5" alt="" />
                <span className='font-normal'>Privacy Policy</span>
            </div>
            <p className="text-center text-xs mt-3 text-secondary">
                Hyper-Y for Android <br />
                9.2024.2
            </p>
        </div>)
}


export default SettingsMobile;