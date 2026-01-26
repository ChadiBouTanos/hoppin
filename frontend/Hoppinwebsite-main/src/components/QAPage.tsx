import { ArrowLeft, HelpCircle } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '../constants/support';

type QAPageProps = {
  onBack: () => void;
};

const faqs = [
  {
    question: "Cos'è Hoppin?",
    answer: "Hoppin è una piattaforma di carpooling che connette persone con tragitti simili, aiutandole a condividere spostamenti, ridurre i costi e contribuire a un trasporto più sostenibile. Gli utenti possono consultare tutti i viaggi pubblicati e contattare direttamente chi li ha inseriti attraverso WhatsApp."
  },
  {
    question: "Come creo un viaggio?",
    answer: "Dopo la registrazione e l’accesso, puoi creare un percorso selezionando la voce “Crea Percorso” dal menu o dalla home. Ti verrà chiesto di scegliere il tuo ruolo, che può essere conducente, passeggero o entrambi, e di compilare i dettagli del viaggio, inserendo la città di partenza, la città di arrivo, la data, l’ora e le eventuali impostazioni di ricorrenza."
  },
  {
    question: "Quali sono le opzioni di ricorrenza?",
    answer: "Durante la creazione del viaggio puoi decidere se effettuare il tragitto una sola volta, ripeterlo ogni settimana nello stesso giorno oppure personalizzarne la frequenza scegliendo giorni specifici della settimana. Questa flessibilità ti permette di organizzare facilmente sia spostamenti occasionali sia tragitti regolari"
  },
  {
    question: "Come funziona l'abbinamento?",
    answer: "I viaggi pubblicati sono visibili nella sezione “Trova viaggi disponibili”, dove ogni utente può esplorare le proposte presenti. È possibile filtrare i risultati per data, per orario o per destinazione, così da individuare rapidamente il tragitto più adatto. Quando trovi un viaggio compatibile con le tue esigenze, puoi contattare direttamente la persona che lo ha pubblicato attraverso il pulsante “Contatta su WhatsApp”, avviando subito una conversazione."
  },
  {
    question: "Perché utilizzate WhatsApp per i contatti?",
    answer: "WhatsApp garantisce una comunicazione immediata e semplice tra gli utenti. Il pulsante presente in ogni viaggio apre direttamente una chat con la persona che ha creato l’annuncio, rendendo più rapido accordarsi sul tragitto e sui dettagli organizzativi."
  },
  {
    question: "Le mie informazioni di contatto sono sicure?",
    answer: "La tua email non viene resa pubblica. Il numero di telefono è necessario esclusivamente per permettere agli altri utenti di contattarti tramite WhatsApp, ed è utilizzato unicamente attraverso il pulsante integrato. Non vengono mostrati dati aggiuntivi e non sono visibili informazioni non necessarie alla comunicazione."
  },
  {
    question: "Posso essere sia conducente che passeggero?",
    answer: "Sì. Se sei flessibile e disponi di un veicolo ma sei aperto anche a viaggiare come passeggero, puoi selezionare l’opzione “Entrambi” durante la creazione del percorso. In questo modo aumenti le possibilità di trovare un compagno di viaggio compatibile"
  },
  {
    question: "Come visualizzo i miei viaggi pubblicati?",
    answer: "Accedendo alla sezione “I Miei Viaggi” puoi vedere tutti i percorsi che hai creato. In questa pagina sono riportati i dettagli relativi alla città di partenza, alla città di arrivo, alla data, all’orario e alle eventuali ricorrenze, così da avere sempre sotto controllo i tuoi spostamenti pianificati:"
  },
  {
    question: "Posso modificare o eliminare un viaggio dopo la pubblicazione?",
    answer: "Per ora non è possibile modificare direttamente un viaggio dall’app. Se hai necessità di correggere o rimuovere un percorso, puoi contattare l’assistenza e verrà aggiornato tutto ciò di cui hai bisogno"
  },
  {
    question: "C'è un costo per usare Hoppin?",
    answer: "No. L’utilizzo della piattaforma è completamente gratuito. Eventuali accordi sulle spese di condivisione, come carburante o pedaggi, vengono stabiliti direttamente tra gli utenti che decidono di viaggiare insieme."
  },
  {
    question: "Come contatto l'assistenza?",
    answer: "Per richieste di supporto o informazioni puoi utilizzare i recapiti forniti in fase di registrazione. Il team è sempre disponibile ad aiutarti e a garantire un’esperienza d’uso semplice ed efficiente."
  }
];

export function QAPage({ onBack }: QAPageProps) {
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="btn-ghost mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>

        <div className="glass-panel p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass-soft w-12 h-12 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-brand" />
            </div>
            <h1>Domande Frequenti</h1>
          </div>
          <p className="text-muted mb-8">
            Tutto ciò che devi sapere sull'utilizzo di Hoppin
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <h3 className="mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 glass-card">
            <h3 className="mb-2">Hai ancora domande?</h3>
            <p className="text-muted">
              Contatta il nostro team di supporto e saremo felici di aiutarti a iniziare con Hoppin!
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={SUPPORT_WHATSAPP}
                className="support-whatsapp inline-flex items-center justify-center rounded-full border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Chat su WhatsApp
              </a>
              <a
                href={SUPPORT_EMAIL}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Scrivici via email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
