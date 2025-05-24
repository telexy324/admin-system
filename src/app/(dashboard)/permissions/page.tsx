"use client";

import { useState, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// 权限表单验证模式
const permissionFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "权限名称至少2个字符"),
  description: z.string().min(2, "权限描述至少2个字符"),
  path: z.string().min(1, "API路径不能为空"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"], {
    required_error: "请选择HTTP方法",
  }),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

// 获取权限列表
async function fetchPermissions() {
  const response = await fetch("/api/permissions");
  if (!response.ok) {
    throw new Error("获取权限列表失败");
  }
  const data = await response.json();
  return {
    permissions: data.data?.items || [],
    total: data.data?.total || 0,
    hasMore: data.data?.hasMore || false,
  };
}

function PermissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionFormValues | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageLimit = parseInt(searchParams.get('limit') || '10');
  const searchQuery = searchParams.get('search') || '';

  // 获取权限列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", currentPage, pageLimit, searchQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/permissions?page=${currentPage}&limit=${pageLimit}&search=${searchQuery}`
      );
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      }
      throw new Error(data.message);
    },
  });

  // 表单处理
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      path: "",
      method: "GET",
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

      toast({
        title: "成功",
        description: values.id ? "权限更新成功" : "权限创建成功",
      });

      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    } catch (error) {
      toast({
        title: "错误",
        description: "保存权限失败",
        variant: "destructive",
      });
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

      toast({
        title: "成功",
        description: "权限删除成功",
      });

      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    } catch (error) {
      toast({
        title: "错误",
        description: "删除权限失败",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">权限管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPermission(null);
            form.reset();
          }
        }}>
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
              <div className="space-y-2">
                <Label htmlFor="path">API路径</Label>
                <Input
                  id="path"
                  {...form.register("path")}
                  placeholder="请输入API路径，例如：/api/users"
                />
                {form.formState.errors.path && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.path.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">HTTP方法</Label>
                <Select
                  onValueChange={(value) => form.setValue("method", value as any)}
                  defaultValue={form.getValues("method")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择HTTP方法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.method && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.method.message}
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
              <TableHead>描述</TableHead>
              <TableHead>API路径</TableHead>
              <TableHead>HTTP方法</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.map((permission: any) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>{permission.path}</TableCell>
                <TableCell>{permission.method}</TableCell>
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

      <div className="mt-4">
        <Pagination total={data?.total || 0} page={currentPage} limit={pageLimit} />
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <PermissionsContent />
    </Suspense>
  );
} 