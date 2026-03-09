import { Router } from 'express';
import { z } from 'zod';
import attendanceController from './attendance.controller';
import {
  authenticate,
  authorize,
  validate,
  paginationSchema,
  idParamSchema,
} from '../../../common/middleware';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

// Device schemas
const createDeviceSchema = z.object({
  deviceName: z.string().min(1, 'Device name is required').max(100),
  deviceSerial: z.string().min(1, 'Device serial number is required').max(100),
  deviceModel: z.string().min(1, 'Device model is required').max(100),
  deviceType: z.enum(['FINGERPRINT', 'FINGERPRINT_DOOR', 'FACE', 'IRIS']).optional(),
  vendorId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  ipAddress: z.string().ip().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  doorLockType: z.enum(['NONE', 'USB_RELAY', 'SMART_LOCK_API', 'ESP32_HTTP', 'ZKTECO_DEVICE']).optional(),
  doorLockConfig: z.object({
    relayPin: z.number().int().optional(),
    apiUrl: z.string().url().optional(),
    apiKey: z.string().optional(),
    unlockDuration: z.number().int().positive().optional(),
  }).optional(),
  location: z.string().max(200).optional(),
});

const updateDeviceSchema = createDeviceSchema.partial().omit({ deviceSerial: true }).extend({
  isActive: z.boolean().optional(),
});

const deviceIdParamSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
});

// Biometric enrollment schemas
const enrollBiometricSchema = z.object({
  fingerTemplate: z.string().min(1, 'Fingerprint template is required'),
  fingerPosition: z.enum([
    'RIGHT_THUMB', 'RIGHT_INDEX', 'RIGHT_MIDDLE', 'RIGHT_RING', 'RIGHT_LITTLE',
    'LEFT_THUMB', 'LEFT_INDEX', 'LEFT_MIDDLE', 'LEFT_RING', 'LEFT_LITTLE'
  ]),
  quality: z.number().int().min(0).max(100).optional(),
  deviceId: z.string().uuid().optional(),
  isBackupFinger: z.boolean().optional(),
});

const updateBiometricSchema = enrollBiometricSchema.partial();

const verifyBiometricSchema = z.object({
  fingerTemplate: z.string().min(1, 'Fingerprint template is required'),
  deviceId: z.string().uuid().optional(),
});

const memberIdParamSchema = z.object({
  memberId: z.string().uuid('Invalid member ID format'),
});

// Attendance schemas
const checkInSchema = z.object({
  fingerTemplate: z.string().min(1, 'Fingerprint template is required'),
  deviceId: z.string().uuid().optional(),
  unlockDoor: z.boolean().optional(),
});

const checkOutSchema = z.object({
  fingerTemplate: z.string().min(1, 'Fingerprint template is required'),
  deviceId: z.string().uuid().optional(),
});

const identifySchema = z.object({
  fingerTemplate: z.string().min(1, 'Fingerprint template is required'),
});

const manualAttendanceSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  attendanceDate: z.string().datetime().optional(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  reason: z.string().min(1, 'Reason is required').max(500),
});

const updateAttendanceSchema = z.object({
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  status: z.enum(['CHECKED_IN', 'CHECKED_OUT', 'ABSENT']).optional(),
  manualEntryReason: z.string().max(500).optional(),
});

const attendanceIdParamSchema = z.object({
  attendanceId: z.string().uuid('Invalid attendance ID format'),
});

// Query schemas
const attendanceQuerySchema = paginationSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  memberId: z.string().uuid().optional(),
  status: z.enum(['CHECKED_IN', 'CHECKED_OUT', 'ABSENT']).optional(),
});

const reportQuerySchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  year: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  month: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

