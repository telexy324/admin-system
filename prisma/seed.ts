import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建默认角色
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '系统管理员',
    },
  });

  // 创建默认权限
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'user:read' },
      update: {},
      create: {
        name: '查看用户',
        code: 'user:read',
        description: '查看用户列表和详情',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'user:write' },
      update: {},
      create: {
        name: '管理用户',
        code: 'user:write',
        description: '创建、编辑、删除用户',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:read' },
      update: {},
      create: {
        name: '查看角色',
        code: 'role:read',
        description: '查看角色列表和详情',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:write' },
      update: {},
      create: {
        name: '管理角色',
        code: 'role:write',
        description: '创建、编辑、删除角色',
      },
    }),
  ]);

  // 将权限关联到管理员角色
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });

  // 创建默认菜单
  const menus = await Promise.all([
    prisma.menu.upsert({
      where: { path: '/dashboard' },
      update: {},
      create: {
        name: '仪表盘',
        path: '/dashboard',
        icon: 'dashboard',
        order: 1,
      },
    }),
    prisma.menu.upsert({
      where: { path: '/users' },
      update: {},
      create: {
        name: '用户管理',
        path: '/users',
        icon: 'user',
        order: 2,
      },
    }),
    prisma.menu.upsert({
      where: { path: '/roles' },
      update: {},
      create: {
        name: '角色管理',
        path: '/roles',
        icon: 'team',
        order: 3,
      },
    }),
    prisma.menu.upsert({
      where: { path: '/permissions' },
      update: {},
      create: {
        name: '权限管理',
        path: '/permissions',
        icon: 'safety',
        order: 4,
      },
    }),
    prisma.menu.upsert({
      where: { path: '/menus' },
      update: {},
      create: {
        name: '菜单管理',
        path: '/menus',
        icon: 'menu',
        order: 5,
      },
    }),
  ]);

  // 将菜单关联到管理员角色
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      menus: {
        connect: menus.map(m => ({ id: m.id })),
      },
    },
  });

  // 创建默认管理员用户
  const hashedPassword = await hash('admin123', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: '管理员',
      email: 'admin@example.com',
      roleId: adminRole.id,
    },
  });

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 