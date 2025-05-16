"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Users, UserPlus, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    systemActivities: number;
    growth: {
      totalUsers: number;
      newUsers: number;
      activeUsers: number;
      systemActivities: number;
    };
  };
  recentActivities: Array<{
    user: string;
    action: string;
    time: string;
  }>;
  systemStatus: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("获取数据失败");
  }
  return response.json();
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // 每30秒刷新一次
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-lg text-destructive">加载失败，请稍后重试</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">仪表板</h2>
        <p className="text-muted-foreground">
          欢迎回来！这是您的系统概览。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              较上月增长 {data.stats.growth.totalUsers}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日新增</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.newUsers}</div>
            <p className="text-xs text-muted-foreground">
              较昨日增长 {data.stats.growth.newUsers}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              较昨日增长 {data.stats.growth.activeUsers}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统活动</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.systemActivities}</div>
            <p className="text-xs text-muted-foreground">
              较昨日增长 {data.stats.growth.systemActivities}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>活动</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">CPU 使用率</div>
                <div className="text-sm text-muted-foreground">{data.systemStatus.cpu}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${data.systemStatus.cpu}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">内存使用率</div>
                <div className="text-sm text-muted-foreground">{data.systemStatus.memory}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${data.systemStatus.memory}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">磁盘使用率</div>
                <div className="text-sm text-muted-foreground">{data.systemStatus.disk}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${data.systemStatus.disk}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 