import React from 'react';

interface InfoCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4">
            <div className="text-brand-green">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-lg font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default InfoCard;
