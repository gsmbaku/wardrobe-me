import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../common';
import { useToast } from '../common/Toast';

export default function AuthPanel() {
  const { user, signInWithPassword, signUpWithPassword, signOut, isConfigured } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isConfigured) {
    return (
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Account</h2>
        <p className="text-sm text-gray-600">
          Cloud sync is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
      {user ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Signed in as</p>
            <p className="text-sm font-medium text-gray-900">{user.email ?? user.id}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut().then(() => showToast('Signed out', 'success'))}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubmitting(true);
            signInWithPassword(email, password)
              .then(() => showToast('Signed in', 'success'))
              .catch(() => showToast('Sign in failed', 'error'))
              .finally(() => setIsSubmitting(false));
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setIsSubmitting(true);
                signUpWithPassword(email, password)
                  .then(() => showToast('Check your email to confirm your account', 'success'))
                  .catch(() => showToast('Sign up failed', 'error'))
                  .finally(() => setIsSubmitting(false));
              }}
            >
              Sign up
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Tip: You can also sign up in the Supabase Auth UI invite flow if enabled.
          </p>
        </form>
      )}
    </Card>
  );
}

