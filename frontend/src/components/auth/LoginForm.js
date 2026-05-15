import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validators';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!validateEmail(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(form.email, form.password, totpRequired ? totpCode : null);
      if (result?.requiresTOTP) {
        setTotpRequired(true);
        toast('Please enter your 2FA code', { icon: '🔐' });
      } else {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed';
      if (msg.includes('TOTP') || msg.includes('2FA')) {
        setTotpRequired(true);
      } else {
        toast.error(msg);
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (totpRequired) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="text-lg font-heading font-semibold text-dark-text">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-400 mt-1">Enter the 6-digit code from your authenticator app</p>
        </div>
        <Input
          label="Authentication Code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="text-center text-2xl tracking-widest"
          maxLength={6}
          autoFocus
        />
        <Button type="submit" loading={loading} fullWidth>
          Verify
        </Button>
        <button
          type="button"
          onClick={() => setTotpRequired(false)}
          className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Back to login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        icon={FiMail}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="you@example.com"
        error={errors.email}
        autoFocus
      />
      <div>
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={FiLock}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Your password"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 mt-[-32px] translate-x-0 translate-y-0 text-gray-400 hover:text-gray-200"
          style={{ position: 'relative', float: 'right', marginTop: '-30px', marginRight: '10px' }}
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input type="checkbox" className="accent-primary-500 rounded" />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">
          Forgot password?
        </Link>
      </div>

      {errors.general && (
        <p className="text-sm text-red-400 text-center">{errors.general}</p>
      )}

      <Button type="submit" loading={loading} fullWidth size="lg">
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
