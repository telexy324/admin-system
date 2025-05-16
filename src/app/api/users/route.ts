import { NextResponse } from "next/server";

// 模拟用户数据
const users = [
  {
    id: 1,
    username: "admin",
    name: "管理员",
    email: "admin@example.com",
    role: "管理员",
    status: "启用",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    username: "user1",
    name: "张三",
    email: "user1@example.com",
    role: "普通用户",
    status: "启用",
    createdAt: "2024-01-02",
  },
  {
    id: 3,
    username: "user2",
    name: "李四",
    email: "user2@example.com",
    role: "普通用户",
    status: "禁用",
    createdAt: "2024-01-03",
  },
];

// 获取用户列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  // 模拟搜索和分页
  const filteredUsers = users.filter(user => 
    user.username.includes(search) || 
    user.name.includes(search) || 
    user.email.includes(search)
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);

  return NextResponse.json({
    data: paginatedUsers,
    total: filteredUsers.length,
    page,
    pageSize,
  });
}

// 创建用户
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: 验证用户数据
    // TODO: 保存到数据库
    
    return NextResponse.json({
      message: "用户创建成功",
      data: {
        id: users.length + 1,
        ...body,
        createdAt: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "创建用户失败" },
      { status: 500 }
    );
  }
}

// 更新用户
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    // TODO: 验证用户数据
    // TODO: 更新数据库
    
    return NextResponse.json({
      message: "用户更新成功",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // TODO: 从数据库删除用户
    
    return NextResponse.json({
      message: "用户删除成功",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
} 