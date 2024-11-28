import { createContext, useContext, useState } from "react";
import PropTypes from 'prop-types';

const CurrentChatContext = createContext();

export const useCurrentChatContext = () => useContext(CurrentChatContext);

export const CurrentChatProvider = ({ children }) => {
    const [currentChat, setCurrentChat] = useState(null);

    return (
        <CurrentChatContext.Provider value={{ currentChat, setCurrentChat }}>
            {children}
        </CurrentChatContext.Provider>);
};

CurrentChatProvider.propTypes = {
    children: PropTypes.node.isRequired,
};