import { prisma } from '../../../config/database';
import { NotFoundException } from '../../../common/exceptions';
import {
  MemberProfile,
  UpdateProfileRequest,
  MemberDashboardStats,
  AssignedDietPlan,
  AssignedExercisePlan,
  Membership,
  MemberDietPlanListParams,
  ComprehensiveDashboard,
} from './member.types';

class MemberService {
  async getProfile(userId: string): Promise<MemberProfile> {
    // First get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    // Get the member profile
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          take: 1
        },
      },
    });

    if (!member) throw new NotFoundException('Member profile not found');

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    const memberName = member.name || user.name;
    const memberEmail = member.email || user.email;

    return {
      id: member.id,
      email: memberEmail,
      firstName: memberName.split(' ')[0] || memberName,
      lastName: memberName.split(' ').slice(1).join(' ') || '',
      phone: member.phone || undefined,
      dateOfBirth: member.dateOfBirth || undefined,
      gender: member.gender || undefined,
      address: member.address || undefined,
      emergencyContact: member.emergencyContact || undefined,
      healthNotes: member.healthNotes || undefined,
      isActive: user.isActive,
      gymId: member.gymId,
      gym: member.gym || undefined,
      trainerId: activeTrainer?.id,
      trainer: activeTrainer ? {
        id: activeTrainer.id,
        firstName: (activeTrainer.name || activeTrainer.user.name).split(' ')[0],
        lastName: (activeTrainer.name || activeTrainer.user.name).split(' ').slice(1).join(' ') || '',
        email: activeTrainer.email || activeTrainer.user.email,
        specialization: activeTrainer.specialization || undefined,
      } : undefined,
      membershipStartDate: member.membershipStart || undefined,
      membershipEndDate: member.membershipEnd || undefined,
      membershipStatus: member.membershipStatus,
      createdAt: member.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<MemberProfile> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update user name if provided
      if (data.firstName || data.lastName) {
        const currentName = user.name.split(' ');
        const newFirst = data.firstName || currentName[0];
        const newLast = data.lastName || currentName.slice(1).join(' ');
        const fullName = `${newFirst} ${newLast}`;
        await tx.user.update({
          where: { id: userId },
          data: { name: fullName }
        });
        // Sync name to Member table
        await tx.member.update({
          where: { userId },
          data: { name: fullName }
        });
      }

      // Update member data
      const memberUpdateData: any = {};
      if (data.phone) memberUpdateData.phone = data.phone;
      if (data.dateOfBirth) memberUpdateData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender) memberUpdateData.gender = data.gender;
      if (data.address) memberUpdateData.address = data.address;
      if (data.emergencyContact) memberUpdateData.emergencyContact = data.emergencyContact;
      if (data.healthNotes) memberUpdateData.healthNotes = data.healthNotes;

      if (Object.keys(memberUpdateData).length > 0) {
        await tx.member.update({
          where: { id: member.id },
          data: memberUpdateData
        });
      }
    });

    // Return updated profile
    return this.getProfile(userId);
  }

  async getDashboard(userId: string): Promise<MemberDashboardStats> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: { user: { select: { name: true } } }
            }
          },
          take: 1
        }
      }
    });

    if (!member) throw new NotFoundException('Member profile not found');

    // Calculate days remaining
    let daysRemaining = 0;
    if (member.membershipEnd) {
      const now = new Date();
      const diff = member.membershipEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Get active diet plan
    const activeDietPlan = await prisma.memberDietAssignment.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        dietPlan: {
          select: { id: true, name: true },
        },
      },
    });

    // Count active exercise plans
    const activeExercisePlans = await prisma.memberExerciseAssignment.count({
      where: {
        memberId: member.id,
        isActive: true,
      },
    });

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    return {
      daysRemaining,
      totalWorkouts: 0, // TODO: Implement workout tracking
      activeDietPlan: activeDietPlan?.dietPlan,
      activeExercisePlans,
      trainer: activeTrainer
        ? {
            id: activeTrainer.id,
            name: activeTrainer.name || activeTrainer.user.name,
            specialization: activeTrainer.specialization || undefined,
          }
        : undefined,
    };
  }

  async getTrainer(userId: string): Promise<any> {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: { 
                user: { select: { id: true, name: true, email: true } } 
              }
            }
          },
          take: 1
        }
      }
    });

    if (!member) throw new NotFoundException('Member not found');
    
    const activeTrainer = member.trainerAssignments[0]?.trainer;
    if (!activeTrainer) throw new NotFoundException('No trainer assigned');

    return {
      id: activeTrainer.id,
      firstName: (activeTrainer.name || activeTrainer.user.name).split(' ')[0],
      lastName: (activeTrainer.name || activeTrainer.user.name).split(' ').slice(1).join(' ') || '',
      email: activeTrainer.email || activeTrainer.user.email,
      phone: activeTrainer.phone,
      specialization: activeTrainer.specialization,
    };
  }

  async getDietPlan(userId: string): Promise<AssignedDietPlan | null> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const assignment = await prisma.memberDietAssignment.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        dietPlan: true,
      },
    });

    if (!assignment) return null;

    return {
      id: assignment.id,
      dietPlan: {
        id: assignment.dietPlan.id,
        name: assignment.dietPlan.name,
        description: assignment.dietPlan.description || undefined,
        meals: assignment.dietPlan.meals as any[],
        totalCalories: assignment.dietPlan.calories || undefined,
      },
      startDate: assignment.startDate,
      endDate: assignment.endDate || undefined,
      isActive: assignment.isActive,
    };
  }

  async getExercisePlans(userId: string): Promise<AssignedExercisePlan[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const assignments = await prisma.memberExerciseAssignment.findMany({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        exercisePlan: true,
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      exercisePlan: {
        id: assignment.exercisePlan.id,
        name: assignment.exercisePlan.name,
        description: assignment.exercisePlan.description || undefined,
        exercises: assignment.exercisePlan.exercises as any[],
        durationMinutes: undefined,
        difficulty: assignment.exercisePlan.type || undefined,
      },
      startDate: assignment.startDate,
      endDate: assignment.endDate || undefined,
      isActive: assignment.isActive,
    }));
  }

  async getMembership(userId: string): Promise<Membership> {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');
    if (!member.gym) throw new NotFoundException('No gym associated');

    let daysRemaining = 0;
    let isActive = false;

    if (member.membershipEnd) {
      const now = new Date();
      const diff = member.membershipEnd.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      isActive = daysRemaining > 0;
    }

    return {
      startDate: member.membershipStart || undefined,
      endDate: member.membershipEnd || undefined,
      daysRemaining,
      isActive,
      gym: member.gym,
    };
  }

  // Get member's personal diet plan (MemberDietPlan - individual plan created by gym owner)
  async getMyDietPlan(userId: string): Promise<any> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const dietPlan = await prisma.memberDietPlan.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!dietPlan) return null;

    return {
      id: dietPlan.id,
      planName: dietPlan.planName,
      description: dietPlan.description,
      meals: dietPlan.meals,
      calories: dietPlan.calories,
      startDate: dietPlan.startDate,
      endDate: dietPlan.endDate,
      isActive: dietPlan.isActive,
      createdAt: dietPlan.createdAt,
      updatedAt: dietPlan.updatedAt,
    };
  }

  // Get all member's diet plans (history)
  async getMyDietPlanHistory(userId: string): Promise<any[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const dietPlans = await prisma.memberDietPlan.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => ({
      id: plan.id,
      planName: plan.planName,
      description: plan.description,
      meals: plan.meals,
      calories: plan.calories,
      startDate: plan.startDate,
      endDate: plan.endDate,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  // Get member's supplements (via PT membership)
  async getMySupplements(userId: string): Promise<any[]> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    // Get PT membership for this member
    const ptMember = await prisma.pTMember.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
    });

    if (!ptMember) {
      return []; // Not a PT member, no supplements
    }

    const supplements = await prisma.supplement.findMany({
      where: {
        ptMemberId: ptMember.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return supplements.map((sup) => ({
      id: sup.id,
      name: sup.name,
      dosage: sup.dosage,
      frequency: sup.frequency,
      timing: sup.timing,
      notes: sup.notes,
      startDate: sup.startDate,
      endDate: sup.endDate,
      isActive: sup.isActive,
      createdAt: sup.createdAt,
    }));
  }

  // Get member's PT membership details (if they are a PT member)
  async getMyPTMembership(userId: string): Promise<any | null> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const ptMember = await prisma.pTMember.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        trainer: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ptMember) return null;

    return {
      id: ptMember.id,
      sessionsTotal: ptMember.sessionsTotal,
      sessionsUsed: ptMember.sessionsUsed,
      sessionsRemaining: ptMember.sessionsTotal - ptMember.sessionsUsed,
      startDate: ptMember.startDate,
      endDate: ptMember.endDate,
      isActive: ptMember.isActive,
      trainer: {
        id: ptMember.trainer.id,
        name: ptMember.trainer.name || ptMember.trainer.user.name,
        email: ptMember.trainer.email || ptMember.trainer.user.email,
        specialization: ptMember.trainer.specialization,
      },
    };
  }

  // Get complete member details including payments, renewals, and membership info
  async getMyCompleteDetails(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address1: true,
            address2: true,
            city: true,
            mobileNo: true,
            email: true,
          },
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    // Get current course package if exists
    let currentPackage = null;
    if (member.coursePackageId) {
      currentPackage = await prisma.coursePackage.findUnique({
        where: { id: member.coursePackageId },
        select: {
          id: true,
          packageName: true,
          description: true,
          fees: true,
          Months: true,
          coursePackageType: true,
        },
      });
    }

    // Get all balance payments for this member
    const balancePayments = await prisma.memberBalancePayment.findMany({
      where: {
        memberId: member.id,
        isActive: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Get membership renewal history
    const renewalHistory = await prisma.membershipRenewal.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: { renewalDate: 'desc' },
    });

    // Get course packages for renewal history
    const renewalPackageIds = renewalHistory
      .map((r) => r.coursePackageId)
      .filter((id): id is string => id !== null);

    const renewalPackages = renewalPackageIds.length > 0
      ? await prisma.coursePackage.findMany({
          where: { id: { in: renewalPackageIds } },
          select: { id: true, packageName: true, Months: true },
        })
      : [];

    const packageMap = new Map(renewalPackages.map((p) => [p.id, p]));

    // Calculate payment summary for REGULAR fees
    const regularPayments = balancePayments.filter((p) => p.paymentFor === 'REGULAR');
    const regularFinalFees = member.finalFees ? Number(member.finalFees) : 0;
    const regularTotalPaid = regularPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
    const regularPendingAmount = Math.max(0, regularFinalFees - regularTotalPaid);

    // Calculate payment summary for PT fees (if applicable)
    let ptPaymentSummary = null;
    if (member.hasPTAddon && member.ptFinalFees) {
      const ptPayments = balancePayments.filter((p) => p.paymentFor === 'PT');
      const ptFinalFees = Number(member.ptFinalFees);
      const ptTotalPaid = ptPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
      const ptPendingAmount = Math.max(0, ptFinalFees - ptTotalPaid);

      ptPaymentSummary = {
        finalFees: ptFinalFees,
        totalPaid: ptTotalPaid,
        pendingAmount: ptPendingAmount,
        paymentStatus: ptTotalPaid >= ptFinalFees ? 'PAID' : ptTotalPaid > 0 ? 'PARTIAL' : 'PENDING',
        paymentCount: ptPayments.length,
      };
    }

    // Calculate grand totals
    const grandTotalFees = regularFinalFees + (ptPaymentSummary?.finalFees || 0);
    const grandTotalPaid = regularTotalPaid + (ptPaymentSummary?.totalPaid || 0);
    const grandTotalPending = regularPendingAmount + (ptPaymentSummary?.pendingAmount || 0);

    // Calculate membership expiry details
    const now = new Date();
    const membershipEnd = member.membershipEnd ? new Date(member.membershipEnd) : null;
    let daysRemaining = 0;
    let isExpired = false;
    let expiryStatus = 'ACTIVE';

    if (membershipEnd) {
      const diffTime = membershipEnd.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        isExpired = true;
        expiryStatus = 'EXPIRED';
        daysRemaining = Math.abs(daysRemaining); // Days since expiry
      } else if (daysRemaining <= 7) {
        expiryStatus = 'EXPIRING_SOON';
      }
    }

    const activeTrainer = member.trainerAssignments[0]?.trainer;

    return {
      // Member Basic Information
      memberInfo: {
        id: member.id,
        memberId: member.memberId,
        name: member.name || user.name,
        email: member.email || user.email,
        phone: member.phone,
        altContactNo: member.altContactNo,
        dateOfBirth: member.dateOfBirth,
        gender: member.gender,
        address: member.address,
        occupation: member.occupation,
        maritalStatus: member.maritalStatus,
        bloodGroup: member.bloodGroup,
        anniversaryDate: member.anniversaryDate,
        emergencyContact: member.emergencyContact,
        healthNotes: member.healthNotes,
        memberPhoto: member.memberPhoto,
        memberType: member.memberType,
        isActive: member.isActive,
        createdAt: member.createdAt,
      },

      // Gym Information
      gym: member.gym,

      // Assigned Trainer
      trainer: activeTrainer
        ? {
            id: activeTrainer.id,
            name: activeTrainer.name || activeTrainer.user.name,
            email: activeTrainer.email || activeTrainer.user.email,
            specialization: activeTrainer.specialization,
          }
        : null,

      // Current Membership Details
      membership: {
        startDate: member.membershipStart,
        endDate: member.membershipEnd,
        status: member.membershipStatus,
        daysRemaining: isExpired ? 0 : daysRemaining,
        daysSinceExpiry: isExpired ? daysRemaining : 0,
        isExpired,
        expiryStatus,
      },

      // Current Package Information
      currentPackage: currentPackage
        ? {
            id: currentPackage.id,
            packageName: currentPackage.packageName,
            description: currentPackage.description,
            packageFees: currentPackage.fees ? Number(currentPackage.fees) : 0,
            durationMonths: currentPackage.Months,
            packageType: currentPackage.coursePackageType,
          }
        : null,

      // Fee Structure - Regular Membership
      regularFees: {
        packageFees: member.packageFees ? Number(member.packageFees) : 0,
        maxDiscount: member.maxDiscount ? Number(member.maxDiscount) : 0,
        afterDiscount: member.afterDiscount ? Number(member.afterDiscount) : 0,
        extraDiscount: member.extraDiscount ? Number(member.extraDiscount) : 0,
        finalFees: regularFinalFees,
      },

      // Fee Structure - PT Addon (if applicable)
      ptFees: member.hasPTAddon
        ? {
            packageName: member.ptPackageName,
            packageFees: member.ptPackageFees ? Number(member.ptPackageFees) : 0,
            maxDiscount: member.ptMaxDiscount ? Number(member.ptMaxDiscount) : 0,
            afterDiscount: member.ptAfterDiscount ? Number(member.ptAfterDiscount) : 0,
            extraDiscount: member.ptExtraDiscount ? Number(member.ptExtraDiscount) : 0,
            finalFees: member.ptFinalFees ? Number(member.ptFinalFees) : 0,
          }
        : null,

      // Payment Summary
      paymentSummary: {
        regular: {
          finalFees: regularFinalFees,
          totalPaid: regularTotalPaid,
          pendingAmount: regularPendingAmount,
          paymentStatus: regularTotalPaid >= regularFinalFees && regularFinalFees > 0 ? 'PAID' : regularTotalPaid > 0 ? 'PARTIAL' : 'PENDING',
          paymentCount: regularPayments.length,
        },
        pt: ptPaymentSummary,
        grandTotal: {
          totalFees: grandTotalFees,
          totalPaid: grandTotalPaid,
          totalPending: grandTotalPending,
          overallStatus: grandTotalPending === 0 && grandTotalFees > 0 ? 'PAID' : grandTotalPaid > 0 ? 'PARTIAL' : 'PENDING',
        },
      },

      // Payment History (all transactions)
      paymentHistory: balancePayments.map((payment) => ({
        id: payment.id,
        receiptNo: payment.receiptNo,
        paymentFor: payment.paymentFor,
        paymentDate: payment.paymentDate,
        paidAmount: Number(payment.paidFees),
        paymentMode: payment.payMode,
        nextPaymentDate: payment.nextPaymentDate,
        notes: payment.notes,
        createdAt: payment.createdAt,
      })),

      // Membership Renewal History
      renewalHistory: renewalHistory.map((renewal) => {
        const renewalPackage = renewal.coursePackageId ? packageMap.get(renewal.coursePackageId) : null;
        return {
          id: renewal.id,
          renewalNumber: renewal.renewalNumber,
          renewalDate: renewal.renewalDate,
          renewalType: renewal.renewalType,
          previousMembershipStart: renewal.previousMembershipStart,
          previousMembershipEnd: renewal.previousMembershipEnd,
          newMembershipStart: renewal.newMembershipStart,
          newMembershipEnd: renewal.newMembershipEnd,
          package: renewalPackage
            ? {
                id: renewalPackage.id,
                packageName: renewalPackage.packageName,
                durationMonths: renewalPackage.Months,
              }
            : null,
          fees: {
            packageFees: renewal.packageFees ? Number(renewal.packageFees) : 0,
            maxDiscount: renewal.maxDiscount ? Number(renewal.maxDiscount) : 0,
            afterDiscount: renewal.afterDiscount ? Number(renewal.afterDiscount) : 0,
            extraDiscount: renewal.extraDiscount ? Number(renewal.extraDiscount) : 0,
            finalFees: renewal.finalFees ? Number(renewal.finalFees) : 0,
          },
          payment: {
            paidAmount: renewal.paidAmount ? Number(renewal.paidAmount) : 0,
            pendingAmount: renewal.pendingAmount ? Number(renewal.pendingAmount) : 0,
            paymentStatus: renewal.paymentStatus,
            paymentMode: renewal.paymentMode,
          },
          createdAt: renewal.createdAt,
        };
      }),
    };
  }

  // Get member's assigned diet plans list with pagination and search (MemberDiet from gym owner)
  async getMyDietPlanList(userId: string, params: MemberDietPlanListParams): Promise<{ dietPlans: any[]; total: number }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', isActive } = params;
    const skip = (page - 1) * limit;

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    // Build where clause
    const where: any = {
      memberId: member.id,
    };

    // Filter by active status if provided
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Search filter - search in diet template name and meal titles/descriptions
    if (search) {
      where.OR = [
        { dietTemplate: { name: { contains: search, mode: 'insensitive' } } },
        { meals: { some: { title: { contains: search, mode: 'insensitive' } } } },
        { meals: { some: { description: { contains: search, mode: 'insensitive' } } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Parallel queries for data and count
    const [dietPlans, total] = await Promise.all([
      prisma.memberDiet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          meals: {
            orderBy: { mealNo: 'asc' },
          },
          dietTemplate: {
            select: { id: true, name: true, description: true },
          },
          assigner: {
            select: { name: true },
          },
        },
      }),
      prisma.memberDiet.count({ where }),
    ]);

    return {
      dietPlans: dietPlans.map((diet) => ({
        id: diet.id,
        dietTemplateId: diet.dietTemplateId,
        dietTemplateName: diet.dietTemplate.name,
        dietTemplateDescription: diet.dietTemplate.description,
        startDate: diet.startDate,
        endDate: diet.endDate,
        isActive: diet.isActive,
        notes: diet.notes,
        assignedBy: diet.assigner?.name || null,
        meals: diet.meals.map((meal) => ({
          id: meal.id,
          mealNo: meal.mealNo,
          title: meal.title,
          description: meal.description,
          time: meal.time,
        })),
        createdAt: diet.createdAt,
        updatedAt: diet.updatedAt,
      })),
      total,
    };
  }

  // Get comprehensive dashboard data for member
  async getComprehensiveDashboard(userId: string): Promise<ComprehensiveDashboard> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address1: true,
            address2: true,
            city: true,
            mobileNo: true,
            email: true,
          },
        },
        trainerAssignments: {
          where: { isActive: true },
          include: {
            trainer: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    // Get current course package if exists
    let currentPackage = null;
    if (member.coursePackageId) {
      currentPackage = await prisma.coursePackage.findUnique({
        where: { id: member.coursePackageId },
        select: {
          id: true,
          packageName: true,
          description: true,
          fees: true,
          Months: true,
        },
      });
    }

    // Get balance payments
    const balancePayments = await prisma.memberBalancePayment.findMany({
      where: {
        memberId: member.id,
        isActive: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Calculate fees and payments
    const regularFinalFees = member.finalFees ? Number(member.finalFees) : 0;
    const ptFinalFees = member.hasPTAddon && member.ptFinalFees ? Number(member.ptFinalFees) : 0;
    const totalFees = regularFinalFees + ptFinalFees;

    const regularPayments = balancePayments.filter((p) => p.paymentFor === 'REGULAR');
    const ptPayments = balancePayments.filter((p) => p.paymentFor === 'PT');
    const regularPaid = regularPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
    const ptPaid = ptPayments.reduce((sum, p) => sum + Number(p.paidFees), 0);
    const totalPaid = regularPaid + ptPaid;
    const pendingAmount = Math.max(0, totalFees - totalPaid);

    // Get next payment date from the most recent payment
    const lastPayment = balancePayments[0];
    const nextPaymentDate = lastPayment?.nextPaymentDate || null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextPaymentInfo = null;
    if (nextPaymentDate) {
      const nextDate = new Date(nextPaymentDate);
      nextDate.setHours(0, 0, 0, 0);
      const diffTime = nextDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      nextPaymentInfo = {
        date: nextPaymentDate,
        isToday: daysUntilDue === 0,
        isPastDue: daysUntilDue < 0,
        daysUntilDue,
      };
    }

    // Calculate membership expiry
    const membershipEnd = member.membershipEnd ? new Date(member.membershipEnd) : null;
    let daysRemaining = 0;
    let isExpired = false;
    let expiryStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' = 'ACTIVE';

    if (membershipEnd) {
      const diffTime = membershipEnd.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        isExpired = true;
        expiryStatus = 'EXPIRED';
        daysRemaining = 0;
      } else if (daysRemaining <= 7) {
        expiryStatus = 'EXPIRING_SOON';
      }
    }

    // Get active trainer - check both MemberTrainerAssignment and PTMember tables
    let activeTrainer = member.trainerAssignments[0]?.trainer;

    // If no trainer from trainerAssignments, check PTMember table
    if (!activeTrainer) {
      const ptMember = await prisma.pTMember.findUnique({
        where: { memberId: member.id },
        include: {
          trainer: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      if (ptMember?.trainer) {
        activeTrainer = ptMember.trainer;
      }
    }

    // Get active diet plan (MemberDiet)
    const activeDiet = await prisma.memberDiet.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        dietTemplate: {
          select: { id: true, name: true, description: true },
        },
        meals: {
          orderBy: { mealNo: 'asc' },
        },
      },
    });

    // Get active exercise plan assignment
    const activeExerciseAssignment = await prisma.memberExerciseAssignment.findFirst({
      where: {
        memberId: member.id,
        isActive: true,
      },
      include: {
        exercisePlan: true,
      },
    });

    // Build gym address
    const gymAddress = [member.gym.address1, member.gym.address2, member.gym.city]
      .filter(Boolean)
      .join(', ');

    return {
      memberInfo: {
        id: member.id,
        memberId: member.memberId,
        name: member.name || user.name,
        email: member.email || user.email,
        phone: member.phone,
        memberPhoto: member.memberPhoto,
        memberType: member.memberType,
      },

      membership: {
        packageName: currentPackage?.packageName || null,
        startDate: member.membershipStart,
        endDate: member.membershipEnd,
        status: member.membershipStatus,
        daysRemaining,
        isExpired,
        expiryStatus,
      },

      fees: {
        totalFees,
        paidAmount: totalPaid,
        pendingAmount,
        paymentStatus: totalPaid >= totalFees && totalFees > 0 ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'PENDING',
      },

      nextPayment: nextPaymentInfo,

      trainer: activeTrainer
        ? {
            id: activeTrainer.id,
            name: activeTrainer.name || activeTrainer.user.name,
            email: activeTrainer.email || activeTrainer.user.email,
            phone: activeTrainer.phone,
            specialization: activeTrainer.specialization,
          }
        : null,

      todayExercise: activeExerciseAssignment
        ? {
            id: activeExerciseAssignment.exercisePlan.id,
            name: activeExerciseAssignment.exercisePlan.name,
            description: activeExerciseAssignment.exercisePlan.description,
            type: activeExerciseAssignment.exercisePlan.type,
            exercises: activeExerciseAssignment.exercisePlan.exercises as any[],
          }
        : null,

      dietPlan: activeDiet
        ? {
            id: activeDiet.id,
            name: activeDiet.dietTemplate.name,
            description: activeDiet.dietTemplate.description,
            meals: activeDiet.meals.map((meal) => ({
              mealNo: meal.mealNo,
              title: meal.title,
              description: meal.description,
              time: meal.time,
            })),
            startDate: activeDiet.startDate,
            endDate: activeDiet.endDate,
          }
        : null,

      gym: {
        id: member.gym.id,
        name: member.gym.name,
        address: gymAddress || null,
        mobileNo: member.gym.mobileNo,
        email: member.gym.email,
      },
    };
  }
}

export default new MemberService();
