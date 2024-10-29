import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const context = createContext();

export const GlobalContext = () => useContext(context);

const generateMockToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || generateMockToken(),
};

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