'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from '@/components/ui/pagination';
import { buildSearchParams } from '@/lib/utils';
import { LeaveListParams } from '@/types/dtos';

// 请假表单验证模式
const leaveFormSchema = z.object({
  id: z.number().optional(),
  type: z.enum(["事假", "病假", "年假", "调休"], {
    required_error: "请选择请假类型",
  }),
  startDate: z.string().min(1, "请选择开始日期"),
  endDate: z.string().min(1, "请选择结束日期"),
  reason: z.string().min(2, "请假原因至少2个字符"),
  status: z.enum(["待审批", "已批准", "已拒绝"]).optional(),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export default function LeavePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageLimit = parseInt(searchParams.get("pageSize") || "10");
  const searchQuery = searchParams.get("search") || "";
  const field = searchParams.get("field") || "";
  const order = searchParams.get("order") as 'ASC' | 'DESC' | undefined;
  const type = searchParams.get("type") ? Number(searchParams.get("type")) as 1 | 2 | 3 | 4 | 5 : undefined;
  const status = searchParams.get("status") ? Number(searchParams.get("status")) as 1 | 2 | 3 : undefined;
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveFormValues | null>(null);

  // 获取请假列表
  const { data, isLoading } = useQuery({
    queryKey: ["leaves", currentPage, pageLimit, searchQuery],
    queryFn: async () => {
      const rawParams: LeaveListParams & { search?: string } = {
        page: currentPage,
        pageSize: pageLimit,
        field,
        order,
        type,
        status,
        startDate,
        endDate,
        search: searchQuery,
      };

      const params = buildSearchParams(rawParams);

      const response = await fetch(`/api/leaves?${params.toString()}`);
      const data = await response.json();

      if (data.code === 200) {
        return data.data;
      }
      throw new Error(data.message);
    }
  });

  // 表单处理
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      type: "事假",
      startDate: "",
      endDate: "",
      reason: "",
      status: "待审批",
    },
  });

  // 处理表单提交
  const onSubmit = async (values: LeaveFormValues) => {
    try {
      const url = values.id ? `/api/leaves/${values.id}` : "/api/leaves";
      const method = values.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("保存请假申请失败");
      }

      toast({
        title: "成功",
        description: values.id ? "请假申请更新成功" : "请假申请提交成功",
      });

      setIsDialogOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: "错误",
        description: "保存请假申请失败",
        variant: "destructive",
      });
    }
  };

  // 处理编辑请假
  const handleEdit = (leave: any) => {
    setEditingLeave(leave);
    form.reset(leave);
    setIsDialogOpen(true);
  };

  // 处理删除请假
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个请假申请吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除请假申请失败");
      }

      toast({
        title: "成功",
        description: "请假申请删除成功",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "错误",
        description: "删除请假申请失败",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">请假管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingLeave(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>申请请假</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLeave ? "编辑请假申请" : "申请请假"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">请假类型</Label>
                <Select
                  onValueChange={(value) => form.setValue("type", value as any)}
                  defaultValue={form.getValues("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择请假类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="事假">事假</SelectItem>
                    <SelectItem value="病假">病假</SelectItem>
                    <SelectItem value="年假">年假</SelectItem>
                    <SelectItem value="调休">调休</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register("endDate")}
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">请假原因</Label>
                <Input
                  id="reason"
                  {...form.register("reason")}
                  placeholder="请输入请假原因"
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.reason.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                    setEditingLeave(null);
                  }}
                >
                  取消
                </Button>
                <Button type="submit">提交</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索请假记录..."
          value={searchQuery}
          onChange={(e) => {
            const newSearch = e.target.value;

            // 当前参数对象
            const rawParams = Object.fromEntries(searchParams.entries());

            // 合并新的 search 值
            const mergedParams = {
              ...rawParams,
              search: newSearch.trim(), // 如果为空会被过滤掉
              page: 1, // 搜索时通常回到第一页
            };

            const params = buildSearchParams(mergedParams);
            router.push(`?${params.toString()}`);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>请假类型</TableHead>
              <TableHead>开始日期</TableHead>
              <TableHead>结束日期</TableHead>
              <TableHead>请假原因</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>申请人</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.map((leave: any) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.type}</TableCell>
                <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>{leave.status}</TableCell>
                <TableCell>{leave.user?.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(leave)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(leave.id)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination total={data?.total || 0} page={currentPage} limit={pageLimit} />
      </div>
    </div>
  );
} 