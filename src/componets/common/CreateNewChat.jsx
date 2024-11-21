import PropTypes from 'prop-types';

const CreateNewChat = ({
    className = '',
}) => {

    return (
        <button className={className}>CreateNewChat</button>
    )
}

CreateNewChat.propTypes = {
    className: PropTypes.string,
};

export default CreateNewChat
