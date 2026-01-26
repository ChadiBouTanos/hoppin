import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type LoginPageProps = {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
};

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-[#fe6e5a]/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-[-10%] w-80 h-80 rounded-full bg-[#ffd6aa]/60 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <button onClick={onBack} className="btn-ghost mb-8">
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>

        <div className="glass-panel p-8 sm:p-10">
          <h1 className="mb-2 text-3xl font-semibold text-brand">
            Accedi
          </h1>
          <p className="text-muted mb-8">
            Accedi al tuo account Hoppin
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
