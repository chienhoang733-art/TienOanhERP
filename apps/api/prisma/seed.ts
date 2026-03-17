import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const hrDept = await prisma.department.create({
    data: { name: 'Human Resources', managerId: 101 },
  });
  
  const engDept = await prisma.department.create({
    data: { name: 'Engineering', managerId: 102 },
  });

  const emp1 = await prisma.employee.create({
    data: {
      fullName: 'John Doe',
      email: 'john.doe@tienoanh.com',
      position: 'HR Manager',
      departmentId: hrDept.id,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      fullName: 'Jane Smith',
      email: 'jane.smith@tienoanh.com',
      position: 'Software Engineer',
      departmentId: engDept.id,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp2.id,
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-03-22'),
      reason: 'Personal trip',
      status: 'APPROVED',
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
