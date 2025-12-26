require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let prisma;
try {
  // Try to load the optional driver adapter for direct DB connections
  const { PrismaPg } = require('@prisma/adapter-pg');
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });
} catch (err) {
  // Adapter not installed. Prisma v7 JS engine requires either a driver adapter
  // or `ACCELERATE_URL` to be provided to the PrismaClient constructor.
  if (process.env.ACCELERATE_URL) {
    prisma = new PrismaClient({ accelerateUrl: process.env.ACCELERATE_URL });
  } else {
    console.error('Missing @prisma/adapter-pg and ACCELERATE_URL; cannot construct PrismaClient.');
    console.error('Install the Postgres adapter: npm install @prisma/adapter-pg');
    console.error('Or set ACCELERATE_URL in your .env to use Prisma Accelerate.');
    throw err;
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.memberExerciseAssignment.deleteMany();
  await prisma.memberDietAssignment.deleteMany();
  await prisma.memberTrainerAssignment.deleteMany();
  await prisma.exercisePlan.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.gymSubscriptionPlan.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolemaster.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create Rolemaster entries
  const [adminRole, gymOwnerRole, memberRole] = await Promise.all([
    prisma.rolemaster.create({ data: { rolename: 'ADMIN' } }),
    prisma.rolemaster.create({ data: { rolename: 'GYM_OWNER' } }),
    prisma.rolemaster.create({ data: { rolename: 'MEMBER' } })
  ]);
  console.log('✅ Created rolemaster entries');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gymmanager.com',
      password: adminPassword,
      name: 'System Admin',
      roleId: adminRole.Id
    }
  });
  console.log('✅ Created admin user');

  // Create Subscription Plans
  const plans = await Promise.all([
    prisma.gymSubscriptionPlan.create({
      data: {
        name: 'Basic',
        description: 'Essential gym management features',
        price: 29.99,
        durationDays: 30,
        features: ['Up to 50 members', 'Basic reporting', 'Email support']
      }
    }),
    prisma.gymSubscriptionPlan.create({
      data: {
        name: 'Pro',
        description: 'Advanced features for growing gyms',
        price: 79.99,
        durationDays: 30,
        features: ['Up to 200 members', 'Advanced reporting', 'Priority support', 'Custom branding']
      }
    }),
    prisma.gymSubscriptionPlan.create({
      data: {
        name: 'Premium',
        description: 'Complete solution for large gyms',
        price: 149.99,
        durationDays: 30,
        features: ['Unlimited members', 'Full analytics', '24/7 support', 'API access', 'White-label']
      }
    })
  ]);
  console.log('✅ Created subscription plans');

  // Create Gym Owner
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const gymOwner = await prisma.user.create({
    data: {
      email: 'owner@fitnesspro.com',
      password: ownerPassword,
      name: 'John Smith',
      roleId: gymOwnerRole.Id
    }
  });
  console.log('✅ Created gym owner');

  // Create Gym
  const gym = await prisma.gym.create({
    data: {
      name: 'FitnessPro Gym',
      address: '123 Fitness Street, Gym City, GC 12345',
      phone: '+1-555-123-4567',
      email: 'contact@fitnesspro.com',
      ownerId: gymOwner.id,
      subscriptionPlanId: plans[1].id, // Pro plan
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('✅ Created gym');

  // Create Trainers
  const trainerPassword = await bcrypt.hash('trainer123', 10);
  const trainerUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'mike.trainer@fitnesspro.com',
        password: trainerPassword,
        name: 'Mike Johnson',
        roleId: memberRole.Id
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.trainer@fitnesspro.com',
        password: trainerPassword,
        name: 'Sarah Williams',
        roleId: memberRole.Id
      }
    })
  ]);

  const trainers = await Promise.all([
    prisma.trainer.create({
      data: {
        userId: trainerUsers[0].id,
        gymId: gym.id,
        specialization: 'Strength Training',
        experience: 5,
        phone: '+1-555-111-1111'
      }
    }),
    prisma.trainer.create({
      data: {
        userId: trainerUsers[1].id,
        gymId: gym.id,
        specialization: 'Yoga & Flexibility',
        experience: 8,
        phone: '+1-555-222-2222'
      }
    })
  ]);
  console.log('✅ Created trainers');

  // Create Diet Plans
  const dietPlans = await Promise.all([
    prisma.dietPlan.create({
      data: {
        gymId: gym.id,
        name: 'Weight Loss Plan',
        description: 'Calorie-deficit diet for weight loss',
        calories: 1800,
        meals: {
          breakfast: { items: ['Oatmeal with berries', 'Green tea', 'Boiled eggs (2)'], calories: 400 },
          lunch: { items: ['Grilled chicken salad', 'Whole grain bread', 'Fruit'], calories: 550 },
          snack: { items: ['Greek yogurt', 'Almonds (10)'], calories: 200 },
          dinner: { items: ['Baked salmon', 'Steamed vegetables', 'Brown rice'], calories: 650 }
        }
      }
    }),
    prisma.dietPlan.create({
      data: {
        gymId: gym.id,
        name: 'Muscle Gain Plan',
        description: 'High protein diet for muscle building',
        calories: 2800,
        meals: {
          breakfast: { items: ['Protein shake', 'Whole eggs (4)', 'Avocado toast'], calories: 700 },
          lunch: { items: ['Grilled steak', 'Sweet potato', 'Mixed vegetables'], calories: 800 },
          snack: { items: ['Protein bar', 'Banana', 'Peanut butter'], calories: 450 },
          dinner: { items: ['Chicken breast', 'Quinoa', 'Broccoli'], calories: 850 }
        }
      }
    })
  ]);
  console.log('✅ Created diet plans');

  // Create Exercise Plans
  const exercisePlans = await Promise.all([
    prisma.exercisePlan.create({
      data: {
        gymId: gym.id,
        name: 'Upper Body Strength',
        description: 'Focus on chest, back, shoulders, and arms',
        type: 'daily',
        exercises: {
          warmup: { duration: '10 minutes', exercises: ['Jumping jacks', 'Arm circles'] },
          main: [
            { name: 'Bench Press', sets: 4, reps: 10, rest: '90s' },
            { name: 'Lat Pulldown', sets: 4, reps: 12, rest: '60s' },
            { name: 'Shoulder Press', sets: 3, reps: 10, rest: '60s' },
            { name: 'Bicep Curls', sets: 3, reps: 12, rest: '45s' },
            { name: 'Tricep Dips', sets: 3, reps: 12, rest: '45s' }
          ],
          cooldown: { duration: '5 minutes', exercises: ['Stretching'] }
        }
      }
    }),
    prisma.exercisePlan.create({
      data: {
        gymId: gym.id,
        name: 'Lower Body Power',
        description: 'Focus on legs and glutes',
        type: 'daily',
        exercises: {
          warmup: { duration: '10 minutes', exercises: ['Treadmill walk', 'Leg swings'] },
          main: [
            { name: 'Squats', sets: 4, reps: 10, rest: '90s' },
            { name: 'Leg Press', sets: 4, reps: 12, rest: '60s' },
            { name: 'Romanian Deadlift', sets: 3, reps: 10, rest: '90s' },
            { name: 'Leg Curls', sets: 3, reps: 12, rest: '45s' },
            { name: 'Calf Raises', sets: 4, reps: 15, rest: '30s' }
          ],
          cooldown: { duration: '5 minutes', exercises: ['Foam rolling', 'Stretching'] }
        }
      }
    }),
    prisma.exercisePlan.create({
      data: {
        gymId: gym.id,
        name: 'Cardio & Core',
        description: 'Cardiovascular fitness and core strength',
        type: 'daily',
        exercises: {
          warmup: { duration: '5 minutes', exercises: ['Light jog'] },
          main: [
            { name: 'Treadmill Run', duration: '20 minutes', intensity: 'Moderate' },
            { name: 'Plank', sets: 3, duration: '60s', rest: '30s' },
            { name: 'Russian Twists', sets: 3, reps: 20, rest: '30s' },
            { name: 'Mountain Climbers', sets: 3, duration: '45s', rest: '30s' },
            { name: 'Bicycle Crunches', sets: 3, reps: 20, rest: '30s' }
          ],
          cooldown: { duration: '5 minutes', exercises: ['Walking', 'Stretching'] }
        }
      }
    })
  ]);
  console.log('✅ Created exercise plans');

  // Create Members
  const memberPassword = await bcrypt.hash('member123', 10);
  const memberUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: memberPassword,
        name: 'Alice Brown',
        roleId: memberRole.Id
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: memberPassword,
        name: 'Bob Wilson',
        roleId: memberRole.Id
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        password: memberPassword,
        name: 'Carol Davis',
        roleId: memberRole.Id
      }
    })
  ]);

  const members = await Promise.all([
    prisma.member.create({
      data: {
        userId: memberUsers[0].id,
        gymId: gym.id,
        phone: '+1-555-333-3333',
        gender: 'Female',
        dateOfBirth: new Date('1990-05-15'),
        membershipEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      }
    }),
    prisma.member.create({
      data: {
        userId: memberUsers[1].id,
        gymId: gym.id,
        phone: '+1-555-444-4444',
        gender: 'Male',
        dateOfBirth: new Date('1985-08-22'),
        membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }),
    prisma.member.create({
      data: {
        userId: memberUsers[2].id,
        gymId: gym.id,
        phone: '+1-555-555-5555',
        gender: 'Female',
        dateOfBirth: new Date('1995-12-01'),
        membershipEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Expired 5 days ago
      }
    })
  ]);
  console.log('✅ Created members');

  // Create Assignments
  await prisma.memberTrainerAssignment.create({
    data: {
      memberId: members[0].id,
      trainerId: trainers[0].id
    }
  });

  await prisma.memberTrainerAssignment.create({
    data: {
      memberId: members[1].id,
      trainerId: trainers[1].id
    }
  });

  await prisma.memberDietAssignment.create({
    data: {
      memberId: members[0].id,
      dietPlanId: dietPlans[0].id
    }
  });

  await prisma.memberDietAssignment.create({
    data: {
      memberId: members[1].id,
      dietPlanId: dietPlans[1].id
    }
  });

  // Assign exercise plans for different days
  await Promise.all([
    prisma.memberExerciseAssignment.create({
      data: { memberId: members[0].id, exercisePlanId: exercisePlans[0].id, dayOfWeek: 1 } // Monday
    }),
    prisma.memberExerciseAssignment.create({
      data: { memberId: members[0].id, exercisePlanId: exercisePlans[1].id, dayOfWeek: 3 } // Wednesday
    }),
    prisma.memberExerciseAssignment.create({
      data: { memberId: members[0].id, exercisePlanId: exercisePlans[2].id, dayOfWeek: 5 } // Friday
    })
  ]);
  console.log('✅ Created assignments');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Login Credentials:');
  console.log('------------------------');
  console.log('Admin:      admin@gymmanager.com / admin123');
  console.log('Gym Owner:  owner@fitnesspro.com / owner123');
  console.log('Member:     alice@example.com / member123');
  console.log('Member:     bob@example.com / member123');
  console.log('------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
