import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiLock, FiActivity, FiCamera, FiSave, FiShield,
  FiSmartphone, FiTrash2, FiCheck, FiX, FiMonitor,
} from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { settingsApi } from '../api/settings';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'security', label: 'Security', icon: FiLock },
  { id: 'audit', label: 'Audit Logs', icon: FiActivity },
];

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 2FA state
  const [twoFA, setTwoFA] = useState({ enabled: user?.twoFactorEnabled || false, qrCode: null, secret: null });
  const [totpCode, setTotpCode] = useState('');
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') loadSessions();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab]);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await settingsApi.getSessions();
      setSessions(res.data.data || []);
    } catch { toast.error('Failed to load sessions'); }
    finally { setSessionsLoading(false); }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await settingsApi.getAuditLogs();
      setAuditLogs(res.data.data || []);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setAuditLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await settingsApi.updateProfile({ name: profile.name });
      updateUser(res.data.data || { name: profile.name });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await settingsApi.uploadAvatar(formData);
      updateUser({ avatarUrl: res.data.data?.avatarUrl });
      toast.success('Avatar updated');
    } catch { toast.error('Failed to upload avatar'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwords.currentPassword) errs.currentPassword = 'Required';
    if (passwords.newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    if (passwords.newPassword !== passwords.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }
    setPasswordErrors({});
    setPasswordLoading(true);
    try {
      await settingsApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally { setPasswordLoading(false); }
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    try {
      const res = await authApi.setup2fa();
      setTwoFA({ ...twoFA, qrCode: res.data.data?.qrCodeUrl, secret: res.data.data?.secret });
      setShow2FASetup(true);
    } catch { toast.error('Failed to setup 2FA'); }
    finally { setTwoFALoading(false); }
  };

  const handleVerify2FA = async () => {
    if (!totpCode.trim()) return;
    setTwoFALoading(true);
    try {
      await authApi.verify2fa({ code: totpCode });
      setTwoFA({ ...twoFA, enabled: true, qrCode: null });
      setShow2FASetup(false);
      setTotpCode('');
      updateUser({ twoFactorEnabled: true });
      toast.success('2FA enabled successfully');
    } catch { toast.error('Invalid code. Please try again.'); }
    finally { setTwoFALoading(false); }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable two-factor authentication?')) return;
    setTwoFALoading(true);
    try {
      await authApi.disable2fa();
      setTwoFA({ enabled: false, qrCode: null, secret: null });
      updateUser({ twoFactorEnabled: false });
      toast.success('2FA disabled');
    } catch { toast.error('Failed to disable 2FA'); }
    finally { setTwoFALoading(false); }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await settingsApi.revokeSession(sessionId);
      await loadSessions();
      toast.success('Session revoked');
    } catch { toast.error('Failed to revoke session'); }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
            <h1 className="text-2xl font-heading font-bold text-dark-text mb-6">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Tabs */}
              <div className="md:w-48 flex-shrink-0">
                <nav className="space-y-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                        ${activeTab === tab.id
                          ? 'bg-primary-500 bg-opacity-20 text-primary-400'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="card p-6">
                      <h2 className="text-lg font-heading font-semibold text-dark-text mb-4">Profile Information</h2>

                      {/* Avatar */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                            {user?.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(user?.name)
                            )}
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg"
                          >
                            <FiCamera size={12} />
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                        <div>
                          <p className="font-medium text-dark-text">{user?.name}</p>
                          <p className="text-sm text-gray-400">{user?.email}</p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-primary-400 hover:text-primary-300 mt-1 transition-colors"
                          >
                            Change avatar
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <Input
                          label="Full Name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          placeholder="Your full name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="opacity-60"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
                        <Button type="submit" loading={profileLoading} className="flex items-center gap-2">
                          <FiSave size={14} />
                          Save Changes
                        </Button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Change Password */}
                    <div className="card p-6">
                      <h2 className="text-lg font-heading font-semibold text-dark-text mb-4 flex items-center gap-2">
                        <FiLock size={18} className="text-primary-400" />
                        Change Password
                      </h2>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                          error={passwordErrors.currentPassword}
                        />
                        <Input
                          label="New Password"
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          error={passwordErrors.newPassword}
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                          error={passwordErrors.confirmPassword}
                        />
                        <Button type="submit" loading={passwordLoading}>
                          Change Password
                        </Button>
                      </form>
                    </div>

                    {/* 2FA */}
                    <div className="card p-6">
                      <h2 className="text-lg font-heading font-semibold text-dark-text mb-2 flex items-center gap-2">
                        <FiShield size={18} className="text-primary-400" />
                        Two-Factor Authentication
                      </h2>
                      <p className="text-sm text-gray-400 mb-4">
                        Add an extra layer of security to your account using a TOTP authenticator app.
                      </p>

                      {twoFA.enabled ? (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30">
                          <div className="flex items-center gap-3">
                            <FiCheck className="text-green-400" size={20} />
                            <div>
                              <p className="text-sm font-medium text-green-300">2FA is enabled</p>
                              <p className="text-xs text-gray-400">Your account is protected</p>
                            </div>
                          </div>
                          <Button variant="danger" size="sm" onClick={handleDisable2FA} loading={twoFALoading}>
                            Disable
                          </Button>
                        </div>
                      ) : (
                        <div>
                          {!show2FASetup ? (
                            <Button onClick={handleSetup2FA} loading={twoFALoading} variant="secondary">
                              <FiSmartphone size={14} />
                              Enable 2FA
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm text-gray-300">
                                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                              </p>
                              {twoFA.qrCode && (
                                <div className="bg-white p-4 rounded-xl inline-block">
                                  <img src={twoFA.qrCode} alt="QR Code" className="w-48 h-48" />
                                </div>
                              )}
                              {twoFA.secret && (
                                <div className="p-3 bg-dark-bg rounded-lg">
                                  <p className="text-xs text-gray-400 mb-1">Manual entry key:</p>
                                  <code className="text-sm text-primary-400 font-mono">{twoFA.secret}</code>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  value={totpCode}
                                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="Enter 6-digit code"
                                  className="flex-1"
                                />
                                <Button onClick={handleVerify2FA} loading={twoFALoading}>Verify</Button>
                                <Button variant="ghost" onClick={() => setShow2FASetup(false)}>Cancel</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Sessions */}
                    <div className="card p-6">
                      <h2 className="text-lg font-heading font-semibold text-dark-text mb-4 flex items-center gap-2">
                        <FiMonitor size={18} className="text-primary-400" />
                        Active Sessions
                      </h2>
                      {sessionsLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : sessions.length === 0 ? (
                        <p className="text-sm text-gray-400">No active sessions found.</p>
                      ) : (
                        <div className="space-y-3">
                          {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-bg border border-dark-border">
                              <div>
                                <p className="text-sm font-medium text-dark-text">{session.device || 'Unknown device'}</p>
                                <p className="text-xs text-gray-400">{session.ipAddress} • {formatDate(session.createdAt)}</p>
                                {session.isCurrent && (
                                  <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                                    <FiCheck size={10} /> Current session
                                  </span>
                                )}
                              </div>
                              {!session.isCurrent && (
                                <Button variant="danger" size="sm" onClick={() => handleRevokeSession(session.id)}>
                                  Revoke
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="card p-6">
                      <h2 className="text-lg font-heading font-semibold text-dark-text mb-4 flex items-center gap-2">
                        <FiActivity size={18} className="text-primary-400" />
                        Audit Logs
                      </h2>
                      {auditLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : auditLogs.length === 0 ? (
                        <p className="text-sm text-gray-400">No audit logs available.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-dark-border">
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">IP</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {auditLogs.map((log, i) => (
                                <tr key={i} className="border-b border-dark-border hover:bg-dark-bg transition-colors">
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                      ${log.action?.includes('LOGIN') ? 'bg-green-500 bg-opacity-20 text-green-400' : ''}
                                      ${log.action?.includes('LOGOUT') ? 'bg-gray-500 bg-opacity-20 text-gray-400' : ''}
                                      ${log.action?.includes('DELETE') ? 'bg-red-500 bg-opacity-20 text-red-400' : ''}
                                      ${log.action?.includes('CREATE') ? 'bg-blue-500 bg-opacity-20 text-blue-400' : ''}
                                      ${log.action?.includes('UPDATE') ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' : ''}
                                    `}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-gray-400">{log.details || '-'}</td>
                                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">{log.ipAddress || '-'}</td>
                                  <td className="py-3 px-3 text-gray-500">{formatDate(log.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
