import { Car, Users, MapPin, Clock, Plus } from 'lucide-react';
import logo from '../images/logo.png';
import { SupportFooterBanner } from './SupportFooterBanner';

type HomePageProps = {
  onSignUp: () => void;
  onLogin: () => void;
  onCreateRoute: () => void;
  onLearnMore: () => void;
  isLoggedIn: boolean;
};

export function HomePage({ onSignUp, onLogin, onCreateRoute, onLearnMore, isLoggedIn }: HomePageProps) {
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-[#fe6e5a]/20 blur-3xl"></div>
          <div className="absolute top-24 right-[-6%] w-96 h-96 rounded-full bg-[#ffd6aa]/55 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-[520px] h-[520px] -translate-x-1/2 translate-y-1/3 rounded-full bg-[#fff1dc]/80 blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 max-w-6xl mx-auto px-6 pt-6">
          <div className="glass-nav rounded-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Hoppin" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onLogin}
                className="btn-ghost"
              >
                Accedi
              </button>
              <button
                onClick={onSignUp}
                className="btn-primary"
              >
                Registrati
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16">
          <div className="glass-panel px-8 py-12 md:px-12 md:py-14">
            <h1 className="mb-6 text-4xl md:text-5xl leading-tight">
              Creiamo <span className="text-brand">carpooling</span> che rende il tuo{' '}
              <span className="text-brand">tragitto quotidiano</span> più facile
            </h1>
            <p className="text-lg md:text-xl mb-12 max-w-2xl text-muted">
              Condividi i tuoi viaggi quotidiani per lavoro o università. Risparmia denaro, riduci la tua impronta di carbonio
              e viaggia in buona compagnia con il nostro sistema di abbinamento intelligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSignUp}
                className="btn-primary btn-primary-lg"
              >
                Inizia Ora
              </button>
              <button
                onClick={onLearnMore}
                className="btn-secondary btn-primary-lg"
              >
                Scopri di Più
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="glass-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-brand" />
              </div>
              <h3 className="mb-2">Crea Profilo</h3>
              <p className="text-muted">
                Registrati in pochi secondi con le tue informazioni di base.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="glass-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-brand" />
              </div>
              <h3 className="mb-2">Pubblica il Tuo Percorso</h3>
              <p className="text-muted">
                Specifica se sei conducente, passeggero o entrambi.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="glass-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-brand" />
              </div>
              <h3 className="mb-2">Aggiungi Dettagli</h3>
              <p className="text-muted">
                Partenza, arrivo, data e ora del tuo percorso quotidiano.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="glass-soft w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-brand" />
              </div>
              <h3 className="mb-2">Trova Corrispondenze</h3>
              <p className="text-muted">
                Il nostro team ti metterà in contatto con percorsi compatibili.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pb-16">
          <SupportFooterBanner />
        </div>
      </div>
    );
  }

  // Logged in - Show dashboard with Create Route button
  return (
    <div className="min-h-screen py-10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass-panel px-6 py-10 sm:px-10 sm:py-12 text-center">
          <h1 className="text-brand mb-4">
            Bentornato!
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8">
            Pronto a creare un nuovo percorso o gestire i tuoi viaggi esistenti?
          </p>
          <button
            onClick={onCreateRoute}
            className="btn-primary btn-primary-lg"
          >
            <Plus className="w-5 h-5" />
            Crea Percorso
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8">
            <div className="glass-soft w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Car className="w-7 h-7 text-brand" />
            </div>
            <h2 className="mb-3">Economico</h2>
            <p className="text-muted">
              Condividi i costi di carburante e pedaggi con altri viaggiatori sul tuo percorso.
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="glass-soft w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-brand" />
            </div>
            <h2 className="mb-3">Ecologico</h2>
            <p className="text-muted">
              Riduci la tua impronta di carbonio limitando i veicoli sulla strada.
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="glass-soft w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-brand" />
            </div>
            <h2 className="mb-3">Sociale</h2>
            <p className="text-muted">
              Incontra colleghi e costruisci connessioni durante il tuo tragitto quotidiano.
            </p>
          </div>
        </div>
      </div>

      <div className="pb-16">
        <SupportFooterBanner />
      </div>
    </div>
  );
}
