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
  eventId?: string;
  createdAt: string;
};

export type TripMatch = {
  id: string;
  driverTripId: string;
  passengerTripId: string;
  isArchived: boolean;
  createdAt: string;
};

export type EventCoverStyle = 'split' | 'centered';

export type EventLogo = {
  src: string;
  alt: string;
  href?: string;
};

export type EventCustomSection = {
  id: string;
  title: string;
  content: string;
};

export type CreateHoppinEvent = {
  title: string;
  displayedTitle: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  eventDates?: string[];
  location?: string;
  date?: string;
  customCTA?: string;
  themeColor?: string;
  coverStyle?: EventCoverStyle;
  sponsorLogos?: EventLogo[];
  partnerLogos?: EventLogo[];
  customSections?: EventCustomSection[];
};

export type HoppinEvent = {
  id: string;
  title: string;
  displayedTitle: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  slug: string;
  eventDates?: string[];
  location?: string;
  date?: string;
  customCTA?: string;
  themeColor?: string;
  coverStyle?: EventCoverStyle;
  sponsorLogos?: EventLogo[];
  partnerLogos?: EventLogo[];
  customSections?: EventCustomSection[];
  isActive: boolean;
  registrationCount?: number;
  createdAt: string;
};

export type EventRegistrationPayload = {
  eventId: string;
  role: 'driver' | 'passenger';
  contact: string;
  departureCity: string;
  eventDate?: string;
  availableSeats?: number;
  note?: string;
};
