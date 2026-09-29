export type CategoryType = 'tractor' | 'harvester' | 'sprayer' | 'tiller' | 'rotavator' | 'transplanter' | 'thresher' | 'other';

export interface EquipmentReview {
  id: string;
  equipmentId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerId?: string;
  farmerLocation?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  rentalExperience?: string; // e.g. "దుక్కి / Plowing", "కోత / Harvesting", "పిచికారీ / Spraying"
  createdAt: string;
  verifiedRental?: boolean;
}

export interface Equipment {
  id: string;
  title: string;
  titleEn: string;
  category: CategoryType;
  categoryLabel: string;
  location: string;
  locationEn: string;
  price: number;
  rateType: 'day' | 'hour';
  rateTypeLabel: string;
  imageUrl: string;
  status: 'available' | 'booked' | 'coming_soon';
  statusLabel: string;
  ownerName: string;
  ownerPhone: string;
  ownerAvatar: string;
  ownerUid?: string;
  verified?: boolean;
  isCustom?: boolean;
  description?: string;
  descriptionEn?: string;
  horsepower?: string;
  fuelType?: string;
  includesDriver?: boolean;
  specs?: string[];
  // Cascading location parts:
  state?: string;
  district?: string;
  city?: string;
  mandal?: string;
  village?: string;
  createdAt?: string;
  updatedAt?: string;
  // Star rating & Reviews
  rating?: number; // average e.g. 4.8
  reviewCount?: number; // total count e.g. 18
  reviews?: EquipmentReview[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'owner';
  text: string;
  time: string;
  isDeleted?: boolean;
}

export interface Chat {
  id: string;
  equipmentId?: string;
  equipmentTitle?: string;
  equipmentImage?: string;
  contactName: string;
  contactAvatar: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: ChatMessage[];
  senderPhone?: string;
  senderName?: string;
  senderAvatar?: string;
  ownerPhone?: string;
  ownerUid?: string;
  farmerUid?: string;
}

export interface FarmerProfile {
  uid?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  avatar: string;
  listedEquipmentIds: string[];
  bookedEquipmentIds: string[];
  role?: 'farmer' | 'owner' | 'admin';
  gender?: 'male' | 'female';
  status?: 'active' | 'suspended';
  verified?: boolean;
  aadhaarNumber?: string;
  proofFileAttached?: boolean;
  idFileAttached?: boolean;
  state?: string;
  district?: string;
  city?: string;
  mandal?: string;
  village?: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentTitle?: string;
  equipmentImage?: string;
  farmerUid: string;
  farmerName?: string;
  farmerPhone: string;
  ownerUid: string;
  ownerPhone?: string;
  startDate?: string;
  endDate?: string;
  durationHours?: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  deliveryPlace?: string;
  createdAt?: string;
  updatedAt?: string;
}
