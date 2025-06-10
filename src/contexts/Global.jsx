import { createContext, useContext, useState } from 'react';
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
    activeChat: null, // Active chat
    prompt: localStorage.getItem('prompt') || '', // System prompt editable
};

// Set the local storage if it doesn't exist
if (!localStorage.getItem('token')) {
    localStorage.setItem('token', initialState.token);
}

export const GlobalProvider = ({ children }) => {
    const [state, setState] = useState({
        ...initialState,
    });

    // Función para actualizar el prompt y guardarlo en localStorage
    const setPrompt = (newPrompt) => {
        setState((prev) => ({ ...prev, prompt: newPrompt }));
        localStorage.setItem('prompt', newPrompt);
    };

    return (
        <context.Provider value={{ state, setPrompt }}>
            {children}
        </context.Provider>
    );
};


GlobalProvider.propTypes = {
    children: PropTypes.node.isRequired,
};