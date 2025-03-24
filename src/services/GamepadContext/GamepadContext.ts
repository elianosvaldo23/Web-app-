import { createContext } from 'react';

const GamepadContext = createContext<{
    on: (event: string, callback: (data?: any) => void) => void;
    off: (event: string, callback: (data?: any) => void) => void;
} | null>(null);

export default GamepadContext;
