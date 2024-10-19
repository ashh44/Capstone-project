import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the context
interface UserContextType {
  username: string | null;
  setUsername: Dispatch<SetStateAction<string | null>>;
}

// Provide default values for the context
const defaultUserContext: UserContextType = {
  username: null,
  setUsername: () => {},
};

// Create the context with default values
export const UserContext = createContext<UserContextType>(defaultUserContext);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the username of the logged-in user
  const [username, setUsername] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};
