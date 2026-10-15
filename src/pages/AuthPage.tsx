import AuthPanel from '../components/auth/AuthPanel';

export default function AuthPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account</h1>
      <AuthPanel />
    </div>
  );
}

