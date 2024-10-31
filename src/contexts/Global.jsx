import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const context = createContext();

export const GlobalContext = () => useContext(context);


/**
 * Generate a mock token for the user
 * @returns {token: string} e.g. 12abcdef
 */
const generateMockToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null, // User name displayed
    token: localStorage.getItem('token') || generateMockToken(), // User token for chat API
};

// Set the local storage if it doesn't exist
if (!localStorage.getItem('token')) {
    localStorage.setItem('token', initialState.token);
}

export const GlobalProvider = ({ children }) => {
    const [state, updateState] = useReducer((state, newState) => ({ ...state, ...newState }),
        initialState
    );

    return (
        <context.Provider value={{ state, updateState }}>
            {children}
        </context.Provider>
    );
};

GlobalProvider.propTypes = {
    children: PropTypes.node.isRequired,
};