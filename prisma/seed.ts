import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Partner Agency
  const agency = await prisma.partnerAgency.create({
    data: {
      legalName: 'Berlin Care Pflegedienst',
      contractStatus: 'active',
      liabilityCoverageConfirmed: true,
    }
  });

  // 2. Nurse
  const nurse = await prisma.user.create({
    data: {
      email: 'nurse@careconnect.de',
      password: hashedPassword,
      name: 'Lisa Nurse',
      role: 'nurse',
      partnerAgencyId: agency.id,
    }
  });

  // 3. Caregiver & Family
  const caregiver = await prisma.user.create({
    data: {
      email: 'joanna@careconnect.de',
      password: hashedPassword,
      name: 'Joanna Johnes',
      role: 'caregiver',
      family: {
        create: {
          address: 'Berlin Mitte'
        }
      }
    }
  });

  // 4. Assign Nurse to Family
  await prisma.familyNurseAssignment.create({
    data: {
      familyId: caregiver.familyId!,
      nurseId: nurse.id,
      partnerAgencyId: agency.id
    }
  });

  // 5. Ops User
  await prisma.user.create({
    data: {
      email: 'ops@careconnect.de',
      password: hashedPassword,
      name: 'Ops Admin',
      role: 'ops'
    }
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());