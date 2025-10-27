import { useState } from 'react';
import { ArrowLeft, ArrowRight, Car, Users, MapPin, Calendar, Clock, Repeat } from 'lucide-react';

type CreateTripFlowProps = {
  onComplete: (tripData: {
    role: 'driver' | 'passenger' | 'both';
    departureLocation: string;
    arrivalLocation: string;
    date: string;
    arrivalTime: string;
    recurrence: 'once' | 'weekly' | 'custom';
    recurringDays?: string[];
  }) => void;
  onCancel: () => void;
};

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export function CreateTripFlow({ onComplete, onCancel }: CreateTripFlowProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    role: '' as 'driver' | 'passenger' | 'both' | '',
    departureLocation: '',
    arrivalLocation: '',
    date: '',
    arrivalTime: '',
    recurrence: 'once' as 'once' | 'weekly' | 'custom',
    recurringDays: [] as string[]
  });

  const handleRoleSelect = (role: 'driver' | 'passenger' | 'both') => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const toggleDay = (day: string) => {
    if (formData.recurringDays.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: formData.recurringDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...formData.recurringDays, day]
      });
    }
  };

  const handleSubmit = () => {
    if (formData.recurrence === 'custom' && formData.recurringDays.length === 0) {
      alert('Please select at least one day for custom recurrence');
      return;
    }

    if (formData.role && formData.departureLocation && formData.arrivalLocation && formData.date && formData.arrivalTime) {
      setShowSuccess(true);
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-12 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showSuccess ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              </div>
              <h1 className="text-3xl font-bold mb-3">🎉 Your trip is published!</h1>
              <p className="text-xl text-gray-600">
                Welcome to Hoppin, the carpooling app for PoliMi students
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">What happens next?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">You've completed registration</h3>
                    <p className="text-gray-600">
                      You've indicated your role and route — perfect!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">We'll analyze your route</h3>
                    <p className="text-gray-600">
                      In the next few days, we'll find PoliMi students on the same route and schedule (going or returning).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">We'll contact you via WhatsApp</h3>
                    <p className="text-gray-600">
                      When we find a compatible match, we'll reach out directly on WhatsApp to connect you and help organize the ride.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Our Goal
              </h3>
              <p className="text-gray-700">
                Help you reach PoliMi faster, spending less, and reducing the chaos of public transport.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Quick Tip
              </h3>
              <p className="text-gray-700">
                The more complete your route details (times, stops, days), the faster we'll find you a perfect match.
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Thank you for being one of the first Hoppin users! Your feedback will help us grow and improve the experience for all PoliMi students.
              </p>
              <button
                onClick={() => window.location.href = 'mailto:hello@hoppinapp.com'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Contact Us
              </button>
              <p className="text-sm text-gray-500 mt-4">
                hello@hoppinapp.com
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">See you on the road! 🚀</p>
              <p className="text-sm text-gray-500">– The Hoppin Team</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Step {step} of 2</span>
                <button
                  onClick={onCancel}
                  className="text-white hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8">
                <h1 className="text-3xl font-bold mb-2">What is your role?</h1>
                <p className="text-gray-600 mb-8">
                  Select if you're a driver, passenger, or both
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => handleRoleSelect('driver')}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <Car className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Driver</h3>
                    <p className="text-gray-600">
                      I'm offering seats in my vehicle
                    </p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('passenger')}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Passenger</h3>
                    <p className="text-gray-600">
                      I'm looking for a ride
                    </p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('both')}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Both</h3>
                    <p className="text-gray-600">
                      I can be either driver or passenger
                    </p>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h1 className="text-3xl font-bold mb-2">Trip Details</h1>
                <p className="text-gray-600 mb-8">
                  Enter your daily trip information
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      Departure Location
                    </label>
                    <input
                      type="text"
                      value={formData.departureLocation}
                      onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                      placeholder="e.g. New York, NY 10001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Arrival Location
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalLocation}
                      onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                      placeholder="e.g. Boston, MA 02101"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        Trip Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Arrival Time
                      </label>
                      <input
                        type="time"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-3 flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-gray-400" />
                      Recurrence
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="once"
                          checked={formData.recurrence === 'once'}
                          onChange={() => setFormData({ ...formData, recurrence: 'once', recurringDays: [] })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">One Time</p>
                          <p className="text-sm text-gray-500">This trip happens only once</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="weekly"
                          checked={formData.recurrence === 'weekly'}
                          onChange={() => setFormData({ ...formData, recurrence: 'weekly', recurringDays: [] })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">Repeat Every Week</p>
                          <p className="text-sm text-gray-500">This trip repeats on the same day every week</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="custom"
                          checked={formData.recurrence === 'custom'}
                          onChange={() => setFormData({ ...formData, recurrence: 'custom' })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">Custom Days</p>
                          <p className="text-sm text-gray-500 mb-3">Select specific days of the week</p>
                          
                          {formData.recurrence === 'custom' && (
                            <div className="grid grid-cols-4 gap-2">
                              {DAYS_OF_WEEK.map(day => (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => toggleDay(day.value)}
                                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    formData.recurringDays.includes(day.value)
                                      ? 'bg-primary text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {day.label.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Publish Trip
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}