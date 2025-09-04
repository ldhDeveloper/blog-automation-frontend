'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PostsHeader() {
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">포스트 관리</h1>
        <p className="text-muted-foreground">
          포스트를 관리하고 모니터링할 수 있습니다
        </p>
      </div>
      <Button onClick={handleCreatePost} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        새 포스트 생성
      </Button>
    </div>
  );
}
