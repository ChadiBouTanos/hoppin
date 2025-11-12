import { ArrowLeft, HelpCircle } from 'lucide-react';

type QAPageProps = {
  onBack: () => void;
};

const faqs = [
  {
    question: "Cos'è Hoppin?",
    answer: "Hoppin è una piattaforma di carpooling progettata per connettere persone che condividono tragitti quotidiani simili. Che tu stia guidando per andare al lavoro o cerchi un passaggio, Hoppin ti aiuta a trovare compagni di viaggio compatibili per condividere i costi e ridurre l'impatto ambientale."
  },
  {
    question: "Come creo un viaggio?",
    answer: "Dopo la registrazione e l'accesso, clicca su 'Crea Percorso' dal menu di navigazione o dalla home page. Sarai guidato attraverso un semplice processo in 2 passaggi dove selezioni il tuo ruolo (conducente, passeggero o entrambi) e poi inserisci i dettagli del viaggio inclusi luogo di partenza, luogo di arrivo, data, ora e opzioni di ricorrenza."
  },
  {
    question: "Quali sono le opzioni di ricorrenza?",
    answer: "Puoi scegliere tra tre tipi di ricorrenza: 'Una Volta' per viaggi singoli, 'Ripeti Ogni Settimana' per viaggi che avvengono lo stesso giorno ogni settimana, o 'Giorni Personalizzati' dove puoi selezionare giorni specifici della settimana (es. Lunedì, Mercoledì, Venerdì) per il tuo tragitto regolare."
  },
  {
    question: "Come funziona l'abbinamento dei viaggi?",
    answer: "Il nostro team amministrativo esamina manualmente tutti i viaggi pubblicati e abbina conducenti con passeggeri in base a percorsi, orari e località compatibili. Quando viene trovata una corrispondenza, ti contatteremo via WhatsApp (se hai fornito il consenso) o tramite le informazioni di contatto registrate."
  },
  {
    question: "Perché avete bisogno del consenso per WhatsApp?",
    answer: "Il consenso per WhatsApp consente al nostro team di contattarti rapidamente quando troviamo corrispondenze di viaggio compatibili. Questo permette una comunicazione più veloce e un coordinamento più facile con potenziali partner di carpooling. Puoi disattivare le notifiche WhatsApp durante la registrazione se preferisci il contatto solo via email."
  },
  {
    question: "Le mie informazioni di contatto sono sicure?",
    answer: "Sì! La tua email e numero di telefono sono visibili solo al nostro team amministrativo per scopi di abbinamento. Gli altri utenti non vedranno i tuoi dettagli di contatto a meno che non venga effettuato un abbinamento e entrambe le parti accettino di condividere le informazioni."
  },
  {
    question: "Posso essere sia conducente che passeggero?",
    answer: "Assolutamente! Quando crei un viaggio, puoi selezionare 'Entrambi' come tuo ruolo. Questo è perfetto per persone che hanno accesso a un veicolo ma sono flessibili sul guidare o viaggiare con altri."
  },
  {
    question: "Come visualizzo i miei viaggi pubblicati?",
    answer: "Clicca su 'I Miei Viaggi' nel menu di navigazione per vedere tutti i tuoi viaggi attivi. Puoi visualizzare i dettagli inclusi luoghi di partenza/arrivo, date, orari, impostazioni di ricorrenza e stato di abbinamento."
  },
  {
    question: "Cosa significa lo stato 'Abbinato'?",
    answer: "Quando un viaggio mostra lo stato 'Abbinato', significa che il nostro team amministrativo ha trovato un partner di carpooling compatibile per te. Dovresti aspettarti di essere contattato presto con i dettagli del tuo abbinamento."
  },
  {
    question: "Posso modificare o eliminare un viaggio dopo la pubblicazione?",
    answer: "Attualmente, la modifica dei viaggi non è disponibile nell'app. Se hai bisogno di modificare o cancellare un viaggio, contatta direttamente il nostro team amministrativo e ti aiuteranno ad aggiornare le tue informazioni."
  },
  {
    question: "C'è un costo per usare Hoppin?",
    answer: "Hoppin è gratuito! Non addebitiamo commissioni per pubblicare viaggi o essere abbinati. Eventuali accordi di condivisione dei costi (carburante, pedaggi, ecc.) vengono concordati direttamente tra i partner di carpooling."
  },
  {
    question: "Come contatto l'assistenza?",
    answer: "Per qualsiasi domanda o necessità di supporto, puoi contattare il nostro team amministrativo tramite le informazioni di contatto registrate. Siamo qui per rendere la tua esperienza di carpooling fluida ed efficiente!"
  }
];

export function QAPage({ onBack }: QAPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-12 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#fefbf2] mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>

        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-gray-900">Domande Frequenti</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Tutto ciò che devi sapere sull'utilizzo di Hoppin
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <h3 className="text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-gray-900 mb-2">Hai ancora domande?</h3>
            <p className="text-gray-600">
              Contatta il nostro team di supporto e saremo felici di aiutarti a iniziare con Hoppin!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}