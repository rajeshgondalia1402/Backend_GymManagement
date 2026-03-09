import {
  FingerPosition,
  AttendanceStatus,
  VerificationMethod,
  DeviceType,
  DoorLockType
} from '@prisma/client';

// ============================================
// Biometric Device Types
// ============================================

export interface BiometricDevice {
  id: string;
  gymId: string;
  deviceName: string;
  deviceSerial: string;
  deviceModel: string;
  deviceType: DeviceType;
  vendorId?: number | null;
  productId?: number | null;
  ipAddress?: string | null;
  port?: number | null;
  doorLockType: DoorLockType;
  doorLockConfig?: any;
  lastSeenAt?: Date | null;
  isOnline: boolean;
  location?: string | null;
  isActive: boolean;
  registeredAt: Date;
  registeredBy: string;
  updatedAt: Date;
}

export interface CreateBiometricDeviceRequest {
  deviceName: string;
  deviceSerial: string;
  deviceModel: string;
  deviceType?: DeviceType;
  vendorId?: number;
  productId?: number;
  ipAddress?: string;
  port?: number;
  doorLockType?: DoorLockType;
  doorLockConfig?: {
    relayPin?: number;
    apiUrl?: string;
    apiKey?: string;
    unlockDuration?: number; // milliseconds
  };
  location?: string;
}

export interface UpdateBiometricDeviceRequest {
  deviceName?: string;
  deviceModel?: string;
  deviceType?: DeviceType;
  vendorId?: number;
  productId?: number;
  ipAddress?: string;
  port?: number;
  doorLockType?: DoorLockType;
  doorLockConfig?: {
    relayPin?: number;
    apiUrl?: string;
    apiKey?: string;
    unlockDuration?: number;
  };
  location?: string;
  isActive?: boolean;
}

export interface DeviceConnectionStatus {
  deviceId: string;
  isOnline: boolean;
  lastSeenAt?: Date | null;
}

// ============================================
// Member Biometric Types
// ============================================

export interface MemberBiometric {
  id: string;
  memberId: string;
  gymId: string;
  fingerTemplate1?: Buffer | null;
  fingerTemplate2?: Buffer | null;
  fingerPosition1?: FingerPosition | null;
  fingerPosition2?: FingerPosition | null;
  templateFormat: string;
  templateVersion: string;
  quality1?: number | null;
  quality2?: number | null;
  enrolledAt: Date;
  enrolledBy?: string | null;
  lastUpdatedAt: Date;
  deviceId?: string | null;
  isActive: boolean;
  failedAttempts: number;
  lastFailedAt?: Date | null;
}

export interface EnrollBiometricRequest {
  fingerTemplate: string; // Base64 encoded template
  fingerPosition: FingerPosition;
  quality?: number;
  deviceId?: string;
  isBackupFinger?: boolean; // If true, enrolls as finger 2
}

export interface UpdateBiometricRequest {
  fingerTemplate?: string;
  fingerPosition?: FingerPosition;
  quality?: number;
  isBackupFinger?: boolean;
}

export interface BiometricEnrollmentStatus {
  isEnrolled: boolean;
  enrolledAt?: Date;
  fingerPosition1?: FingerPosition | null;
  fingerPosition2?: FingerPosition | null;
  hasBackupFinger: boolean;
}

export interface VerifyBiometricRequest {
  fingerTemplate: string; // Base64 encoded template to verify
  deviceId?: string;
}

export interface VerifyBiometricResponse {
  isMatch: boolean;
  matchScore?: number;
  memberId?: string;
  memberName?: string;
  memberPhoto?: string | null;
}

// ============================================
// Attendance Types
// ============================================

export interface Attendance {
  id: string;
  memberId: string;
  gymId: string;
  attendanceDate: Date;
  checkInTime: Date;
  checkOutTime?: Date | null;
  durationMinutes?: number | null;
  verificationMethod: VerificationMethod;
  verificationScore?: number | null;
  deviceId?: string | null;
  status: AttendanceStatus;
  isManualEntry: boolean;
  manualEntryBy?: string | null;
  manualEntryReason?: string | null;
  doorUnlocked: boolean;
  doorUnlockTime?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceWithMember extends Attendance {
  member: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    memberId: string | null;
    memberPhoto: string | null;
  };
}

export interface CheckInRequest {
  fingerTemplate: string; // Base64 encoded template
  deviceId?: string;
  unlockDoor?: boolean;
}

export interface CheckInResponse {
  success: boolean;
  attendance?: Attendance;
  member?: {
    id: string;
    name: string | null;
    memberId: string | null;
    memberPhoto: string | null;
  };
  doorUnlocked?: boolean;
  message: string;
  alreadyCheckedIn?: boolean;
}

export interface CheckOutRequest {
  fingerTemplate: string;
  deviceId?: string;
}

export interface CheckOutResponse {
  success: boolean;
  attendance?: Attendance;
  durationMinutes?: number;
  message: string;
}

export interface ManualAttendanceRequest {
  memberId: string;
  attendanceDate?: string; // ISO date string, defaults to today
  checkInTime?: string; // ISO datetime string
  checkOutTime?: string;
  reason: string;
}

export interface UpdateAttendanceRequest {
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  manualEntryReason?: string;
}

// ============================================
// Attendance Reports & Analytics Types
// ============================================

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  memberId?: string;
  status?: AttendanceStatus;
}

export interface DailyAttendanceSummary {
  date: string;
  totalCheckIns: number;
  totalCheckOuts: number;
  currentlyInGym: number;
  averageDuration?: number;
}

export interface MemberAttendanceSummary {
  memberId: string;
  memberName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  averageDuration?: number;
  lastAttendance?: Date;
}

export interface AttendanceReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalMembers: number;
  totalAttendance: number;
  averageDaily: number;
  peakDay?: {
    date: Date;
    count: number;
  };
  lowDay?: {
    date: Date;
    count: number;
  };
  byDay?: { date: string; count: number }[];
}

export interface AttendanceStreak {
  memberId: string;
  currentStreak: number;
  longestStreak: number;
  lastAttendanceDate?: Date;
}

export interface AttendanceCalendarEntry {
  date: string;
  status: 'present' | 'absent' | 'no_data';
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Re-export enums for convenience
export {
  FingerPosition,
  AttendanceStatus,
  VerificationMethod,
  DeviceType,
  DoorLockType
};
