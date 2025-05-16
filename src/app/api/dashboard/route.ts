import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: 从数据库获取实际数据
    const data = {
      stats: {
        totalUsers: 1234,
        newUsers: 23,
        activeUsers: 456,
        systemActivities: 89,
        growth: {
          totalUsers: 12,
          newUsers: 5,
          activeUsers: 8,
          systemActivities: 3,
        },
      },
      recentActivities: [
        {
          user: "张三",
          action: "登录系统",
          time: "10分钟前",
        },
        {
          user: "李四",
          action: "创建新用户",
          time: "30分钟前",
        },
        {
          user: "王五",
          action: "更新角色权限",
          time: "1小时前",
        },
      ],
      systemStatus: {
        cpu: 45,
        memory: 60,
        disk: 75,
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("获取仪表板数据失败:", error);
    return NextResponse.json(
      { error: "获取数据失败" },
      { status: 500 }
    );
  }
} 