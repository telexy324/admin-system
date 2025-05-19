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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';

// 角色表单验证模式
const roleFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "角色名称至少2个字符"),
  description: z.string().min(2, "角色描述至少2个字符"),
  permissions: z.array(z.string()),
  userIds: z.array(z.number()).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

// 获取所有用户
async function fetchUsers() {
  const response = await fetch("/api/users?page=1&limit=1000");
  if (!response.ok) throw new Error("获取用户失败");
  const data = await response.json();
  return data.data?.items || [];
}

// 获取所有权限
async function fetchPermissions() {
  const response = await fetch("/api/permissions?page=1&limit=1000");
  if (!response.ok) throw new Error("获取权限失败");
  const data = await response.json();
  return data.data?.items || [];
}

export default function RolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageLimit = parseInt(searchParams.get('limit') || '10');
  const searchQuery = searchParams.get('search') || '';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleFormValues | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // 获取角色列表
  const { data, isLoading } = useQuery({
    queryKey: ["roles", currentPage, pageLimit, searchQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/roles?page=${currentPage}&limit=${pageLimit}&search=${searchQuery}`
      );
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      }
      throw new Error(data.message);
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const permissionsQuery = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  // 表单处理
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  // 处理表单提交
  const onSubmit = async (values: RoleFormValues) => {
    try {
      const url = values.id ? `/api/roles/${values.id}` : "/api/roles";
      const method = values.id ? "PUT" : "POST";
      const body = { ...values, userIds: selectedUsers, permissionIds: selectedPermissions };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("保存角色失败");
      }

      setIsDialogOpen(false);
      form.reset();
      setSelectedUsers([]);
      setSelectedPermissions([]);
      // TODO: 刷新角色列表
    } catch (error) {
      console.error("保存角色失败:", error);
    }
  };

  // 处理编辑角色
  const handleEdit = (role: any) => {
    setEditingRole(role);
    form.reset({ ...role, userIds: role.users?.map((u: any) => u.id) || [] });
    setSelectedUsers(role.users?.map((u: any) => u.id) || []);
    setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
    setIsDialogOpen(true);
  };

  // 处理删除角色
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该角色吗？')) return;

    try {
      const response = await fetch(`/api/roles?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.code === 200) {
        toast({
          title: '删除成功',
          description: '角色已成功删除',
        });
        // 重新获取角色列表
        router.refresh();
      } else {
        toast({
          title: '删除失败',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">角色管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingRole(null);
            setSelectedUsers([]);
            setSelectedPermissions([]);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>添加角色</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "编辑角色" : "添加角色"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">角色名称</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="请输入角色名称"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">角色描述</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="请输入角色描述"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>分配用户</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start",
                        !selectedUsers.length && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      {selectedUsers.length
                        ? usersQuery.data?.filter((u: any) => selectedUsers.includes(u.id)).map((u: any) => u.name).join("，")
                        : "请选择用户"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-2">
                    <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                      {usersQuery.data?.map((user: any) => (
                        <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked: boolean) => {
                              setSelectedUsers((prev) =>
                                checked
                                  ? [...prev, user.id]
                                  : prev.filter((id) => id !== user.id)
                              );
                            }}
                          />
                          <span>{user.name}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>分配权限</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start",
                        !selectedPermissions.length && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      {selectedPermissions.length
                        ? permissionsQuery.data?.filter((p: any) => selectedPermissions.includes(p.id)).map((p: any) => p.name).join("，")
                        : "请选择权限"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-2">
                    <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                      {permissionsQuery.data?.map((permission: any) => (
                        <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked: boolean) => {
                              setSelectedPermissions((prev) =>
                                checked
                                  ? [...prev, permission.id]
                                  : prev.filter((id) => id !== permission.id)
                              );
                            }}
                          />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                    setEditingRole(null);
                    setSelectedUsers([]);
                    setSelectedPermissions([]);
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
          placeholder="搜索角色..."
          value={searchQuery}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set('search', e.target.value);
            router.push(`?${params.toString()}`);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>关联用户</TableHead>
              <TableHead>关联权限</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((role: any) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  {role.users?.length
                    ? role.users.map((u: any) => u.name).join("，")
                    : <span className="text-muted-foreground">无</span>}
                </TableCell>
                <TableCell>
                  {role.permissions?.length
                    ? role.permissions.map((p: any) => p.name).join("，")
                    : <span className="text-muted-foreground">无</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(role.id)}
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