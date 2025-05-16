import { ReactNode } from "react";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-6">
        {children}
      </div>
    </div>
  );
} 