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

// 菜单表单验证模式
const menuFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "菜单名称至少2个字符"),
  path: z.string().min(1, "请输入菜单路径"),
  icon: z.string().optional(),
  parentId: z.number().optional(),
  order: z.number().min(0, "排序值必须大于等于0"),
  permissions: z.array(z.string()),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

// 模拟获取菜单列表
async function fetchMenus() {
  const response = await fetch("/api/menus");
  if (!response.ok) {
    throw new Error("获取菜单列表失败");
  }
  const data = await response.json();
  return {
    menus: data.menus || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

export default function MenusPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuFormValues | null>(null);

  // 获取菜单列表
  const { data, isLoading, error } = useQuery({
    queryKey: ["menus", page, search],
    queryFn: fetchMenus,
  });

  // 表单处理
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: "",
      path: "",
      icon: "",
      parentId: undefined,
      order: 0,
      permissions: [],
    },
  });

  // 处理表单提交
  const onSubmit = async (values: MenuFormValues) => {
    try {
      const url = values.id ? `/api/menus/${values.id}` : "/api/menus";
      const method = values.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("保存菜单失败");
      }

      setIsDialogOpen(false);
      form.reset();
      // TODO: 刷新菜单列表
    } catch (error) {
      console.error("保存菜单失败:", error);
    }
  };

  // 处理编辑菜单
  const handleEdit = (menu: any) => {
    setEditingMenu(menu);
    form.reset(menu);
    setIsDialogOpen(true);
  };

  // 处理删除菜单
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个菜单吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/menus/${id}`, {
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

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">菜单管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>添加菜单</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "编辑菜单" : "添加菜单"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">菜单名称</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="请输入菜单名称"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="path">菜单路径</Label>
                <Input
                  id="path"
                  {...form.register("path")}
                  placeholder="请输入菜单路径"
                />
                {form.formState.errors.path && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.path.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  {...form.register("icon")}
                  placeholder="请输入图标名称"
                />
                {form.formState.errors.icon && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.icon.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  {...form.register("order", { valueAsNumber: true })}
                  placeholder="请输入排序值"
                />
                {form.formState.errors.order && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.order.message}
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
                    setEditingMenu(null);
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
          placeholder="搜索菜单..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>菜单名称</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>图标</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.menus?.map((menu: any) => (
              <TableRow key={menu.id}>
                <TableCell>{menu.name}</TableCell>
                <TableCell>{menu.path}</TableCell>
                <TableCell>{menu.icon}</TableCell>
                <TableCell>{menu.order}</TableCell>
                <TableCell>
                  {new Date(menu.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(menu)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(menu.id)}
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