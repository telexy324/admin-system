import { NextResponse } from "next/server";

// 模拟权限数据
const permissions = [
  {
    id: 1,
    name: "查看用户",
    code: "user:view",
    description: "允许查看用户列表和详情",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "管理用户",
    code: "user:manage",
    description: "允许创建、编辑和删除用户",
    createdAt: "2024-01-01",
  },
  {
    id: 3,
    name: "查看角色",
    code: "role:view",
    description: "允许查看角色列表和详情",
    createdAt: "2024-01-01",
  },
  {
    id: 4,
    name: "管理角色",
    code: "role:manage",
    description: "允许创建、编辑和删除角色",
    createdAt: "2024-01-01",
  },
  {
    id: 5,
    name: "查看菜单",
    code: "menu:view",
    description: "允许查看菜单列表和详情",
    createdAt: "2024-01-01",
  },
  {
    id: 6,
    name: "管理菜单",
    code: "menu:manage",
    description: "允许创建、编辑和删除菜单",
    createdAt: "2024-01-01",
  },
];

// 获取权限列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  // 模拟搜索和分页
  const filteredPermissions = permissions.filter(permission => 
    permission.name.includes(search) || 
    permission.code.includes(search) ||
    permission.description.includes(search)
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedPermissions = filteredPermissions.slice(start, end);

  return NextResponse.json({
    data: paginatedPermissions,
    total: filteredPermissions.length,
    page,
    pageSize,
  });
}

// 创建权限
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: 验证权限数据
    // TODO: 保存到数据库
    
    return NextResponse.json({
      message: "权限创建成功",
      data: {
        id: permissions.length + 1,
        ...body,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "创建权限失败" },
      { status: 500 }
    );
  }
}

// 更新权限
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证权限数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "权限更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新权限失败" },
      { status: 500 }
    );
  }
}

// 删除权限
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除权限
    
    return NextResponse.json({
      message: "权限删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除权限失败" },
      { status: 500 }
    );
  }
} 