import React from 'react';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-white mb-2">Boda Boda Connect</h1>
        <p className="text-lg text-slate-400 mb-8">Your all-in-one assistant for the road.</p>
        <button
          onClick={onLogin}
          className="bg-brand-red text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-red-700 transition duration-300"
        >
          Login / Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
