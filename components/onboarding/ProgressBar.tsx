import React from 'react';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const percentage = (currentStep / totalSteps) * 100;
    return (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0' }}>
            <div style={{ width: `${percentage}%`, height: '20px', backgroundColor: 'green' }} />
        </div>
    );
};

export default ProgressBar;
