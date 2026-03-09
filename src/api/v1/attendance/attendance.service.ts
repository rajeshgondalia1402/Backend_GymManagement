import { prisma } from '../../../config/database';
import { NotFoundException, ConflictException, BadRequestException } from '../../../common/exceptions';
import {
  BiometricDevice,
  CreateBiometricDeviceRequest,
  UpdateBiometricDeviceRequest,
  DeviceConnectionStatus,
  MemberBiometric,
  EnrollBiometricRequest,
  UpdateBiometricRequest,
  BiometricEnrollmentStatus,
  VerifyBiometricRequest,
  VerifyBiometricResponse,
  Attendance,
  AttendanceWithMember,
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  ManualAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceListParams,
  DailyAttendanceSummary,
  MemberAttendanceSummary,
  AttendanceReport,
  AttendanceStreak,
  AttendanceCalendarEntry,
  PaginationParams,
  FingerPosition,
  AttendanceStatus,
  VerificationMethod,
} from './attendance.types';

class AttendanceService {
  // ============================================
  // Biometric Device Management
  // ============================================

  async createDevice(gymId: string, userId: string, data: CreateBiometricDeviceRequest): Promise<BiometricDevice> {
    // Check if device serial already exists
    const existingSerial = await prisma.biometricDevice.findUnique({
      where: { deviceSerial: data.deviceSerial }
    });
    if (existingSerial) {
      throw new ConflictException('Device with this serial number already exists');
    }

    // Check if device name is unique within the gym
    const existingName = await prisma.biometricDevice.findUnique({
      where: { gymId_deviceName: { gymId, deviceName: data.deviceName } }
    });
    if (existingName) {
      throw new ConflictException('A device with this name already exists in your gym');
    }

    const device = await prisma.biometricDevice.create({
      data: {
        gymId,
        deviceName: data.deviceName,
        deviceSerial: data.deviceSerial,
        deviceModel: data.deviceModel,
        deviceType: data.deviceType || 'FINGERPRINT',
        vendorId: data.vendorId,
        productId: data.productId,
        ipAddress: data.ipAddress,
        port: data.port,
        doorLockType: data.doorLockType || 'NONE',
        doorLockConfig: data.doorLockConfig,
        location: data.location,
        registeredBy: userId,
      }
    });

    return device as BiometricDevice;
  }

