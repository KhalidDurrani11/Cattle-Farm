export interface VerificationDocument {
  type: 'cnic' | 'business_registration' | 'farm_certificate' | 'other';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface VaccinationRecord {
  name: string;
  date: string;
  nextDue?: string;
  veterinarian?: string;
  certificateUrl?: string;
}

export interface CattleVerification {
  isVerified: boolean;
  status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  veterinarianId?: string;
  healthScore?: number;
  vaccinationRecords: VaccinationRecord[];
  rejectionReason?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cnic?: string;
  role: 'farmer' | 'buyer' | 'trader' | 'vet' | 'admin';
  location?: string;
  avatar?: string;
  verificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  verificationDocuments: VerificationDocument[];
  rating: number;
  ratingCount: number;
  totalSales: number;
  totalPurchases: number;
  joinedAt: string;
  lastActive: string;
  isBanned: boolean;
  banReason?: string;
}

export interface Cattle {
  _id: string;
  name: string;
  breed: string;
  category: 'Bull' | 'Cow' | 'Calf' | 'Buffalo' | 'Goat' | 'Sheep' | 'Other';
  price: number;
  originalPrice?: number;
  age: string;
  weight: string;
  gender: 'Male' | 'Female';
  location: string;
  tehsil?: string;
  district?: string;
  province?: 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'Gilgit-Baltistan' | 'Islamabad';
  description?: string;
  images: string[];
  status: 'available' | 'sold' | 'reserved' | 'pending' | 'unavailable';
  isFeatured: boolean;
  views: number;
  inquiries: number;
  sellerId: User | string;
  buyerId?: string;
  soldAt?: string;
  soldPrice?: number;
  verification: CattleVerification;
  healthNotes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  cattleId: Cattle | string;
  sellerId: string;
  buyerId: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  paymentMethod?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  reservedListings: number;
  totalViews: number;
  totalInquiries: number;
  totalRevenue: number;
  averagePrice: number;
  monthlySales: { month: string; count: number; revenue: number }[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'view' | 'inquiry' | 'sale' | 'listing_created' | 'listing_updated' | 'verification_submitted' | 'verification_approved';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Inquiry {
  _id: string;
  cattleId: Cattle | string;
  buyerId: User | string;
  sellerId: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  reviewerId: User | string;
  reviewedId: string;
  rating: number;
  comment: string;
  transactionId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CattleFilter {
  breed?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  province?: string;
  status?: string;
  verificationStatus?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'views' | 'oldest';
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
