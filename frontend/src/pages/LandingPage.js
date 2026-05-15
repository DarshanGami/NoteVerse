import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit3, FiCpu, FiLock, FiWifi, FiFolder, FiSmartphone } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: FiEdit3, title: 'Rich Text Editor', desc: 'Full-featured TipTap editor with formatting, tables, and more.' },
  { icon: FiCpu, title: 'AI-Powered', desc: 'Summarize, rewrite, and get tag suggestions with AI.' },
  { icon: FiLock, title: 'Secure & Private', desc: 'JWT auth, 2FA, note locking, and encrypted storage.' },
  { icon: FiWifi, title: 'Offline Ready', desc: 'PWA with IndexedDB storage — works without internet.' },
  { icon: FiFolder, title: 'Smart Organization', desc: 'Folders, tags, favourites, and powerful search.' },
  { icon: FiSmartphone, title: 'Cross-Platform', desc: 'Works on desktop, tablet, and mobile browsers.' },
];

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black bg-opacity-30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <FiEdit3 className="text-white text-lg" />
            </div>
            <span className="text-xl font-heading font-bold text-primary-500">NoteVerse</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-lg">
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500 opacity-10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-500 opacity-10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500 bg-opacity-20 border border-primary-500 border-opacity-30 text-primary-400 text-sm font-medium mb-6"
          >
            <FiCpu size={14} />
            AI-Powered Note Taking
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight"
          >
            Capture Every
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-primary-300 bg-clip-text text-transparent"> Thought</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            NoteVerse is your intelligent note-taking companion. Organize, search, collaborate, and leverage AI to be more productive than ever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg shadow-primary-500 shadow-opacity-30 hover:shadow-primary-500 hover:shadow-opacity-50 transition-shadow"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-3 rounded-xl"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-sm text-gray-500"
          >
            No credit card required. Free plan available forever.
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className={`py-20 px-6 ${isDark ? 'bg-dark-surface' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Powerful features to supercharge your note-taking workflow</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 hover:border-primary-500 hover:border-opacity-60 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500 bg-opacity-15 flex items-center justify-center mb-4">
                  <f.icon className="text-primary-500 text-2xl" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400">Start free, upgrade when you need more</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="card p-8 text-left"
            >
              <h3 className="text-2xl font-heading font-bold mb-2">Free</h3>
              <div className="text-5xl font-bold text-primary-500 mb-1">$0</div>
              <p className="text-gray-400 text-sm mb-6">per month, forever</p>
              <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                {['Unlimited notes', '5 folders', 'Basic search', 'PWA (offline)', 'Dark/light theme'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-500 bg-opacity-20 flex items-center justify-center text-primary-400 text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-secondary w-full block text-center py-3 rounded-xl">
                Get Started
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="card p-8 text-left border-primary-500 relative"
            >
              <div className="absolute -top-3 right-6 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2">Pro</h3>
              <div className="text-5xl font-bold text-primary-500 mb-1">$9</div>
              <p className="text-gray-400 text-sm mb-6">per month</p>
              <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                {[
                  'Everything in Free',
                  'AI features (summarize, rewrite)',
                  'Unlimited folders & tags',
                  'Collaboration & sharing',
                  'Export PDF/Markdown',
                  '2FA Security',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-500 bg-opacity-20 flex items-center justify-center text-primary-400 text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-primary w-full block text-center py-3 rounded-xl">
                Start Pro Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users who trust NoteVerse for their daily note-taking.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-3 rounded-xl inline-block">
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2025 NoteVerse. Built with React + Spring Boot.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
