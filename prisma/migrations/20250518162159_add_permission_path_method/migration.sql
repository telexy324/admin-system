/*
  Warnings:

  - A unique constraint covering the columns `[path,method]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `method` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "method" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_path_method_key" ON "permissions"("path", "method");

-- 更新现有权限的路径和方法
UPDATE "permissions" SET 
  path = '/api/users',
  method = 'GET'
WHERE name = '查看用户列表';

UPDATE "permissions" SET 
  path = '/api/users',
  method = 'POST'
WHERE name = '创建用户';

UPDATE "permissions" SET 
  path = '/api/users/:id',
  method = 'PUT'
WHERE name = '更新用户';

UPDATE "permissions" SET 
  path = '/api/users/:id',
  method = 'DELETE'
WHERE name = '删除用户';

UPDATE "permissions" SET 
  path = '/api/roles',
  method = 'GET'
WHERE name = '查看角色列表';

UPDATE "permissions" SET 
  path = '/api/roles',
  method = 'POST'
WHERE name = '创建角色';

UPDATE "permissions" SET 
  path = '/api/roles/:id',
  method = 'PUT'
WHERE name = '更新角色';

UPDATE "permissions" SET 
  path = '/api/roles/:id',
  method = 'DELETE'
WHERE name = '删除角色';

UPDATE "permissions" SET 
  path = '/api/permissions',
  method = 'GET'
WHERE name = '查看权限列表';

UPDATE "permissions" SET 
  path = '/api/menus',
  method = 'GET'
WHERE name = '查看菜单列表';

UPDATE "permissions" SET 
  path = '/api/menus',
  method = 'POST'
WHERE name = '创建菜单';

UPDATE "permissions" SET 
  path = '/api/menus/:id',
  method = 'PUT'
WHERE name = '更新菜单';

UPDATE "permissions" SET 
  path = '/api/menus/:id',
  method = 'DELETE'
WHERE name = '删除菜单';
