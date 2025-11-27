import { CreateTripPayload } from "../App";
import { Trip, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'https://hoppin.cloud/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/login/`, {  // Added trailing slash
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  signUp: async (userData: Omit<User, 'id' | 'isAdmin' | 'token'>): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/register/`, {  // Added trailing slash
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getTrips: async (token: string, isAdmin: boolean): Promise<Trip[]> => {
    const endpoint = isAdmin ? '/trips/' : '/trips/my/';  // Added trailing slashes
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },

  createTrip: async (tripData: CreateTripPayload, token: string): Promise<Trip> => {
    const response = await fetch(`${API_URL}/trips/`, {  // Added trailing slash
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });
    return handleResponse(response);
  },

  deleteTrip: async (tripId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/trips/${tripId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  },

  toggleMatched: async (tripId: string, token: string): Promise<Trip> => {
    const response = await fetch(`${API_URL}/trips/${tripId}/match/`, {  // Added trailing slash
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};