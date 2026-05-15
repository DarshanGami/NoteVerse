import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <div className="text-[150px] font-heading font-bold leading-none select-none">
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-primary-300 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-primary-500 bg-opacity-20 border border-primary-500 border-opacity-30 flex items-center justify-center"
          >
            <span className="text-xl">📝</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-0 -left-4 w-10 h-10 rounded-xl bg-purple-500 bg-opacity-20 border border-purple-500 border-opacity-30 flex items-center justify-center"
          >
            <span className="text-lg">🔍</span>
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-heading font-bold text-dark-text mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-dark-border text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm"
          >
            <FiHome size={16} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
