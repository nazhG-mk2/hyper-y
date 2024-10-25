import PropTypes from 'prop-types';

const Line = ({
    className = ''
}) => {
    return (<div className={`border-b mx-6 border-secondary my-6 ${className}`}></div>)
}

Line.propTypes = {
    className: PropTypes.string,
};

export default Line
