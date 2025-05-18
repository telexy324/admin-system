"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Leave {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  type: {
    id: number;
    name: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: number;
  approvedBy?: {
    id: number;
    name: string;
  };
  approvedAt?: string;
  comment?: string;
  createdAt: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/leaves?${params}`);
      const result = await response.json();

      if (result.code === 200) {
        setLeaves(result.data.items);
        setTotal(result.data.total);
      } else {
        toast({
          title: "获取数据失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "获取数据失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, search, status]);

  const handleApprove = async (id: number, status: number) => {
    try {
      const response = await fetch(`/api/leaves`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          comment: status === 1 ? "已批准" : "已拒绝",
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        toast({
          title: "操作成功",
          description: status === 1 ? "已批准假期申请" : "已拒绝假期申请",
        });
        fetchLeaves();
      } else {
        toast({
          title: "操作失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条假期申请吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/leaves?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.code === 200) {
        toast({
          title: "删除成功",
          description: "假期申请已删除",
        });
        fetchLeaves();
      } else {
        toast({
          title: "删除失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "待审批";
      case 1:
        return "已批准";
      case 2:
        return "已拒绝";
      default:
        return "未知状态";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "text-yellow-600";
      case 1:
        return "text-green-600";
      case 2:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">假期申请管理</h1>
        <Button onClick={() => router.push("/leaves/new")}>新建申请</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="搜索申请人或原因"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            <SelectItem value="0">待审批</SelectItem>
            <SelectItem value="1">已批准</SelectItem>
            <SelectItem value="2">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>申请人</TableHead>
              <TableHead>假期类型</TableHead>
              <TableHead>开始日期</TableHead>
              <TableHead>结束日期</TableHead>
              <TableHead>天数</TableHead>
              <TableHead>原因</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>审批人</TableHead>
              <TableHead>审批时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.user.name}</TableCell>
                <TableCell>{leave.type.name}</TableCell>
                <TableCell>
                  {format(new Date(leave.startDate), "yyyy-MM-dd", {
                    locale: zhCN,
                  })}
                </TableCell>
                <TableCell>
                  {format(new Date(leave.endDate), "yyyy-MM-dd", {
                    locale: zhCN,
                  })}
                </TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell className={getStatusColor(leave.status)}>
                  {getStatusText(leave.status)}
                </TableCell>
                <TableCell>{leave.approvedBy?.name || "-"}</TableCell>
                <TableCell>
                  {leave.approvedAt
                    ? format(new Date(leave.approvedAt), "yyyy-MM-dd HH:mm", {
                        locale: zhCN,
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  {leave.status === 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(leave.id, 1)}
                      >
                        批准
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(leave.id, 2)}
                      >
                        拒绝
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(leave.id)}
                      >
                        删除
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          共 {total} 条记录，当前第 {page} 页
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page * limit >= total}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
} 