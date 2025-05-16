const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 创建默认角色
  const defaultRole = await prisma.role.upsert({
    where: { name: "普通用户" },
    update: {},
    create: {
      name: "普通用户",
      description: "系统默认角色",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "管理员" },
    update: {},
    create: {
      name: "管理员",
      description: "系统管理员角色",
    },
  });

  console.log({ defaultRole, adminRole });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 