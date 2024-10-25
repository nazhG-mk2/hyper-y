import PropTypes from 'prop-types';
import gearIcon from "../../assets/gear.svg"

const CommonFooter = ({
    className = '',
    showSettings = true,
}) => {
    return (<div className={`flex items-center gap-4 mx-4 border-t pt-4 mt-auto border-secondary ${className}`}>
        <div className="avatar">
            <div className="w-12 rounded-full">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
        </div>
        <span className="font-semibold">John Smith</span>
        <img src={gearIcon} className={`sm:w-6 sm:h-6 ml-auto ${showSettings ? '' : 'hidden'}`} alt=""
            onClick={() => window.location.href = '/settings'}
        />
    </div>
    )
}
CommonFooter.propTypes = {
    className: PropTypes.string,
    showSettings: PropTypes.bool,
};

export default CommonFooter
