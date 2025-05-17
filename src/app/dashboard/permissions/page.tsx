"use client";

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

// 权限表单验证模式
const permissionFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "权限名称至少2个字符"),
  code: z.string().min(2, "权限代码至少2个字符"),
  description: z.string().min(2, "权限描述至少2个字符"),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

// 模拟获取权限列表
async function fetchPermissions() {
  const response = await fetch("/api/permissions");
  if (!response.ok) {
    throw new Error("获取权限列表失败");
  }
  return response.json();
}

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionFormValues | null>(null);

  // 获取权限列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", page, search],
    queryFn: fetchPermissions,
  });

  // 表单处理
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  // 处理表单提交
  const onSubmit = async (values: PermissionFormValues) => {
    try {
      const url = values.id ? `/api/permissions/${values.id}` : "/api/permissions";
      const method = values.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("保存权限失败");
      }

      setIsDialogOpen(false);
      form.reset();
      // TODO: 刷新权限列表
    } catch (error) {
      console.error("保存权限失败:", error);
    }
  };

  // 处理编辑权限
  const handleEdit = (permission: any) => {
    setEditingPermission(permission);
    form.reset(permission);
    setIsDialogOpen(true);
  };

  // 处理删除权限
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个权限吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除权限失败");
      }

      // TODO: 刷新权限列表
    } catch (error) {
      console.error("删除权限失败:", error);
    }
  };

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">权限管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>添加权限</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "编辑权限" : "添加权限"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">权限名称</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="请输入权限名称"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">权限代码</Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="请输入权限代码"
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">权限描述</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="请输入权限描述"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
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
                    setEditingPermission(null);
                  }}
                >
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索权限..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>权限名称</TableHead>
              <TableHead>权限代码</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.permissions.map((permission: any) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.code}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  {new Date(permission.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(permission)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(permission.id)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          共 {data?.total} 条记录
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!data?.hasMore}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
} 