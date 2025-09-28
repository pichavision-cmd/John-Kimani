import React, { createContext, useState, useContext, ReactNode } from 'react';

interface EmergencyContextType {
  isPanicMode: boolean;
  triggerPanic: () => void;
  resolvePanic: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPanicMode, setIsPanicMode] = useState(false);

  const triggerPanic = () => {
    setIsPanicMode(true);
    // In a real app, this would also send a notification to a server
    console.log("PANIC MODE ACTIVATED!");
    alert("Emergency alert sent! Your emergency contact has been notified.");
  };

  const resolvePanic = () => {
    setIsPanicMode(false);
    console.log("Panic mode resolved.");
  };

  return (
    <EmergencyContext.Provider value={{ isPanicMode, triggerPanic, resolvePanic }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = (): EmergencyContextType => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
