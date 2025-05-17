export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">用户总数</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">角色总数</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">菜单总数</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">权限总数</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
} 