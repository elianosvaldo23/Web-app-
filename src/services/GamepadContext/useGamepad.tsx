import { useContext } from 'react';
import GamepadContext from './GamepadContext';

const useGamepad = () => {
    return useContext(GamepadContext);
};

export default useGamepad;
