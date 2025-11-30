export type User = {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  whatsappConsent: boolean;
  token?: string;
};

export type Trip = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  role: 'driver' | 'passenger' | 'both';
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  arrivalTime: string;
  recurrence: 'once' | 'weekly' | 'custom';
  recurringDays?: string[]; // ['monday', 'wednesday', 'friday']
  availableSeats?: number;
  rules?: string;
  flexibilityBefore?: number | null;
  flexibilityAfter?: number | null;
  isMatched: boolean;
  createdAt: string;
};

export type TripMatch = {
  id: string;
  driverTripId: string;
  passengerTripId: string;
  isArchived: boolean;
  createdAt: string;
};
