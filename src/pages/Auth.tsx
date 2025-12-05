import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ScanLine, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && !username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);

    const { error } = isSignUp 
      ? await signUp(email, password, username)
      : await signIn(email, password);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('This email is already registered. Please sign in.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.');
      } else if (error.message.includes('duplicate key') || error.message.includes('username')) {
        toast.error('Username already taken. Please choose another.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(isSignUp ? 'Account created!' : 'Welcome back!');
      navigate('/', { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <ScanLine className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? 'Sign up to start scanning' : 'Sign in to continue'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setUsername(''); // Clear username when switching
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
