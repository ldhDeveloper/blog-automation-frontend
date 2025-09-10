import { PostCreateForm } from '@/components/posts/post-create-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function CreatePostPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>뒤로가기</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>대시보드</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 제목 영역 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">새 포스트 생성</h1>
          <p className="text-gray-600 dark:text-gray-400">
            단계별로 포스트 정보를 입력하여 새로운 블로그 포스트를 생성하세요
          </p>
        </div>
        
        <PostCreateForm />
      </div>
    </div>
  );
}
