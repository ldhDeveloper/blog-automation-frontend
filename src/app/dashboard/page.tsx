'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal';
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher';
import { useWorkspace } from '@/contexts/workspace-context';
import { useCookieAuth } from '@/providers/cookie-auth-provider';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
function DashboardContent() {
  const { user, signOut } = useCookieAuth();
  const { isLoading: isLoadingWorkspace } = useWorkspace();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다');
    } catch {
      toast.error('로그아웃 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                블로그 자동화 대시보드
              </h1>
              {!isLoadingWorkspace && (
                <div className="w-64">
                  <WorkspaceSwitcher 
                    onCreateWorkspace={() => setShowCreateWorkspace(true)}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                안녕하세요, {user?.email}님
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>환영합니다!</CardTitle>
                <CardDescription>
                  블로그 자동화 플랫폼에 오신 것을 환영합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이곳에서 블로그 포스트를 자동으로 생성하고 관리할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>포스트 관리</CardTitle>
                <CardDescription>
                  블로그 포스트 생성 및 관리
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <Button className="w-full" disabled>
                  곧 출시 예정
                </Button> */}
                <Link href="/posts/create">
                  <Button className="w-full">포스트 생성</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>채널 관리</CardTitle>
                <CardDescription>
                  블로그 채널 설정 및 관리
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  곧 출시 예정
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateWorkspaceModal
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onSuccess={() => {
          toast.success('워크스페이스가 생성되었습니다');
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
