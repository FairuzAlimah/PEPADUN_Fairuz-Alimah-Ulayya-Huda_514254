import React, { createContext, useContext, useState } from 'react';

type GuestContextType = {
  isGuest: boolean;
  setGuest: (val: boolean) => void;
};

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const setGuest = (val: boolean) => setIsGuest(val);
  return <GuestContext.Provider value={{ isGuest, setGuest }}>{children}</GuestContext.Provider>;
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used within GuestProvider');
  return ctx;
}

export default useGuest;
