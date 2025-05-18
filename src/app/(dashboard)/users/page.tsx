"use client";

import { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// 用户表单验证模式
const userFormSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3, "用户名至少3个字符"),
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符").optional(),
  roleIds: z.array(z.number()).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// 获取用户列表
async function fetchUsers() {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("获取用户列表失败");
  }
  const data = await response.json();
  return {
    users: data.users || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

// 获取所有角色
async function fetchRoles() {
  const response = await fetch("/api/roles?page=1&limit=1000");
  if (!response.ok) throw new Error("获取角色失败");
  const data = await response.json();
  return data.data?.items || [];
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormValues | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  // 获取用户列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, search],
    queryFn: fetchUsers,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  // 表单处理
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  });

  // 处理表单提交
  const onSubmit = async (values: UserFormValues) => {
    try {
      const url = values.id ? `/api/users/${values.id}` : "/api/users";
      const method = values.id ? "PUT" : "POST";
      const body = { ...values, roleIds: selectedRoles };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("保存用户失败");
      }

      toast({
        title: "成功",
        description: values.id ? "用户更新成功" : "用户创建成功",
      });

      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      toast({
        title: "错误",
        description: "保存用户失败",
        variant: "destructive",
      });
    }
  };

  // 处理编辑用户
  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({ ...user, roleIds: user.roles?.map((r: any) => r.id) || [] });
    setSelectedRoles(user.roles?.map((r: any) => r.id) || []);
    setIsDialogOpen(true);
  };

  // 处理删除用户
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个用户吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除用户失败");
      }

      toast({
        title: "成功",
        description: "用户删除成功",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      toast({
        title: "错误",
        description: "删除用户失败",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">用户管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            setSelectedRoles([]);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>添加用户</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "编辑用户" : "添加用户"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="请输入用户名"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="请输入姓名"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="请输入邮箱"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="请输入密码"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>分配角色</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start",
                        !selectedRoles.length && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      {selectedRoles.length
                        ? rolesQuery.data?.filter((r: any) => selectedRoles.includes(r.id)).map((r: any) => r.name).join("，")
                        : "请选择角色"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-2">
                    <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                      {rolesQuery.data?.map((role: any) => (
                        <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedRoles.includes(role.id)}
                            onCheckedChange={(checked: boolean) => {
                              setSelectedRoles((prev) =>
                                checked
                                  ? [...prev, role.id]
                                  : prev.filter((id) => id !== role.id)
                              );
                            }}
                          />
                          <span>{role.name}</span>
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
                    setEditingUser(null);
                    setSelectedRoles([]);
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
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles?.length
                    ? user.roles.map((r: any) => r.name).join("，")
                    : <span className="text-muted-foreground">无</span>}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(user.id)}
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
          共 {data?.total || 0} 条记录
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