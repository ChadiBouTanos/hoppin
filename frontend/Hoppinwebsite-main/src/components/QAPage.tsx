import { ArrowLeft, HelpCircle } from 'lucide-react';

type QAPageProps = {
  onBack: () => void;
};

const faqs = [
  {
    question: "What is Hoppin?",
    answer: "Hoppin is a carpooling platform designed to connect people who share similar daily commutes. Whether you're driving to work or looking for a ride, Hoppin helps you find compatible travel companions to share costs and reduce environmental impact."
  },
  {
    question: "How do I create a trip?",
    answer: "After signing up and logging in, click on 'Create Route' from the navigation menu or home page. You'll be guided through a simple 2-step process where you select your role (driver, passenger, or both) and then enter your trip details including departure location, arrival location, date, time, and recurrence options."
  },
  {
    question: "What are the recurrence options?",
    answer: "You can choose from three recurrence types: 'One Time' for single trips, 'Repeat Every Week' for trips that happen on the same day each week, or 'Custom Days' where you can select specific days of the week (e.g., Monday, Wednesday, Friday) for your regular commute."
  },
  {
    question: "How does trip matching work?",
    answer: "Our admin team manually reviews all posted trips and matches drivers with passengers based on compatible routes, schedules, and locations. When a match is found, we'll contact you via WhatsApp (if you've provided consent) or through your registered contact information."
  },
  {
    question: "Why do you need WhatsApp consent?",
    answer: "WhatsApp consent allows our team to quickly contact you when we find compatible trip matches. This enables faster communication and easier coordination with potential carpool partners. You can opt out of WhatsApp notifications during signup if you prefer email contact only."
  },
  {
    question: "Is my contact information secure?",
    answer: "Yes! Your email and phone number are only visible to our admin team for matching purposes. Other users won't see your contact details unless a match is made and both parties agree to share information."
  },
  {
    question: "Can I be both a driver and a passenger?",
    answer: "Absolutely! When creating a trip, you can select 'Both' as your role. This is perfect for people who have access to a vehicle but are flexible about driving or riding with others."
  },
  {
    question: "How do I view my posted trips?",
    answer: "Click on 'My Trips' in the navigation menu to see all your active trips. You can view details including departure/arrival locations, dates, times, recurrence settings, and match status."
  },
  {
    question: "What does 'Matched' status mean?",
    answer: "When a trip shows 'Matched' status, it means our admin team has found a compatible carpool partner for you. You should expect to be contacted soon with the details of your match."
  },
  {
    question: "Can I edit or delete a trip after posting?",
    answer: "Currently, trip editing is not available in the app. If you need to modify or cancel a trip, please contact our admin team directly, and they'll help you update your information."
  },
  {
    question: "Is there a cost to use Hoppin?",
    answer: "Hoppin is free to use! We don't charge any fees for posting trips or being matched. Any cost sharing arrangements (fuel, tolls, etc.) are agreed upon directly between carpool partners."
  },
  {
    question: "How do I contact support?",
    answer: "For any questions or support needs, you can reach out to our admin team through your registered contact information. We're here to help make your carpooling experience smooth and efficient!"
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
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Everything you need to know about using Hoppin
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
            <h3 className="text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600">
              Contact our support team and we'll be happy to help you get started with Hoppin!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
