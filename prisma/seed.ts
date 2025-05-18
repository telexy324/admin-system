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
      where: { name: '查看用户列表' },
      update: {},
      create: {
        name: '查看用户列表',
        description: '查看用户列表和详情',
        path: '/api/users',
        method: 'GET',
      },
    }),
    prisma.permission.upsert({
      where: { name: '创建用户' },
      update: {},
      create: {
        name: '创建用户',
        description: '创建新用户',
        path: '/api/users',
        method: 'POST',
      },
    }),
    prisma.permission.upsert({
      where: { name: '更新用户' },
      update: {},
      create: {
        name: '更新用户',
        description: '更新用户信息',
        path: '/api/users/:id',
        method: 'PUT',
      },
    }),
    prisma.permission.upsert({
      where: { name: '删除用户' },
      update: {},
      create: {
        name: '删除用户',
        description: '删除用户',
        path: '/api/users/:id',
        method: 'DELETE',
      },
    }),
    prisma.permission.upsert({
      where: { name: '查看角色列表' },
      update: {},
      create: {
        name: '查看角色列表',
        description: '查看角色列表和详情',
        path: '/api/roles',
        method: 'GET',
      },
    }),
    prisma.permission.upsert({
      where: { name: '创建角色' },
      update: {},
      create: {
        name: '创建角色',
        description: '创建新角色',
        path: '/api/roles',
        method: 'POST',
      },
    }),
    prisma.permission.upsert({
      where: { name: '更新角色' },
      update: {},
      create: {
        name: '更新角色',
        description: '更新角色信息',
        path: '/api/roles/:id',
        method: 'PUT',
      },
    }),
    prisma.permission.upsert({
      where: { name: '删除角色' },
      update: {},
      create: {
        name: '删除角色',
        description: '删除角色',
        path: '/api/roles/:id',
        method: 'DELETE',
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
      where: { name: '仪表盘' },
      update: {},
      create: {
        name: '仪表盘',
        path: '/dashboard',
        icon: 'dashboard',
      },
    }),
    prisma.menu.upsert({
      where: { name: '用户管理' },
      update: {},
      create: {
        name: '用户管理',
        path: '/users',
        icon: 'user',
      },
    }),
    prisma.menu.upsert({
      where: { name: '角色管理' },
      update: {},
      create: {
        name: '角色管理',
        path: '/roles',
        icon: 'team',
      },
    }),
    prisma.menu.upsert({
      where: { name: '权限管理' },
      update: {},
      create: {
        name: '权限管理',
        path: '/permissions',
        icon: 'safety',
      },
    }),
    prisma.menu.upsert({
      where: { name: '菜单管理' },
      update: {},
      create: {
        name: '菜单管理',
        path: '/menus',
        icon: 'menu',
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
      roles: {
        connect: [{ id: adminRole.id }],
      },
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