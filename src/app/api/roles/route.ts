import { NextResponse } from "next/server";

// 模拟角色数据
const roles = [
  {
    id: 1,
    name: "管理员",
    code: "admin",
    description: "系统管理员，拥有所有权限",
    permissions: ["user:manage", "role:manage", "menu:manage"],
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "普通用户",
    code: "user",
    description: "普通用户，拥有基本权限",
    permissions: ["user:view"],
    createdAt: "2024-01-02",
  },
];

// 获取角色列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  // 模拟搜索和分页
  const filteredRoles = roles.filter(role => 
    role.name.includes(search) || 
    role.code.includes(search) ||
    role.description.includes(search)
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRoles = filteredRoles.slice(start, end);

  return NextResponse.json({
    data: paginatedRoles,
    total: filteredRoles.length,
    page,
    pageSize,
  });
}

// 创建角色
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: 验证角色数据
    // TODO: 保存到数据库
    
    return NextResponse.json({
      message: "角色创建成功",
      data: {
        id: roles.length + 1,
        ...body,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "创建角色失败" },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证角色数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "角色更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新角色失败" },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除角色
    
    return NextResponse.json({
      message: "角色删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除角色失败" },
      { status: 500 }
    );
  }
} 