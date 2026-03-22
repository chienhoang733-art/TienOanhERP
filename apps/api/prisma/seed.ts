import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ==================== ROLES ====================
  const roles = await Promise.all([
    prisma.role.create({ data: { slug: 'director',   name: 'Giám Đốc',    level: 1 } }),
    prisma.role.create({ data: { slug: 'manager',    name: 'Trưởng Phòng', level: 2 } }),
    prisma.role.create({ data: { slug: 'accountant', name: 'Kế Toán',      level: 5 } }),
    prisma.role.create({ data: { slug: 'staff',      name: 'Nhân Viên',    level: 3 } }),
    prisma.role.create({ data: { slug: 'driver',     name: 'Tài Xế',       level: 4 } }),
    prisma.role.create({ data: { slug: 'auditor',    name: 'Kiểm Toán',    level: 6 } }),
  ]);

  const [director, manager, accountant, staff, driver, auditor] = roles;

  // ==================== PERMISSIONS ====================
  const permKeys = [
    { key: '*',                name: 'Full Access' },
    { key: '*:read',           name: 'Read All Modules' },
    { key: 'hrm:read',        name: 'HRM - Xem' },
    { key: 'hrm:write',       name: 'HRM - Sửa' },
    { key: 'hrm:employee:read',  name: 'HRM - Xem nhân viên' },
    { key: 'hrm:employee:self',  name: 'HRM - Xem hồ sơ cá nhân' },
    { key: 'hrm:salary:read',    name: 'HRM - Xem lương' },
    { key: 'hrm:salary:write',   name: 'HRM - Sửa lương' },
    { key: 'attendance:read',    name: 'Chấm công - Xem' },
    { key: 'attendance:write',   name: 'Chấm công - Sửa' },
    { key: 'attendance:checkin', name: 'Chấm công - Check-in' },
    { key: 'attendance:leave_request', name: 'Chấm công - Nghỉ phép' },
    { key: 'attendance:trip_view',     name: 'Chấm công - Xem chuyến' },
    { key: 'accounting:read',    name: 'Kế toán - Xem' },
    { key: 'accounting:write',   name: 'Kế toán - Sửa' },
    { key: 'accounting:approve', name: 'Kế toán - Duyệt' },
    { key: 'vehicle:read',      name: 'Phương tiện - Xem' },
    { key: 'vehicle:write',     name: 'Phương tiện - Sửa' },
    { key: 'vehicle:self_view', name: 'Phương tiện - Xem xe mình' },
  ];

  const permissions: Record<string, { id: number }> = {};
  for (const p of permKeys) {
    permissions[p.key] = await prisma.permission.create({ data: p });
  }

  // ==================== ROLE-PERMISSION MAPPING ====================
  const rolePermMap: Record<string, string[]> = {
    director:   ['*'],
    manager:    ['hrm:read', 'hrm:write', 'attendance:read', 'attendance:write', 'accounting:read'],
    accountant: ['accounting:read', 'accounting:write', 'accounting:approve', 'hrm:salary:read'],
    staff:      ['hrm:employee:self', 'attendance:checkin', 'attendance:leave_request'],
    driver:     ['attendance:checkin', 'attendance:trip_view', 'vehicle:self_view'],
    auditor:    ['*:read'],
  };

  for (const [roleSlug, permList] of Object.entries(rolePermMap)) {
    const role = roles.find((r) => r.slug === roleSlug)!;
    for (const permKey of permList) {
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permissions[permKey].id },
      });
    }
  }

  // ==================== DEPARTMENTS ====================
  const hrDept = await prisma.department.create({
    data: { name: 'Hành Chính Nhân Sự' },
  });

  const opsDept = await prisma.department.create({
    data: { name: 'Điều Hành Vận Tải' },
  });

  const accDept = await prisma.department.create({
    data: { name: 'Kế Toán Tài Chính' },
  });

  // ==================== EMPLOYEES ====================
  const emp1 = await prisma.employee.create({
    data: {
      fullName: 'Hoàng Khánh Chiến',
      email: 'chien@tienoanh.com',
      position: 'Giám Đốc',
      departmentId: hrDept.id,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@tienoanh.com',
      position: 'Trưởng Phòng HCNS',
      departmentId: hrDept.id,
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      fullName: 'Trần Thị Bích',
      email: 'bich.tran@tienoanh.com',
      position: 'Kế Toán Trưởng',
      departmentId: accDept.id,
    },
  });

  // ==================== USERS ====================
  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'chien@tienoanh.com',
      passwordHash,
      roleId: director.id,
      employeeId: emp1.id,
    },
  });

  await prisma.user.create({
    data: {
      username: 'manager',
      email: 'an.nguyen@tienoanh.com',
      passwordHash,
      roleId: manager.id,
      employeeId: emp2.id,
    },
  });

  await prisma.user.create({
    data: {
      username: 'accountant',
      email: 'bich.tran@tienoanh.com',
      passwordHash,
      roleId: accountant.id,
      employeeId: emp3.id,
    },
  });

  // ==================== LEAVE REQUESTS ====================
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp2.id,
      startDate: new Date('2026-03-25'),
      endDate: new Date('2026-03-27'),
      reason: 'Việc gia đình',
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts: admin/123456, manager/123456, accountant/123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
