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

// 菜单表单验证模式
const menuFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "菜单名称至少2个字符"),
  path: z.string().min(1, "菜单路径不能为空"),
  icon: z.string().min(1, "菜单图标不能为空"),
  parentId: z.number().nullable(),
  order: z.number().min(0, "排序值不能小于0"),
  permissions: z.array(z.string()),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

// 获取菜单列表
async function fetchMenus(page: number, pageSize: number, search: string) {
  const response = await fetch(
    `/api/menus?page=${page}&pageSize=${pageSize}&search=${search}`
  );
  if (!response.ok) {
    throw new Error("获取菜单列表失败");
  }
  return response.json();
}

// 获取权限列表
async function fetchPermissions() {
  const response = await fetch("/api/permissions");
  if (!response.ok) {
    throw new Error("获取权限列表失败");
  }
  return response.json();
}

export default function MenusPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuFormValues | null>(null);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: "",
      path: "",
      icon: "",
      parentId: null,
      order: 0,
      permissions: [],
    },
  });

  const { data: menusData, isLoading: isMenusLoading, error: menusError } = useQuery({
    queryKey: ["menus", page, pageSize, search],
    queryFn: () => fetchMenus(page, pageSize, search),
  });

  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreateMenu = async (values: MenuFormValues) => {
    try {
      const response = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("创建菜单失败");
      }

      setIsDialogOpen(false);
      form.reset();
      // TODO: 刷新菜单列表
    } catch (error) {
      console.error("创建菜单失败:", error);
    }
  };

  const handleEditMenu = async (values: MenuFormValues) => {
    try {
      const response = await fetch("/api/menus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, id: editingMenu?.id }),
      });

      if (!response.ok) {
        throw new Error("更新菜单失败");
      }

      setIsDialogOpen(false);
      setEditingMenu(null);
      form.reset();
      // TODO: 刷新菜单列表
    } catch (error) {
      console.error("更新菜单失败:", error);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm("确定要删除这个菜单吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/menus?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除菜单失败");
      }

      // TODO: 刷新菜单列表
    } catch (error) {
      console.error("删除菜单失败:", error);
    }
  };

  if (isMenusLoading) {
    return <div>加载中...</div>;
  }

  if (menusError) {
    return <div>加载失败，请稍后重试</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">菜单管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>创建菜单</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "编辑菜单" : "创建菜单"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  editingMenu ? handleEditMenu : handleCreateMenu
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>菜单名称</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>菜单路径</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>菜单图标</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>父级菜单</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        >
                          <option value="">无</option>
                          {menusData?.data.map((menu: any) => (
                            <option key={menu.id} value={menu.id}>
                              {menu.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>排序</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
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
                          {permissionsData?.data.map((permission: any) => (
                            <label
                              key={permission.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={field.value.includes(permission.code)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...field.value, permission.code]
                                    : field.value.filter(
                                        (v) => v !== permission.code
                                      );
                                  field.onChange(newValue);
                                }}
                                className="rounded border-gray-300"
                              />
                              <span>{permission.name}</span>
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
                      setEditingMenu(null);
                      form.reset();
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingMenu ? "保存" : "创建"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索菜单..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>菜单名称</TableHead>
              <TableHead>菜单路径</TableHead>
              <TableHead>图标</TableHead>
              <TableHead>父级菜单</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menusData?.data.map((menu: any) => (
              <TableRow key={menu.id}>
                <TableCell>{menu.name}</TableCell>
                <TableCell>{menu.path}</TableCell>
                <TableCell>{menu.icon}</TableCell>
                <TableCell>
                  {menu.parentId
                    ? menusData.data.find((m: any) => m.id === menu.parentId)?.name
                    : "无"}
                </TableCell>
                <TableCell>{menu.order}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {menu.permissions.map((permission: string) => {
                      const permissionData = permissionsData?.data.find(
                        (p: any) => p.code === permission
                      );
                      return (
                        <span
                          key={permission}
                          className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {permissionData?.name || permission}
                        </span>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>{menu.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMenu(menu);
                        form.reset(menu);
                        setIsDialogOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu.id)}
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
          共 {menusData?.total} 条记录
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
            disabled={page * pageSize >= (menusData?.total || 0)}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
} 