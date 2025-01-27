import React, {createContext, useContext, useState, useEffect} from "react";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({children}) => {
    const [isLogged, setIsLogged] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                phoneNumber,
                setPhoneNumber,
                sessionId,
                setSessionId,
            }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalProvider;