  async getDevices(gymId: string, params: PaginationParams): Promise<{ items: BiometricDevice[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'registeredAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      gymId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' } },
        { deviceModel: { contains: search, mode: 'insensitive' } },
        { deviceSerial: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.biometricDevice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.biometricDevice.count({ where }),
    ]);

    return { items: items as BiometricDevice[], total };
  }

  async getDeviceById(gymId: string, deviceId: string): Promise<BiometricDevice> {
    const device = await prisma.biometricDevice.findFirst({
      where: { id: deviceId, gymId, isActive: true }
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device as BiometricDevice;
  }

  async updateDevice(gymId: string, deviceId: string, data: UpdateBiometricDeviceRequest): Promise<BiometricDevice> {
    const device = await this.getDeviceById(gymId, deviceId);

    // Check unique constraint for name if changing
    if (data.deviceName && data.deviceName !== device.deviceName) {
      const existingName = await prisma.biometricDevice.findUnique({
        where: { gymId_deviceName: { gymId, deviceName: data.deviceName } }
      });
      if (existingName) {
        throw new ConflictException('A device with this name already exists in your gym');
      }
    }

    const updated = await prisma.biometricDevice.update({
      where: { id: deviceId },
      data: {
        deviceName: data.deviceName,
        deviceModel: data.deviceModel,
        deviceType: data.deviceType,
        vendorId: data.vendorId,
        productId: data.productId,
        ipAddress: data.ipAddress,
        port: data.port,
        doorLockType: data.doorLockType,
        doorLockConfig: data.doorLockConfig,
        location: data.location,
        isActive: data.isActive,
      }
    });

    return updated as BiometricDevice;
  }

  async deleteDevice(gymId: string, deviceId: string): Promise<void> {
    await this.getDeviceById(gymId, deviceId);

    // Soft delete
    await prisma.biometricDevice.update({
      where: { id: deviceId },
      data: { isActive: false }
    });
  }

  async updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<DeviceConnectionStatus> {
    const updated = await prisma.biometricDevice.update({
      where: { id: deviceId },
      data: {
        isOnline,
        lastSeenAt: isOnline ? new Date() : undefined,
      }
    });

    return {
      deviceId: updated.id,
      isOnline: updated.isOnline,
      lastSeenAt: updated.lastSeenAt,
    };
  }

  // ============================================
  // Member Biometric Enrollment
  // ============================================

  async enrollMemberBiometric(
    gymId: string,
    memberId: string,
    enrolledBy: string,
    data: EnrollBiometricRequest
  ): Promise<MemberBiometric> {
    // Verify member belongs to this gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId, isActive: true }
    });

    if (!member) {
      throw new NotFoundException('Member not found in this gym');
    }

    // Check if member already has biometric record
    const existingBiometric = await prisma.memberBiometric.findUnique({
      where: { memberId }
    });

    // Convert base64 template to Buffer
    const templateBuffer = Buffer.from(data.fingerTemplate, 'base64');

    if (existingBiometric) {
      // Update existing record
      if (data.isBackupFinger) {
        // Enroll as backup finger
        const updated = await prisma.memberBiometric.update({
          where: { memberId },
          data: {
            fingerTemplate2: templateBuffer,
            fingerPosition2: data.fingerPosition,
            quality2: data.quality,
            deviceId: data.deviceId,
            enrolledBy,
          }
        });
        return updated as MemberBiometric;
      } else {
        // Update primary finger
        const updated = await prisma.memberBiometric.update({
          where: { memberId },
          data: {
            fingerTemplate1: templateBuffer,
            fingerPosition1: data.fingerPosition,
            quality1: data.quality,
            deviceId: data.deviceId,
            enrolledBy,
          }
        });
        return updated as MemberBiometric;
      }
    }

    // Create new biometric record
    const biometric = await prisma.memberBiometric.create({
      data: {
        memberId,
        gymId,
        fingerTemplate1: templateBuffer,
        fingerPosition1: data.fingerPosition,
        quality1: data.quality,
        deviceId: data.deviceId,
        enrolledBy,
      }
    });

    return biometric as MemberBiometric;
  }

  async getBiometricStatus(gymId: string, memberId: string): Promise<BiometricEnrollmentStatus> {
    const biometric = await prisma.memberBiometric.findFirst({
      where: { memberId, gymId, isActive: true }
    });

    if (!biometric) {
      return {
        isEnrolled: false,
        hasBackupFinger: false,
      };
    }

    return {
      isEnrolled: true,
      enrolledAt: biometric.enrolledAt,
      fingerPosition1: biometric.fingerPosition1,
      fingerPosition2: biometric.fingerPosition2,
      hasBackupFinger: !!biometric.fingerTemplate2,
    };
  }

  async updateMemberBiometric(
    gymId: string,
    memberId: string,
    enrolledBy: string,
    data: UpdateBiometricRequest
  ): Promise<MemberBiometric> {
    const biometric = await prisma.memberBiometric.findFirst({
      where: { memberId, gymId, isActive: true }
    });

    if (!biometric) {
      throw new NotFoundException('Biometric record not found for this member');
    }

    const updateData: any = { enrolledBy };

    if (data.fingerTemplate) {
      const templateBuffer = Buffer.from(data.fingerTemplate, 'base64');
      if (data.isBackupFinger) {
        updateData.fingerTemplate2 = templateBuffer;
        updateData.fingerPosition2 = data.fingerPosition;
        updateData.quality2 = data.quality;
      } else {
        updateData.fingerTemplate1 = templateBuffer;
        updateData.fingerPosition1 = data.fingerPosition;
        updateData.quality1 = data.quality;
      }
    }

    const updated = await prisma.memberBiometric.update({
      where: { id: biometric.id },
      data: updateData
    });

    return updated as MemberBiometric;
  }

  async deleteMemberBiometric(gymId: string, memberId: string): Promise<void> {
    const biometric = await prisma.memberBiometric.findFirst({
      where: { memberId, gymId }
    });

    if (!biometric) {
      throw new NotFoundException('Biometric record not found');
    }

    // Soft delete
    await prisma.memberBiometric.update({
      where: { id: biometric.id },
      data: { isActive: false }
    });
  }

  async verifyFingerprint(gymId: string, data: VerifyBiometricRequest): Promise<VerifyBiometricResponse> {
    // Get all active biometrics for this gym
    const biometrics = await prisma.memberBiometric.findMany({
      where: { gymId, isActive: true },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            memberPhoto: true,
          }
        }
      }
    });

    const inputTemplate = Buffer.from(data.fingerTemplate, 'base64');

    // In a real implementation, you would use a fingerprint matching library
    // For now, we'll do a simple comparison (in production, use proper SDK matching)
    for (const biometric of biometrics) {
      // Check finger 1
      if (biometric.fingerTemplate1) {
        const storedTemplate = Buffer.from(biometric.fingerTemplate1);
        const matchScore = this.compareTemplates(inputTemplate, storedTemplate);
        if (matchScore >= 70) { // 70% threshold
          return {
            isMatch: true,
            matchScore,
            memberId: biometric.memberId,
            memberName: biometric.member.name,
            memberPhoto: biometric.member.memberPhoto,
          };
        }
      }

      // Check finger 2
      if (biometric.fingerTemplate2) {
        const storedTemplate = Buffer.from(biometric.fingerTemplate2);
        const matchScore = this.compareTemplates(inputTemplate, storedTemplate);
        if (matchScore >= 70) {
          return {
            isMatch: true,
            matchScore,
            memberId: biometric.memberId,
            memberName: biometric.member.name,
            memberPhoto: biometric.member.memberPhoto,
          };
        }
      }
    }

    return { isMatch: false };
  }

  // Simple template comparison (placeholder - use actual SDK in production)
  private compareTemplates(template1: Buffer, template2: Buffer): number {
    // In production, use the fingerprint SDK's matching function
    // This is a placeholder that compares buffer equality
    if (template1.equals(template2)) {
      return 100;
    }
    // For demo purposes, we'll return 0 for non-matching
    // Real implementation would use proper matching algorithm
    return 0;
  }

  // ============================================
  // Attendance Check-In/Check-Out
  // ============================================

  async checkIn(gymId: string, data: CheckInRequest): Promise<CheckInResponse> {
    // Verify fingerprint and identify member
    const verification = await this.verifyFingerprint(gymId, {
      fingerTemplate: data.fingerTemplate,
      deviceId: data.deviceId,
    });

    if (!verification.isMatch || !verification.memberId) {
      return {
        success: false,
        message: 'Fingerprint not recognized. Please try again or contact staff.',
      };
    }

    // Get member details
    const member = await prisma.member.findFirst({
      where: { id: verification.memberId, gymId, isActive: true },
      select: {
        id: true,
        name: true,
        memberId: true,
        memberPhoto: true,
        membershipStatus: true,
        membershipEnd: true,
      }
    });

    if (!member) {
      return {
        success: false,
        message: 'Member not found or inactive.',
      };
    }

    // Check if membership is active
    if (member.membershipStatus !== 'ACTIVE' || new Date(member.membershipEnd) < new Date()) {
      return {
        success: false,
        message: 'Membership has expired. Please renew your membership.',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        memberId_attendanceDate: {
          memberId: member.id,
          attendanceDate: today,
        }
      }
    });

    if (existingAttendance) {
      return {
        success: false,
        message: 'Already checked in today.',
        alreadyCheckedIn: true,
        attendance: existingAttendance as Attendance,
        member: {
          id: member.id,
          name: member.name,
          memberId: member.memberId,
          memberPhoto: member.memberPhoto,
        },
      };
    }

    // Create attendance record
    const now = new Date();
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        gymId,
        attendanceDate: today,
        checkInTime: now,
        verificationMethod: 'FINGERPRINT',
        verificationScore: verification.matchScore,
        deviceId: data.deviceId,
        status: 'CHECKED_IN',
        doorUnlocked: data.unlockDoor || false,
        doorUnlockTime: data.unlockDoor ? now : null,
      }
    });

    return {
      success: true,
      attendance: attendance as Attendance,
      member: {
        id: member.id,
        name: member.name,
        memberId: member.memberId,
        memberPhoto: member.memberPhoto,
      },
      doorUnlocked: data.unlockDoor || false,
      message: `Welcome, ${member.name}! Check-in successful.`,
    };
  }

  async checkOut(gymId: string, data: CheckOutRequest): Promise<CheckOutResponse> {
    // Verify fingerprint
    const verification = await this.verifyFingerprint(gymId, {
      fingerTemplate: data.fingerTemplate,
      deviceId: data.deviceId,
    });

    if (!verification.isMatch || !verification.memberId) {
      return {
        success: false,
        message: 'Fingerprint not recognized.',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await prisma.attendance.findUnique({
      where: {
        memberId_attendanceDate: {
          memberId: verification.memberId,
          attendanceDate: today,
        }
      }
    });

    if (!attendance) {
      return {
        success: false,
        message: 'No check-in found for today.',
      };
    }

    if (attendance.status === 'CHECKED_OUT') {
      return {
        success: false,
        message: 'Already checked out.',
      };
    }

    const now = new Date();
    const durationMinutes = Math.round(
      (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60)
    );

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: now,
        durationMinutes,
        status: 'CHECKED_OUT',
      }
    });

    return {
      success: true,
      attendance: updated as Attendance,
      durationMinutes,
      message: `Goodbye! Total time: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
    };
  }

  async identifyMember(gymId: string, fingerTemplate: string): Promise<VerifyBiometricResponse> {
    return this.verifyFingerprint(gymId, { fingerTemplate });
  }

  // ============================================
  // Attendance Management (Gym Owner)
  // ============================================

  async getAttendanceRecords(
    gymId: string,
    params: AttendanceListParams
  ): Promise<{ items: AttendanceWithMember[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'checkInTime',
      sortOrder = 'desc',
      startDate,
      endDate,
      memberId,
      status,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = { gymId };

    if (startDate || endDate) {
      where.attendanceDate = {};
      if (startDate) {
        where.attendanceDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.attendanceDate.lte = new Date(endDate);
      }
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.member = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { memberId: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              memberId: true,
              memberPhoto: true,
            }
          }
        }
      }),
      prisma.attendance.count({ where }),
    ]);

    return { items: items as AttendanceWithMember[], total };
  }

  async getTodayAttendance(gymId: string): Promise<DailyAttendanceSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        gymId,
        attendanceDate: today,
      }
    });

    const totalCheckIns = attendance.length;
    const totalCheckOuts = attendance.filter(a => a.status === 'CHECKED_OUT').length;
    const currentlyInGym = attendance.filter(a => a.status === 'CHECKED_IN').length;

    const completedVisits = attendance.filter(a => a.durationMinutes);
    const averageDuration = completedVisits.length > 0
      ? Math.round(completedVisits.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / completedVisits.length)
      : undefined;

    return {
      date: today.toISOString().split('T')[0],
      totalCheckIns,
      totalCheckOuts,
      currentlyInGym,
      averageDuration,
    };
  }

  async getMemberAttendanceHistory(
    gymId: string,
    memberId: string,
    params: AttendanceListParams
  ): Promise<{ items: Attendance[]; total: number; summary: MemberAttendanceSummary }> {
    // Verify member belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId }
    });

    if (!member) {
      throw new NotFoundException('Member not found in this gym');
    }

    const { page = 1, limit = 10, startDate, endDate, sortBy = 'attendanceDate', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { memberId, gymId };

    if (startDate || endDate) {
      where.attendanceDate = {};
      if (startDate) where.attendanceDate.gte = new Date(startDate);
      if (endDate) where.attendanceDate.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.attendance.count({ where }),
    ]);

    // Calculate summary
    const allAttendance = await prisma.attendance.findMany({
      where: { memberId, gymId },
      orderBy: { attendanceDate: 'desc' },
    });

    const totalDays = this.calculateMembershipDays(member.membershipStart, new Date());
    const presentDays = allAttendance.length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const completedVisits = allAttendance.filter(a => a.durationMinutes);
    const averageDuration = completedVisits.length > 0
      ? Math.round(completedVisits.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / completedVisits.length)
      : undefined;

    const summary: MemberAttendanceSummary = {
      memberId: member.id,
      memberName: member.name || '',
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      averageDuration,
      lastAttendance: allAttendance[0]?.attendanceDate,
    };

    return { items: items as Attendance[], total, summary };
  }

  private calculateMembershipDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async createManualAttendance(
    gymId: string,
    userId: string,
    data: ManualAttendanceRequest
  ): Promise<Attendance> {
    // Verify member belongs to gym
    const member = await prisma.member.findFirst({
      where: { id: data.memberId, gymId }
    });

    if (!member) {
      throw new NotFoundException('Member not found in this gym');
    }

    const attendanceDate = data.attendanceDate
      ? new Date(data.attendanceDate)
      : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    const existing = await prisma.attendance.findUnique({
      where: {
        memberId_attendanceDate: {
          memberId: data.memberId,
          attendanceDate,
        }
      }
    });

    if (existing) {
      throw new ConflictException('Attendance record already exists for this date');
    }

    const checkInTime = data.checkInTime ? new Date(data.checkInTime) : new Date();
    let durationMinutes: number | undefined;

    if (data.checkOutTime) {
      const checkOutTime = new Date(data.checkOutTime);
      durationMinutes = Math.round(
        (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId: data.memberId,
        gymId,
        attendanceDate,
        checkInTime,
        checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : null,
        durationMinutes,
        verificationMethod: 'MANUAL',
        status: data.checkOutTime ? 'CHECKED_OUT' : 'CHECKED_IN',
        isManualEntry: true,
        manualEntryBy: userId,
        manualEntryReason: data.reason,
      }
    });

    return attendance as Attendance;
  }

  async updateAttendance(
    gymId: string,
    attendanceId: string,
    userId: string,
    data: UpdateAttendanceRequest
  ): Promise<Attendance> {
    const attendance = await prisma.attendance.findFirst({
      where: { id: attendanceId, gymId }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const updateData: any = {
      manualEntryBy: userId,
    };

    if (data.checkInTime) {
      updateData.checkInTime = new Date(data.checkInTime);
    }

    if (data.checkOutTime) {
      updateData.checkOutTime = new Date(data.checkOutTime);
      updateData.status = 'CHECKED_OUT';

      // Recalculate duration
      const checkIn = data.checkInTime ? new Date(data.checkInTime) : attendance.checkInTime;
      const checkOut = new Date(data.checkOutTime);
      updateData.durationMinutes = Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60)
      );
    }

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.manualEntryReason) {
      updateData.manualEntryReason = data.manualEntryReason;
      updateData.isManualEntry = true;
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: updateData,
    });

    return updated as Attendance;
  }

  // ============================================
  // Reports & Analytics
  // ============================================

  async getDailyReport(gymId: string, date: string): Promise<DailyAttendanceSummary & { members: AttendanceWithMember[] }> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        gymId,
        attendanceDate: targetDate,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            memberId: true,
            memberPhoto: true,
          }
        }
      },
      orderBy: { checkInTime: 'asc' },
    });

    const totalCheckIns = attendance.length;
    const totalCheckOuts = attendance.filter(a => a.status === 'CHECKED_OUT').length;
    const currentlyInGym = attendance.filter(a => a.status === 'CHECKED_IN').length;

    const completedVisits = attendance.filter(a => a.durationMinutes);
    const averageDuration = completedVisits.length > 0
      ? Math.round(completedVisits.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / completedVisits.length)
      : undefined;

    return {
      date,
      totalCheckIns,
      totalCheckOuts,
      currentlyInGym,
      averageDuration,
      members: attendance as AttendanceWithMember[],
    };
  }

  async getWeeklyReport(gymId: string, startDate: string): Promise<AttendanceReport> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return this.generateReport(gymId, start, end, 'Weekly');
  }

  async getMonthlyReport(gymId: string, year: number, month: number): Promise<AttendanceReport> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);

    return this.generateReport(gymId, start, end, 'Monthly');
  }

  private async generateReport(
    gymId: string,
    startDate: Date,
    endDate: Date,
    period: string
  ): Promise<AttendanceReport> {
    const attendance = await prisma.attendance.findMany({
      where: {
        gymId,
        attendanceDate: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { attendanceDate: 'asc' },
    });

    // Get unique members in gym
    const totalMembers = await prisma.member.count({
      where: { gymId, isActive: true }
    });

    // Group by date
    const byDay: { [key: string]: number } = {};
    for (const record of attendance) {
      const dateKey = record.attendanceDate.toISOString().split('T')[0];
      byDay[dateKey] = (byDay[dateKey] || 0) + 1;
    }

    const dayData = Object.entries(byDay).map(([date, count]) => ({ date, count }));
    dayData.sort((a, b) => a.date.localeCompare(b.date));

    // Find peak and low days
    let peakDay: { date: Date; count: number } | undefined;
    let lowDay: { date: Date; count: number } | undefined;

    if (dayData.length > 0) {
      const sortedByCount = [...dayData].sort((a, b) => b.count - a.count);
      peakDay = { date: new Date(sortedByCount[0].date), count: sortedByCount[0].count };
      lowDay = { date: new Date(sortedByCount[sortedByCount.length - 1].date), count: sortedByCount[sortedByCount.length - 1].count };
    }

    const totalDays = this.calculateMembershipDays(startDate, endDate);
    const averageDaily = totalDays > 0 ? Math.round(attendance.length / totalDays) : 0;

    return {
      period,
      startDate,
      endDate,
      totalMembers,
      totalAttendance: attendance.length,
      averageDaily,
      peakDay,
      lowDay,
      byDay: dayData,
    };
  }

  // ============================================
  // Member Self-Service
  // ============================================

  async getMyAttendance(
    memberId: string,
    params: AttendanceListParams
  ): Promise<{ items: Attendance[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, sortBy = 'attendanceDate', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { memberId };

    if (startDate || endDate) {
      where.attendanceDate = {};
      if (startDate) where.attendanceDate.gte = new Date(startDate);
      if (endDate) where.attendanceDate.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { items: items as Attendance[], total };
  }

  async getMyAttendanceSummary(memberId: string): Promise<MemberAttendanceSummary> {
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const attendance = await prisma.attendance.findMany({
      where: { memberId },
      orderBy: { attendanceDate: 'desc' },
    });

    const totalDays = this.calculateMembershipDays(member.membershipStart, new Date());
    const presentDays = attendance.length;
    const absentDays = Math.max(0, totalDays - presentDays);
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const completedVisits = attendance.filter(a => a.durationMinutes);
    const averageDuration = completedVisits.length > 0
      ? Math.round(completedVisits.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / completedVisits.length)
      : undefined;

    return {
      memberId,
      memberName: member.name || '',
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      averageDuration,
      lastAttendance: attendance[0]?.attendanceDate,
    };
  }

  async getMyAttendanceCalendar(
    memberId: string,
    year: number,
    month: number
  ): Promise<AttendanceCalendarEntry[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        memberId,
        attendanceDate: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    const attendanceMap = new Map<string, any>();
    for (const record of attendance) {
      const dateKey = record.attendanceDate.toISOString().split('T')[0];
      attendanceMap.set(dateKey, record);
    }

    const calendar: AttendanceCalendarEntry[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      const record = attendanceMap.get(dateKey);

      if (date > today) {
        // Future date
        calendar.push({ date: dateKey, status: 'no_data' });
      } else if (record) {
        calendar.push({
          date: dateKey,
          status: 'present',
          checkInTime: record.checkInTime?.toISOString(),
          checkOutTime: record.checkOutTime?.toISOString(),
          duration: record.durationMinutes,
        });
      } else {
        calendar.push({ date: dateKey, status: 'absent' });
      }
    }

    return calendar;
  }

  async getMyAttendanceStreak(memberId: string): Promise<AttendanceStreak> {
    const attendance = await prisma.attendance.findMany({
      where: { memberId },
      orderBy: { attendanceDate: 'desc' },
      select: { attendanceDate: true }
    });

    if (attendance.length === 0) {
      return {
        memberId,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const dates = attendance.map(a => a.attendanceDate.toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...new Set(dates)].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      memberId,
      currentStreak,
      longestStreak,
      lastAttendanceDate: attendance[0]?.attendanceDate,
    };
  }

  // ============================================
  // Kiosk / Public Endpoints
  // ============================================

  async getTodayAttendanceForGym(gymId: string): Promise<AttendanceWithMember[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        gymId,
        attendanceDate: today,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            memberId: true,
            memberPhoto: true,
          }
        }
      },
      orderBy: { checkInTime: 'desc' },
    });

    return attendance as AttendanceWithMember[];
  }

  // ============================================
  // Admin Endpoints (System-wide)
  // ============================================

  async getAllGymsAttendance(params: AttendanceListParams): Promise<{ items: AttendanceWithMember[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, sortBy = 'checkInTime', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (startDate || endDate) {
      where.attendanceDate = {};
      if (startDate) where.attendanceDate.gte = new Date(startDate);
      if (endDate) where.attendanceDate.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              memberId: true,
              memberPhoto: true,
            }
          },
          gym: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      prisma.attendance.count({ where }),
    ]);

    return { items: items as any[], total };
  }

  async getAllDevices(params: PaginationParams): Promise<{ items: BiometricDevice[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'registeredAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' } },
        { deviceModel: { contains: search, mode: 'insensitive' } },
        { deviceSerial: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.biometricDevice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          gym: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      prisma.biometricDevice.count({ where }),
    ]);

    return { items: items as any[], total };
  }
}

export default new AttendanceService();
