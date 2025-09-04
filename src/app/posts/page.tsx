'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PostsTable } from '@/components/posts/PostsTable';
import { PostsFilter } from '@/components/posts/PostsFilter';
import { PostsHeader } from '@/components/posts/PostsHeader';
import { PostsLoading } from '@/components/posts/PostsLoading';

function PostsContent() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6" role="main">
      <PostsHeader />
      <PostsFilter />
      <Suspense fallback={<PostsLoading />}>
        <PostsTable />
      </Suspense>
    </main>
  );
}

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsContent />
    </ProtectedRoute>
  );
}
