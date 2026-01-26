import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type SignUpPageProps = {
  onSignUp: (userData: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
    whatsappConsent: boolean;
  }) => void;
  onBack: () => void;
};

export function SignUpPage({ onSignUp, onBack }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    whatsappConsent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Le password non corrispondono');
      return;
    }
    onSignUp({
      email: formData.email,
      phone: formData.phone,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      whatsappConsent: formData.whatsappConsent
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
          <h1 className="text-3xl font-semibold text-brand mb-2">
            Crea Account
          </h1>
          <p className="text-muted mb-8">
            Unisciti alla comunità Hoppin
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Cognome
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Telefono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+39 123 456 7890"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
                minLength={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Conferma Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
                minLength={1}
              />
            </div>

            <div className="flex items-start gap-3 p-4 glass-soft">
              <input
                type="checkbox"
                name="whatsappConsent"
                id="whatsappConsent"
                checked={formData.whatsappConsent}
                onChange={handleChange}
                className="checkbox-liquid mt-1"
              />
              <label htmlFor="whatsappConsent" className="text-sm text-muted cursor-pointer">
                Acconsento ad essere contattato via WhatsApp per abbinare i miei viaggi con altri utenti
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Crea il Mio Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
