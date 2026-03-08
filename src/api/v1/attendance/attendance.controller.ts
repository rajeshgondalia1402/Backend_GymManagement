import { Response, NextFunction } from 'express';
import attendanceService from './attendance.service';
import { successResponse, paginatedResponse } from '../../../common/utils';
import { AuthRequest } from '../../../common/middleware';
import { BadRequestException } from '../../../common/exceptions';

class AttendanceController {
  // ============================================
  // Helper Methods
  // ============================================

  private getGymId(req: AuthRequest): string {
    if (!req.user?.gymId) {
      throw new BadRequestException('No gym associated with this account');
    }
    return req.user.gymId;
  }

  private getMemberId(req: AuthRequest): string {
    if (!req.user?.memberId) {
      throw new BadRequestException('No member profile associated with this account');
    }
    return req.user.memberId;
  }

  private getUserId(req: AuthRequest): string {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return req.user.id;
  }

  // ============================================
  // Biometric Device Management (Gym Owner)
  // ============================================

  async createDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = this.getUserId(req);
      const device = await attendanceService.createDevice(gymId, userId, req.body);
      successResponse(res, device, 'Device registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getDevices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getDevices(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'Devices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDeviceById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { deviceId } = req.params;
      const device = await attendanceService.getDeviceById(gymId, deviceId);
      successResponse(res, device, 'Device retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { deviceId } = req.params;
      const device = await attendanceService.updateDevice(gymId, deviceId, req.body);
      successResponse(res, device, 'Device updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDevice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { deviceId } = req.params;
      await attendanceService.deleteDevice(gymId, deviceId);
      successResponse(res, null, 'Device deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async testDeviceConnection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { deviceId } = req.params;
      // Get device to verify it exists
      await attendanceService.getDeviceById(gymId, deviceId);
      // Update device status
      const status = await attendanceService.updateDeviceStatus(deviceId, true);
      successResponse(res, status, 'Device connection test successful');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Member Biometric Enrollment (Gym Owner)
  // ============================================

  async enrollMemberBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = this.getUserId(req);
      const { memberId } = req.params;
      const biometric = await attendanceService.enrollMemberBiometric(gymId, memberId, userId, req.body);
      successResponse(res, biometric, 'Fingerprint enrolled successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getBiometricStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { memberId } = req.params;
      const status = await attendanceService.getBiometricStatus(gymId, memberId);
      successResponse(res, status, 'Biometric status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMemberBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = this.getUserId(req);
      const { memberId } = req.params;
      const biometric = await attendanceService.updateMemberBiometric(gymId, memberId, userId, req.body);
      successResponse(res, biometric, 'Fingerprint updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMemberBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { memberId } = req.params;
      await attendanceService.deleteMemberBiometric(gymId, memberId);
      successResponse(res, null, 'Biometric data deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async verifyMemberBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await attendanceService.verifyFingerprint(gymId, req.body);
      successResponse(res, result, result.isMatch ? 'Fingerprint verified' : 'Fingerprint not recognized');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Attendance Check-In/Check-Out (Kiosk)
  // ============================================

  async checkIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await attendanceService.checkIn(gymId, req.body);
      if (result.success) {
        successResponse(res, result, result.message, 201);
      } else {
        successResponse(res, result, result.message, result.alreadyCheckedIn ? 200 : 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const result = await attendanceService.checkOut(gymId, req.body);
      if (result.success) {
        successResponse(res, result, result.message);
      } else {
        successResponse(res, result, result.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async identifyMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { fingerTemplate } = req.body;
      const result = await attendanceService.identifyMember(gymId, fingerTemplate);
      successResponse(res, result, result.isMatch ? 'Member identified' : 'Member not found');
    } catch (error) {
      next(error);
    }
  }

  async getTodayAttendanceForGym(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = req.params.gymId || this.getGymId(req);
      const attendance = await attendanceService.getTodayAttendanceForGym(gymId);
      successResponse(res, attendance, 'Today\'s attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Attendance Management (Gym Owner)
  // ============================================

  async getAttendanceRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { page = 1, limit = 10, search, sortBy, sortOrder, startDate, endDate, memberId, status } = req.query as any;
      const result = await attendanceService.getAttendanceRecords(gymId, {
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        memberId,
        status,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'Attendance records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTodayAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const summary = await attendanceService.getTodayAttendance(gymId);
      successResponse(res, summary, 'Today\'s attendance summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMemberAttendanceHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { memberId } = req.params;
      const { page = 1, limit = 10, startDate, endDate, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getMemberAttendanceHistory(gymId, memberId, {
        page: Number(page),
        limit: Number(limit),
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      successResponse(res, result, 'Member attendance history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createManualAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = this.getUserId(req);
      const attendance = await attendanceService.createManualAttendance(gymId, userId, req.body);
      successResponse(res, attendance, 'Manual attendance entry created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const userId = this.getUserId(req);
      const { attendanceId } = req.params;
      const attendance = await attendanceService.updateAttendance(gymId, attendanceId, userId, req.body);
      successResponse(res, attendance, 'Attendance record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Reports (Gym Owner)
  // ============================================

  async getDailyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { date } = req.query as any;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const report = await attendanceService.getDailyReport(gymId, targetDate);
      successResponse(res, report, 'Daily report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { startDate } = req.query as any;
      const start = startDate || new Date().toISOString().split('T')[0];
      const report = await attendanceService.getWeeklyReport(gymId, start);
      successResponse(res, report, 'Weekly report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gymId = this.getGymId(req);
      const { year, month } = req.query as any;
      const now = new Date();
      const targetYear = year ? Number(year) : now.getFullYear();
      const targetMonth = month ? Number(month) : now.getMonth() + 1;
      const report = await attendanceService.getMonthlyReport(gymId, targetYear, targetMonth);
      successResponse(res, report, 'Monthly report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Member Self-Service
  // ============================================

  async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = this.getMemberId(req);
      const { page = 1, limit = 10, startDate, endDate, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getMyAttendance(memberId, {
        page: Number(page),
        limit: Number(limit),
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'Attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendanceSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = this.getMemberId(req);
      const summary = await attendanceService.getMyAttendanceSummary(memberId);
      successResponse(res, summary, 'Attendance summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendanceCalendar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = this.getMemberId(req);
      const { year, month } = req.query as any;
      const now = new Date();
      const targetYear = year ? Number(year) : now.getFullYear();
      const targetMonth = month ? Number(month) : now.getMonth() + 1;
      const calendar = await attendanceService.getMyAttendanceCalendar(memberId, targetYear, targetMonth);
      successResponse(res, calendar, 'Attendance calendar retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendanceStreak(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const memberId = this.getMemberId(req);
      const streak = await attendanceService.getMyAttendanceStreak(memberId);
      successResponse(res, streak, 'Attendance streak retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Admin System-wide Endpoints
  // ============================================

  async getAllGymsAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, startDate, endDate, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getAllGymsAttendance({
        page: Number(page),
        limit: Number(limit),
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'All gyms attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getGymAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gymId } = req.params;
      const { page = 1, limit = 10, startDate, endDate, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getAttendanceRecords(gymId, {
        page: Number(page),
        limit: Number(limit),
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'Gym attendance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllDevices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query as any;
      const result = await attendanceService.getAllDevices({
        page: Number(page),
        limit: Number(limit),
        search,
        sortBy,
        sortOrder,
      });
      paginatedResponse(res, result.items, Number(page), Number(limit), result.total, 'All devices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
