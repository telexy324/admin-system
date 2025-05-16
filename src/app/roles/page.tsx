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

// 角色表单验证模式
const roleFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "角色名称至少2个字符"),
  code: z.string().min(2, "角色代码至少2个字符"),
  description: z.string().min(2, "描述至少2个字符"),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

// 获取角色列表
async function fetchRoles(page: number, pageSize: number, search: string) {
  const response = await fetch(
    `/api/roles?page=${page}&pageSize=${pageSize}&search=${search}`
  );
  if (!response.ok) {
    throw new Error("获取角色列表失败");
  }
  return response.json();
}

// 权限列表
const permissionOptions = [
  { value: "user:view", label: "查看用户" },
  { value: "user:manage", label: "管理用户" },
  { value: "role:view", label: "查看角色" },
  { value: "role:manage", label: "管理角色" },
  { value: "menu:view", label: "查看菜单" },
  { value: "menu:manage", label: "管理菜单" },
];

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleFormValues | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      permissions: [],
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles", page, pageSize, search],
    queryFn: () => fetchRoles(page, pageSize, search),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateRole = async (values: RoleFormValues) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("创建角色失败");
      }

      setIsDialogOpen(false);
      form.reset();
      // TODO: 刷新角色列表
    } catch (error) {
      console.error("创建角色失败:", error);
    }
  };

  const handleEditRole = async (values: RoleFormValues) => {
    try {
      const response = await fetch("/api/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, id: editingRole?.id }),
      });

      if (!response.ok) {
        throw new Error("更新角色失败");
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      form.reset();
      // TODO: 刷新角色列表
    } catch (error) {
      console.error("更新角色失败:", error);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("确定要删除这个角色吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/roles?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除角色失败");
      }

      // TODO: 刷新角色列表
    } catch (error) {
      console.error("删除角色失败:", error);
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
        <h2 className="text-3xl font-bold tracking-tight">角色管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>创建角色</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "编辑角色" : "创建角色"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  editingRole ? handleEditRole : handleCreateRole
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色名称</FormLabel>
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
                      <FormLabel>角色代码</FormLabel>
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
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权限</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {permissionOptions.map((permission) => (
                            <label
                              key={permission.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={field.value.includes(permission.value)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, permission.value]
                                    : field.value.filter(
                                        (v) => v !== permission.value
                                      );
                                  field.onChange(newValue);
                                }}
                                className="rounded border-gray-300"
                              />
                              <span>{permission.label}</span>
                            </label>
                          ))}
                        </div>
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
                      setEditingRole(null);
                      form.reset();
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingRole ? "保存" : "创建"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索角色..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>角色代码</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((role: any) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.code}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission: string) => {
                      const option = permissionOptions.find(
                        (p) => p.value === permission
                      );
                      return (
                        <span
                          key={permission}
                          className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {option?.label || permission}
                        </span>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>{role.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRole(role);
                        form.reset(role);
                        setIsDialogOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
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