import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Download, Trash2, Lock, Save, 
  AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff,
  Flame, Calendar, Target, Clock, Dna, Compass, Heart
} from 'lucide-react';
import { 
  getProfile, updateProfile, changePassword, exportUserData, 
  deleteAccount, resendVerification, type ProfileData,
  getMentorStyle, setMentorStyle, MENTOR_STYLES, type AIMentorStyle
} from '../lib/api';
import { useUserStore } from '../store/useUserStore';

export const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>('profile');
  
  // Profile edit state
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // Mentor style state
  const [currentMentorStyle, setCurrentMentorStyle] = useState<AIMentorStyle | null>(null);
  const [savingMentor, setSavingMentor] = useState(false);
  
  const { logout } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadMentorStyle();
  }, []);

  const loadMentorStyle = async () => {
    const style = await getMentorStyle();
    setCurrentMentorStyle(style);
  };

  const handleMentorChange = async (style: AIMentorStyle) => {
    setSavingMentor(true);
    const success = await setMentorStyle(style);
    if (success) {
      setCurrentMentorStyle(style);
      setSaveMessage({ type: 'success', text: 'Mentor style updated!' });
    } else {
      setSaveMessage({ type: 'error', text: 'Failed to update mentor style' });
    }
    setSavingMentor(false);
  };

  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      setProfile(data);
      setName(data.user.name);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage(null);
    
    const result = await updateProfile(name);
    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Profile updated!' });
      loadProfile();
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to update' });
    }
    
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || 'Failed to change password');
    }
  };

  const handleExportData = async () => {
    const blob = await exportUserData();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evos-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type "DELETE MY ACCOUNT" exactly');
      return;
    }
    
    setDeleting(true);
    const result = await deleteAccount(deletePassword, deleteConfirmation);
    
    if (result.success) {
      logout();
      navigate('/');
    } else {
      setDeleteError(result.error || 'Failed to delete account');
    }
    setDeleting(false);
  };

  const handleResendVerification = async () => {
    const result = await resendVerification();
    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Verification email sent!' });
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to send' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#030014] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/dashboard" 
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400">Manage your account and data</p>
          </div>
        </div>

        {/* Stats Cards */}
        {profile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.stats.nodesCreated}</div>
                  <div className="text-xs text-gray-500">Identity Nodes</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.user.current_streak || 0}</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.stats.actionsCompleted}</div>
                  <div className="text-xs text-gray-500">Actions Done</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.stats.trackingDays}</div>
                  <div className="text-xs text-gray-500">Days Tracked</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          {(['profile', 'security', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Profile Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        value={profile?.user.email || ''}
                        disabled
                        className="flex-1 px-4 py-3 bg-gray-900/30 border border-gray-800 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      {profile?.user.email_verified ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={handleResendVerification}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full hover:bg-yellow-500/30 transition-colors"
                        >
                          Verify Email
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Member Since</label>
                    <p className="text-white">
                      {profile?.user.created_at ? new Date(profile.user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  
                  {saveMessage && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                      saveMessage.type === 'success' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {saveMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {saveMessage.text}
                    </div>
                  )}
                  
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || name === profile?.user.name}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* AI Mentor Style */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Dna className="w-5 h-5 text-purple-400" />
                  AI Mentor Style
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Choose how your AI mentor communicates with you. This affects the tone and approach of all AI responses.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MENTOR_STYLES.map((mentor) => {
                    const isSelected = currentMentorStyle === mentor.id;
                    const colors = {
                      ruthless: { bg: 'bg-red-500/10', border: 'border-red-500/30', selected: 'border-red-500 bg-red-500/20', icon: Flame, iconColor: 'text-red-400' },
                      architect: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', selected: 'border-blue-500 bg-blue-500/20', icon: Compass, iconColor: 'text-blue-400' },
                      mirror: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', selected: 'border-purple-500 bg-purple-500/20', icon: Eye, iconColor: 'text-purple-400' },
                      coach: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', selected: 'border-emerald-500 bg-emerald-500/20', icon: Heart, iconColor: 'text-emerald-400' },
                    }[mentor.id];
                    const Icon = colors.icon;
                    
                    return (
                      <button
                        key={mentor.id}
                        onClick={() => handleMentorChange(mentor.id)}
                        disabled={savingMentor}
                        className={`relative p-4 rounded-xl text-left transition-all border-2 ${
                          isSelected 
                            ? colors.selected 
                            : `${colors.bg} ${colors.border} hover:opacity-80`
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                          <span className="font-semibold text-white">{mentor.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {mentor.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                
                {savingMentor && (
                  <p className="text-xs text-gray-500 mt-3">Saving...</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  Change Password
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase, number"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPasswords}
                      onChange={(e) => setShowPasswords(e.target.checked)}
                      className="rounded border-gray-600"
                    />
                    Show passwords
                  </label>
                  
                  {passwordError && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="p-3 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Password changed successfully!
                    </div>
                  )}
                  
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Data Protection Info */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Your Data is Protected
                </h2>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Passwords encrypted with bcrypt (industry standard)</li>
                  <li>• Data encrypted in transit and at rest</li>
                  <li>• We never sell or share your data</li>
                  <li>• Your data is NOT used to train AI models</li>
                </ul>
              </div>

              {/* Export Data */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-400" />
                  Export Your Data
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Download all your data in JSON format. Includes your profile, identity nodes, 
                  tracking history, actions, and chat history.
                </p>
                <button
                  onClick={handleExportData}
                  className="px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download My Data
                </button>
              </div>

              {/* Delete Account */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-red-400">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-red-500/10 rounded-lg">
                    <p className="text-red-300 text-sm font-medium">
                      ⚠️ This will permanently delete everything. Are you absolutely sure?
                    </p>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Enter your password</label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Type "DELETE MY ACCOUNT" to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    
                    {deleteError && (
                      <div className="p-2 rounded bg-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {deleteError}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                          setDeleteConfirmation('');
                          setDeleteError('');
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || !deletePassword || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Permanently Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
