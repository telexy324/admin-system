"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // try {
    //   const isMobile =
    //     typeof navigator !== 'undefined' &&
    //     /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet|webOS|BlackBerry|IEMobile|Opera Mini|ReactNative/i.test(
    //       navigator.userAgent
    //     );
    //   if (isMobile) {
    //     const result = await signIn('credentials', {
    //       email,
    //       password,
    //       redirect: false,
    //     });
    //
    //     if (result?.error) {
    //       toast({
    //         title: '登录失败',
    //         description: result.error,
    //         variant: 'destructive',
    //       });
    //     } else {
    //       toast({
    //         title: '登录成功',
    //         description: '正在跳转到仪表盘...',
    //       });
    //       router.replace('/dashboard'); // 手动跳转
    //     }
    //   } else {
    //     await signIn('credentials', {
    //       email,
    //       password,
    //       redirect: true,
    //       redirectTo: '/dashboard',
    //     });
    //   }
    //   // const result = await signIn('credentials', {
    //   //   email,
    //   //   password,
    //   //   redirect: false,
    //   // });
    //   //
    //   // if (result?.error) {
    //   //   toast({
    //   //     title: '登录失败',
    //   //     description: result.error,
    //   //     variant: 'destructive',
    //   //   });
    //   // } else {
    //   //   toast({
    //   //     title: '登录成功',
    //   //     description: '正在跳转到仪表盘...',
    //   //   });
    //   //   router.replace('/dashboard');
    //   // }
    // } catch {
    //   toast({
    //     title: '登录失败',
    //     description: '发生未知错误，请稍后重试',
    //     variant: 'destructive',
    //   });
    // } finally {
    //   setLoading(false);
    // }
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // 统一用 false，手动跳转更灵活
      });

      if (result?.error) {
        toast({
          title: '登录失败',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '登录成功',
        description: '正在跳转到仪表盘...',
      });

      // 等待 session 写入成功，防止立即跳转被服务器判断为未登录
      const MAX_RETRIES = 5;
      let retries = 0;
      let session = await getSession();

      while (!session && retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 300));
        session = await getSession();
        retries++;
      }

      if (!session) {
        toast({
          title: '登录失败',
          description: '会话未建立，请重试。',
          variant: 'destructive',
        });
        return;
      }

      router.replace('/dashboard');
    } catch {
      toast({
        title: '登录失败',
        description: '发生未知错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录系统
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="邮箱"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 