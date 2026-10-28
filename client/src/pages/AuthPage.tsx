import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@expense.app');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fbfbf9] dark:bg-[#0c1017]">
      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left panel — Forest Green Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#061911] via-[#0a2318] to-[#0f3524] text-white flex-col justify-between p-12 border-r border-[#153e2b] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                expensetracker
              </span>
              <span className="block text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Smart Student Finance
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Smart Student Expense Tracker & Budget Management System
          </div>

          <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-5 text-white">
            Spend wisely.<br />
            <span className="text-emerald-400">
              Save confidently.
            </span>
          </h1>

          <p className="text-emerald-100/80 text-base xl:text-lg leading-relaxed max-w-lg mb-8">
            Tailored specifically for student life. Track allowances, mess food, campus transport,
            hostel rent, semester supplies, and split bills in Indian Rupees (₹) with real-time financial pacing.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md text-xs text-emerald-100/90">
            <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/15 backdrop-blur-sm">
              <div className="font-bold text-white text-sm mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ₹ INR Default
              </div>
              <div className="text-emerald-200/70">Indian Rupee currency & number formatting</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/15 backdrop-blur-sm">
              <div className="font-bold text-white text-sm mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Student Categories
              </div>
              <div className="text-emerald-200/70">Canteen, Mess, Hostel, Wi-Fi & Books</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/15 backdrop-blur-sm">
              <div className="font-bold text-white text-sm mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Daily Safe-to-Spend
              </div>
              <div className="text-emerald-200/70">Pacing metric to prevent month-end debt</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/15 backdrop-blur-sm">
              <div className="font-bold text-white text-sm mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Room & Project Splits
              </div>
              <div className="text-emerald-200/70">Fair shared bill settlement engine</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-[#143d2a] flex items-center justify-between text-xs text-emerald-300/70">
          <div className="flex gap-1.5">
            {['React 18', 'TypeScript', 'Node.js', 'Express', 'MongoDB 7'].map(t => (
              <span key={t} className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>College Project</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fbfbf9] dark:bg-[#0c1017]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold dark:text-white font-mono">expensetracker</span>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Smart Student Finance</p>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-1.5 tracking-tight text-gray-900 dark:text-white">
            {isLogin ? 'Welcome back' : 'Create Student Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {isLogin ? 'Sign in to manage your student budget & allowance' : 'Start tracking campus expenditures and savings'}
          </p>

          {/* Quick Demo Credentials Helper */}
          {isLogin && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs">
              <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                <span>Demo Student Account</span>
                <span className="text-[10px] uppercase bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-md font-mono">
                  Sowmya
                </span>
              </div>
              <div className="text-emerald-800/80 dark:text-emerald-300/80 space-y-0.5 font-mono text-[11px]">
                <div>Email: <span className="font-semibold text-emerald-950 dark:text-emerald-200">demo@expense.app</span></div>
                <div>Password: <span className="font-semibold text-emerald-950 dark:text-emerald-200">demo123</span></div>
              </div>
              <button
                type="button"
                onClick={() => { setEmail('demo@expense.app'); setPassword('demo123'); }}
                className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                Auto-fill Sowmya's credentials
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sowmya" required />
              </div>
            )}
            <div>
              <label className="label">College / Personal Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
