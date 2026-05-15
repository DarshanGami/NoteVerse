import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit3, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import LoginForm from '../components/auth/LoginForm';
import { API_URL } from '../utils/constants';

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/oauth2/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/auth/oauth2/github`;
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-surface flex-col justify-between p-12 border-r border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <FiEdit3 className="text-white text-lg" />
          </div>
          <span className="text-2xl font-heading font-bold text-primary-500">NoteVerse</span>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-heading font-bold text-dark-text mb-4 leading-tight"
          >
            Your thoughts,
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              beautifully organized
            </span>
          </motion.h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Take notes, stay organized, and use AI to be more productive — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Notes Created', value: '10M+' },
            { label: 'Active Users', value: '50K+' },
            { label: 'AI Summaries', value: '500K+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className="text-2xl font-bold text-primary-400">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <FiEdit3 className="text-white text-lg" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary-500">NoteVerse</span>
          </div>

          <h1 className="text-3xl font-heading font-bold text-dark-text mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to your account to continue</p>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-dark-border
                bg-dark-surface hover:bg-gray-800 text-dark-text text-sm font-medium transition-colors"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-dark-border
                bg-dark-surface hover:bg-gray-800 text-dark-text text-sm font-medium transition-colors"
            >
              <FiGithub size={20} />
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-dark-bg px-3 text-gray-500">or continue with email</span>
            </div>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
