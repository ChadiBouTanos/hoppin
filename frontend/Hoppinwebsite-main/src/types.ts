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
  isMatched: boolean;
  createdAt: string;
};
