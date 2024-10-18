import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const context = createContext();

export const GlobalContext = () => useContext(context);

export const GlobalProvider = ({ children }) => {
    const [state, updateState] = useReducer((state, newState) => ({ ...state, ...newState }), {
        user: null,
        token: null,
    });

    return (
        <context.Provider value={{ state, updateState }}>
            {children}
        </context.Provider>
    );
};

GlobalProvider.propTypes = {
    children: PropTypes.node.isRequired,
};