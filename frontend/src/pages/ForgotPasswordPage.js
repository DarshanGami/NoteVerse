import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit3, FiMail, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { authApi } from '../api/auth';
import { validateEmail } from '../utils/validators';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password, 3: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success('Reset code sent to your email');
      setStep(2);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!otp.trim()) errs.otp = 'OTP is required';
    if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setStep(3);
      toast.success('Password reset successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <FiEdit3 className="text-white text-lg" />
          </div>
          <span className="text-2xl font-heading font-bold text-primary-500">NoteVerse</span>
        </div>

        <div className="card p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-heading font-bold text-dark-text mb-2">Forgot password?</h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset code.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  icon={FiMail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                  autoFocus
                />
                <Button type="submit" loading={loading} fullWidth size="lg">
                  Send Reset Code
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-2xl font-heading font-bold text-dark-text mb-2">Reset password</h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter the code sent to <strong className="text-dark-text">{email}</strong> and your new password.
              </p>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <Input
                  label="Reset Code (OTP)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  error={errors.otp}
                  autoFocus
                />
                <Input
                  label="New Password"
                  type="password"
                  icon={FiLock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  error={errors.newPassword}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={FiLock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  error={errors.confirmPassword}
                />
                <Button type="submit" loading={loading} fullWidth size="lg">
                  Reset Password
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FiArrowLeft size={14} />
                  Back
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiCheck size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-dark-text mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button fullWidth size="lg">Sign In</Button>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <FiArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
