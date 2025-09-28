import React from 'react';

interface WelcomeScreenProps {
    onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
    return (
        <div>
            <h1>Welcome to Boda Boda Connect</h1>
            <button onClick={onNext}>Get Started</button>
        </div>
    );
};

export default WelcomeScreen;
