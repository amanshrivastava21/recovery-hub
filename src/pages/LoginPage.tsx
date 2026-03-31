import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground">
            Rehabilitation Center Management System
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Digital record-keeping and monitoring system for efficient patient care, treatment tracking, and staff coordination.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Patient Records', value: 'Digital & Secure' },
              { label: 'Treatment Tracking', value: 'Real-time' },
              { label: 'Staff Management', value: 'Role-based' },
              { label: 'Analytics', value: 'Comprehensive' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-primary-foreground/70">{item.label}</p>
                <p className="font-semibold text-primary-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">RCMS</span>
          </div>

          <h2 className="font-display text-2xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email" type="email" placeholder="admin@rcms.com"
                  className="pl-10" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password" type="password" placeholder="••••••••"
                  className="pl-10" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { label: 'Admin', email: 'admin@rcms.com', pw: 'Admin@123456', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
                { label: 'Worker', email: 'worker@rcms.com', pw: 'Worker@123', color: 'bg-info/10 text-info hover:bg-info/20' },
                { label: 'Staff', email: 'staff@rcms.com', pw: 'Staff@123', color: 'bg-success/10 text-success hover:bg-success/20' },
                { label: 'Patient', email: 'patient@rcms.com', pw: 'Patient@123', color: 'bg-warning/10 text-warning hover:bg-warning/20' },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => demoLogin(d.email, d.pw)}
                  className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${d.color}`}
                >
                  Login as {d.label}
                  <span className="ml-2 text-xs opacity-70">({d.email})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
