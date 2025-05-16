import { NextResponse } from "next/server";

// 模拟菜单数据
const menus = [
  {
    id: 1,
    name: "仪表盘",
    path: "/dashboard",
    icon: "dashboard",
    parentId: null,
    order: 1,
    permissions: ["dashboard:view"],
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "用户管理",
    path: "/users",
    icon: "users",
    parentId: null,
    order: 2,
    permissions: ["user:view"],
    createdAt: "2024-01-01",
  },
  {
    id: 3,
    name: "角色管理",
    path: "/roles",
    icon: "shield",
    parentId: null,
    order: 3,
    permissions: ["role:view"],
    createdAt: "2024-01-01",
  },
  {
    id: 4,
    name: "权限管理",
    path: "/permissions",
    icon: "key",
    parentId: null,
    order: 4,
    permissions: ["permission:view"],
    createdAt: "2024-01-01",
  },
  {
    id: 5,
    name: "菜单管理",
    path: "/menus",
    icon: "menu",
    parentId: null,
    order: 5,
    permissions: ["menu:view"],
    createdAt: "2024-01-01",
  },
];

// 获取菜单列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  // 模拟搜索和分页
  const filteredMenus = menus.filter(menu => 
    menu.name.includes(search) || 
    menu.path.includes(search)
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedMenus = filteredMenus.slice(start, end);

  return NextResponse.json({
    data: paginatedMenus,
    total: filteredMenus.length,
    page,
    pageSize,
  });
}

// 创建菜单
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: 验证菜单数据
    // TODO: 保存到数据库
    
    return NextResponse.json({
      message: "菜单创建成功",
      data: {
        id: menus.length + 1,
        ...body,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "创建菜单失败" },
      { status: 500 }
    );
  }
}

// 更新菜单
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证菜单数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "菜单更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新菜单失败" },
      { status: 500 }
    );
  }
}

// 删除菜单
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除菜单
    
    return NextResponse.json({
      message: "菜单删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除菜单失败" },
      { status: 500 }
    );
  }
} 