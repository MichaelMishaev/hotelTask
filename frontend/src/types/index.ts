export interface Room {
  id: string;
  roomNumber: string;
  roomType: 'Standard' | 'Deluxe' | 'Suite';
  pricePerNight: number;
  totalPrice: number;
  nights: number;
}

export type BookingStatus = 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Staff' | 'Admin';
  token: string;
}

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface CreateBookingRequest {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export interface UpdateBookingRequest {
  checkIn: string;
  checkOut: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: 'Guest' | 'Staff' | 'Admin';
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Staff' | 'Admin';
  password?: string;
}

// Room types for staff
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface StaffRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  status: RoomStatus;
}

export interface CheckInOutItem {
  bookingId: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
}

// Admin types
export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalUsers: number;
}

export interface UserCounts {
  guests: number;
  staff: number;
  admins: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Staff' | 'Admin';
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: string;
}

// Profile types
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
  membershipTier: string;
  joinedDate: string;
  emailVerified: boolean;
  pushNotifications: boolean;
  language: string;
  currency: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  address: string;
  pushNotifications: boolean;
  language: string;
  currency: string;
}

// Digital Key types
export interface DigitalKeyInfo {
  bookingId: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  status: 'active' | 'inactive' | 'expired';
  expiresAt: string;
}

export interface UnlockResult {
  success: boolean;
  message: string;
  unlockedAt: string;
}

// Stay Preferences types
export type PillowType = 'firm' | 'soft' | 'memory_foam';
export type MinibarPreference = 'healthy' | 'indulgent' | 'beverage';

export interface WelcomeAmenity {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  added: boolean;
}

export interface StayPreferences {
  bookingId: string;
  pillowType: PillowType;
  minibarPreference: MinibarPreference;
  amenities: WelcomeAmenity[];
  arrivalTime: string;
  totalAdditionalCharges: number;
}

export interface UpdateStayPreferencesRequest {
  pillowType: PillowType;
  minibarPreference: MinibarPreference;
  amenityIds: string[];
  arrivalTime: string;
}

// Loyalty Rewards types
export interface LoyaltyInfo {
  memberId: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  points: number;
  memberSince: string;
  nextTier: string;
  pointsToNextTier: number;
  progressPercent: number;
  recentTransactions?: LoyaltyTransaction[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
}

export interface LoyaltyTransaction {
  id: string;
  description: string;
  date: string;
  points: number;
}

export interface EarnMethod {
  icon: string;
  title: string;
  description: string;
}

// Concierge types
export type ConciergeCategory = 'spa' | 'dining' | 'tours' | 'transport';

export interface ConciergeService {
  id: string;
  category: ConciergeCategory;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: string;
  location: string;
  badge: string;
  rating: number;
}

export interface ConciergeSuggestion {
  id: string;
  category: ConciergeCategory;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface ConciergeReservation {
  serviceId: string;
  date: string;
  time: string;
  guests: number;
}

// Analytics types
export interface RevenueDataPoint {
  period: string;
  revenue: number;
}

export interface RevenueAnalytics {
  data: RevenueDataPoint[];
  totalRevenue: number;
  periodType: string;
}

export interface OccupancyDataPoint {
  period: string;
  occupancyRate: number;
}

export interface OccupancyAnalytics {
  data: OccupancyDataPoint[];
  averageOccupancy: number;
  periodType: string;
}

export interface BookingsByType {
  roomType: string;
  count: number;
  revenue: number;
}

export interface BookingsByTypeAnalytics {
  data: BookingsByType[];
}
