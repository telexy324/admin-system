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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 权限表单验证模式
const permissionFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "权限名称至少2个字符"),
  code: z.string().min(2, "权限代码至少2个字符"),
  description: z.string().min(2, "描述至少2个字符"),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

// 获取权限列表
async function fetchPermissions(page: number, pageSize: number, search: string) {
  const response = await fetch(
    `/api/permissions?page=${page}&pageSize=${pageSize}&search=${search}`
  );
  if (!response.ok) {
    throw new Error("获取权限列表失败");
  }
  return response.json();
}

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionFormValues | null>(null);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", page, pageSize, search],
    queryFn: () => fetchPermissions(page, pageSize, search),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreatePermission = async (values: PermissionFormValues) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("创建权限失败");
      }

      setIsDialogOpen(false);
      form.reset();
      // TODO: 刷新权限列表
    } catch (error) {
      console.error("创建权限失败:", error);
    }
  };

  const handleEditPermission = async (values: PermissionFormValues) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, id: editingPermission?.id }),
      });

      if (!response.ok) {
        throw new Error("更新权限失败");
      }

      setIsDialogOpen(false);
      setEditingPermission(null);
      form.reset();
      // TODO: 刷新权限列表
    } catch (error) {
      console.error("更新权限失败:", error);
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm("确定要删除这个权限吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions?id=${id}`, {
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

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>加载失败，请稍后重试</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">权限管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>创建权限</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "编辑权限" : "创建权限"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  editingPermission ? handleEditPermission : handleCreatePermission
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限名称</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限代码</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingPermission(null);
                      form.reset();
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingPermission ? "保存" : "创建"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索权限..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
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
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((permission: any) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.code}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>{permission.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPermission(permission);
                        form.reset(permission);
                        setIsDialogOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePermission(permission.id)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {data?.total} 条记录
        </div>
        <div className="flex items-center space-x-2">
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
            disabled={page * pageSize >= (data?.total || 0)}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
} 