const calendarQuerySchema = z.object({
  year: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  month: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

const gymIdParamSchema = z.object({
  gymId: z.string().uuid('Invalid gym ID format'),
});

// ============================================
// Gym Owner Routes - Biometric Devices
// ============================================

const gymOwnerDeviceRoutes = Router();
gymOwnerDeviceRoutes.use(authenticate, authorize('GYM_OWNER'));

/**
 * @swagger
 * /api/v1/gym-owner/biometric-devices:
 *   post:
 *     summary: Register a new biometric device
 *     tags: [Gym Owner - Biometric Devices]
 *     security:
 *       - bearerAuth: []
 */
gymOwnerDeviceRoutes.post(
  '/',
  validate(createDeviceSchema),
  attendanceController.createDevice.bind(attendanceController)
);

/**
 * @swagger
 * /api/v1/gym-owner/biometric-devices:
 *   get:
 *     summary: List all biometric devices for the gym
 *     tags: [Gym Owner - Biometric Devices]
 */
gymOwnerDeviceRoutes.get(
  '/',
  validate(paginationSchema, 'query'),
  attendanceController.getDevices.bind(attendanceController)
);

gymOwnerDeviceRoutes.get(
  '/:deviceId',
  validate(deviceIdParamSchema, 'params'),
  attendanceController.getDeviceById.bind(attendanceController)
);

gymOwnerDeviceRoutes.put(
  '/:deviceId',
  validate(deviceIdParamSchema, 'params'),
  validate(updateDeviceSchema),
  attendanceController.updateDevice.bind(attendanceController)
);

gymOwnerDeviceRoutes.delete(
  '/:deviceId',
  validate(deviceIdParamSchema, 'params'),
  attendanceController.deleteDevice.bind(attendanceController)
);

gymOwnerDeviceRoutes.post(
  '/:deviceId/test',
  validate(deviceIdParamSchema, 'params'),
  attendanceController.testDeviceConnection.bind(attendanceController)
);

// ============================================
// Gym Owner Routes - Member Biometric Enrollment
// ============================================

const gymOwnerBiometricRoutes = Router();
gymOwnerBiometricRoutes.use(authenticate, authorize('GYM_OWNER'));

/**
 * @swagger
 * /api/v1/gym-owner/members/{memberId}/biometric/enroll:
 *   post:
 *     summary: Enroll member fingerprint
 *     tags: [Gym Owner - Member Biometric]
 */
gymOwnerBiometricRoutes.post(
  '/:memberId/biometric/enroll',
  validate(memberIdParamSchema, 'params'),
  validate(enrollBiometricSchema),
  attendanceController.enrollMemberBiometric.bind(attendanceController)
);

gymOwnerBiometricRoutes.get(
  '/:memberId/biometric/status',
  validate(memberIdParamSchema, 'params'),
  attendanceController.getBiometricStatus.bind(attendanceController)
);

gymOwnerBiometricRoutes.put(
  '/:memberId/biometric/update',
  validate(memberIdParamSchema, 'params'),
  validate(updateBiometricSchema),
  attendanceController.updateMemberBiometric.bind(attendanceController)
);

gymOwnerBiometricRoutes.delete(
  '/:memberId/biometric',
  validate(memberIdParamSchema, 'params'),
  attendanceController.deleteMemberBiometric.bind(attendanceController)
);

gymOwnerBiometricRoutes.post(
  '/:memberId/biometric/verify',
  validate(memberIdParamSchema, 'params'),
  validate(verifyBiometricSchema),
  attendanceController.verifyMemberBiometric.bind(attendanceController)
);

// ============================================
// Gym Owner Routes - Attendance Management
// ============================================

const gymOwnerAttendanceRoutes = Router();
gymOwnerAttendanceRoutes.use(authenticate, authorize('GYM_OWNER'));

/**
 * @swagger
 * /api/v1/gym-owner/attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Gym Owner - Attendance]
 */
gymOwnerAttendanceRoutes.get(
  '/',
  validate(attendanceQuerySchema, 'query'),
  attendanceController.getAttendanceRecords.bind(attendanceController)
);

gymOwnerAttendanceRoutes.get(
  '/today',
  attendanceController.getTodayAttendance.bind(attendanceController)
);

gymOwnerAttendanceRoutes.get(
  '/member/:memberId',
  validate(memberIdParamSchema, 'params'),
  validate(attendanceQuerySchema, 'query'),
  attendanceController.getMemberAttendanceHistory.bind(attendanceController)
);

gymOwnerAttendanceRoutes.post(
  '/manual',
  validate(manualAttendanceSchema),
  attendanceController.createManualAttendance.bind(attendanceController)
);

gymOwnerAttendanceRoutes.put(
  '/:attendanceId',
  validate(attendanceIdParamSchema, 'params'),
  validate(updateAttendanceSchema),
  attendanceController.updateAttendance.bind(attendanceController)
);

// Reports
gymOwnerAttendanceRoutes.get(
  '/reports/daily',
  validate(reportQuerySchema, 'query'),
  attendanceController.getDailyReport.bind(attendanceController)
);

gymOwnerAttendanceRoutes.get(
  '/reports/weekly',
  validate(reportQuerySchema, 'query'),
  attendanceController.getWeeklyReport.bind(attendanceController)
);

gymOwnerAttendanceRoutes.get(
  '/reports/monthly',
  validate(reportQuerySchema, 'query'),
  attendanceController.getMonthlyReport.bind(attendanceController)
);

// ============================================
// Attendance Kiosk Routes (for check-in terminals)
// ============================================

const kioskRoutes = Router();
kioskRoutes.use(authenticate, authorize('GYM_OWNER')); // Device uses gym owner token

/**
 * @swagger
 * /api/v1/attendance/check-in:
 *   post:
 *     summary: Mark attendance via fingerprint check-in
 *     tags: [Attendance - Kiosk]
 */
kioskRoutes.post(
  '/check-in',
  validate(checkInSchema),
  attendanceController.checkIn.bind(attendanceController)
);

kioskRoutes.post(
  '/check-out',
  validate(checkOutSchema),
  attendanceController.checkOut.bind(attendanceController)
);

kioskRoutes.post(
  '/identify',
  validate(identifySchema),
  attendanceController.identifyMember.bind(attendanceController)
);

kioskRoutes.get(
  '/today/:gymId',
  validate(gymIdParamSchema, 'params'),
  attendanceController.getTodayAttendanceForGym.bind(attendanceController)
);

// ============================================
// Member Self-Service Routes
// ============================================

const memberRoutes = Router();
memberRoutes.use(authenticate, authorize('MEMBER', 'PT_MEMBER'));

/**
 * @swagger
 * /api/v1/member/attendance/my-attendance:
 *   get:
 *     summary: Get own attendance history
 *     tags: [Member - Attendance]
 */
memberRoutes.get(
  '/my-attendance',
  validate(attendanceQuerySchema, 'query'),
  attendanceController.getMyAttendance.bind(attendanceController)
);

memberRoutes.get(
  '/my-attendance/summary',
  attendanceController.getMyAttendanceSummary.bind(attendanceController)
);

memberRoutes.get(
  '/my-attendance/calendar',
  validate(calendarQuerySchema, 'query'),
  attendanceController.getMyAttendanceCalendar.bind(attendanceController)
);

memberRoutes.get(
  '/my-attendance/streak',
  attendanceController.getMyAttendanceStreak.bind(attendanceController)
);

// ============================================
// Admin Routes (System-wide)
// ============================================

const adminRoutes = Router();
adminRoutes.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/admin/attendance/all:
 *   get:
 *     summary: Get all gyms attendance (admin only)
 *     tags: [Admin - Attendance]
 */
adminRoutes.get(
  '/all',
  validate(attendanceQuerySchema, 'query'),
  attendanceController.getAllGymsAttendance.bind(attendanceController)
);

adminRoutes.get(
  '/gym/:gymId',
  validate(gymIdParamSchema, 'params'),
  validate(attendanceQuerySchema, 'query'),
  attendanceController.getGymAttendance.bind(attendanceController)
);

adminRoutes.get(
  '/devices',
  validate(paginationSchema, 'query'),
  attendanceController.getAllDevices.bind(attendanceController)
);

// ============================================
// Export Routes
// ============================================

export {
  gymOwnerDeviceRoutes,
  gymOwnerBiometricRoutes,
  gymOwnerAttendanceRoutes,
  kioskRoutes as attendanceKioskRoutes,
  memberRoutes as memberAttendanceRoutes,
  adminRoutes as adminAttendanceRoutes,
};

// Combined router for backward compatibility
const combinedRouter = Router();

// Mount all sub-routes
export default combinedRouter;
