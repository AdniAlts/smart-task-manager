import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code + new password
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (forgotStep === 1) {
      // Send reset code
      if (!forgotEmail) {
        toast.error('Please enter your email');
        return;
      }
      
      setIsSendingReset(true);
      try {
        await api.post('/auth/forgot-password', { email: forgotEmail });
        toast.success('Reset code sent to your email!');
        setForgotStep(2);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send reset code');
      } finally {
        setIsSendingReset(false);
      }
    } else {
      // Reset password with code
      if (!resetCode || !newPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      setIsSendingReset(true);
      try {
        await api.post('/auth/reset-password', { 
          email: forgotEmail, 
          resetCode, 
          newPassword 
        });
        toast.success('Password reset successfully!');
        setShowForgotPassword(false);
        setForgotStep(1);
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      } finally {
        setIsSendingReset(false);
      }
    }
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600/20 rounded-2xl mb-4 overflow-hidden">
              <img src="/logo.png" alt="TaskMind" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-slate-400 mt-2">
              {forgotStep === 1 
                ? "Enter your email to receive a reset code" 
                : "Enter the code sent to your email"}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotStep === 1 ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                               text-white placeholder-slate-500
                               focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reset Code</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXXXX"
                      maxLength={8}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                               text-white placeholder-slate-500 text-center font-mono text-lg tracking-widest
                               focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl
                                 text-white placeholder-slate-500
                                 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full justify-center py-3"
                isLoading={isSendingReset}
              >
                {forgotStep === 1 ? 'Send Reset Code' : 'Reset Password'}
              </Button>
            </form>

            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotStep(1);
              }}
              className="mt-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-full justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600/20 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="TaskMind" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            TaskMind
            <Sparkles className="w-5 h-5 text-violet-400" />
          </h1>
          <p className="text-slate-400 mt-2">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                           text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl
                           text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-600 
                           focus:ring-violet-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full justify-center py-3"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
