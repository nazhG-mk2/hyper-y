import PropTypes from 'prop-types'
import { memo } from 'react';

const Suggestion = ({
    suggestion,
    onClick,
}) => {
    return (
        <span className="px-4 py-2 transition-all bg-light text-black rounded-md cursor-pointer hover:bg-primary-soft hover:text-white md:whitespace-nowrap"
            onClick={() => onClick(suggestion)}
        >
            {suggestion}
        </span>
    )
}

Suggestion.propTypes = {
    suggestion: PropTypes.string,
    onClick: PropTypes.func,
};

export default memo(Suggestion)
