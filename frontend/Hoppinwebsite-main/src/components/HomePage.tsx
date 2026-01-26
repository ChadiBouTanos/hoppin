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
    // Not logged in - Show marketing page with gradient
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-white rounded-full shadow-lg px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Hoppin" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onLogin}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Accedi
              </button>
              <button
                onClick={onSignUp}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Registrati
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-white mb-6 text-4xl md:text-5xl leading-tight">
              Creiamo <span className="text-blue-200">carpooling</span> che rende il tuo{' '}
              <span className="text-blue-200">tragitto quotidiano</span> più facile
            </h1>
            <p className="text-[#fefbf2] text-lg md:text-xl mb-12 max-w-2xl">
              Condividi i tuoi viaggi quotidiani per lavoro o università. Risparmia denaro, riduci la tua impronta di carbonio 
              e viaggia in buona compagnia con il nostro sistema di abbinamento intelligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSignUp}
                className="px-8 py-4 bg-white text-primary rounded-full hover:bg-blue-50 transition-colors"
              >
                Inizia Ora
              </button>
              <button
                onClick={onLearnMore}
                className="px-8 py-4 bg-blue-500/20 text-white rounded-full hover:bg-blue-500/30 transition-colors backdrop-blur-sm border border-white/20"
              >
                Scopri di Più
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">Crea Profilo</h3>
              <p className="text-[#fefbf2]">
                Registrati in pochi secondi con le tue informazioni di base.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">Pubblica il Tuo Percorso</h3>
              <p className="text-[#fefbf2]">
                Specifica se sei conducente, passeggero o entrambi.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">Aggiungi Dettagli</h3>
              <p className="text-[#fefbf2]">
                Partenza, arrivo, data e ora del tuo percorso quotidiano.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white mb-2">Trova Corrispondenze</h3>
              <p className="text-[#fefbf2]">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-primary mb-6">
            Bentornato!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Pronto a creare un nuovo percorso o gestire i tuoi viaggi esistenti?
          </p>
          <button
            onClick={onCreateRoute}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Crea Percorso
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="mb-3">Economico</h2>
            <p className="text-gray-600">
              Condividi i costi di carburante e pedaggi con altri viaggiatori sul tuo percorso.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mb-3">Ecologico</h2>
            <p className="text-gray-600">
              Riduci la tua impronta di carbonio limitando i veicoli sulla strada.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="mb-3">Sociale</h2>
            <p className="text-gray-600">
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
