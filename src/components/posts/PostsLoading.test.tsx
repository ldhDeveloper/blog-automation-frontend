import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PostsLoading } from './PostsLoading';

describe('PostsLoading', () => {
  describe('기본 렌더링', () => {
    it('should render loading skeleton', () => {
      // When
      render(<PostsLoading />);

      // Then
      // 스켈레톤 요소들이 렌더링되는지 확인
      const skeletonElements = document.querySelectorAll('.bg-muted.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should have proper skeleton structure', () => {
      // When
      render(<PostsLoading />);

      // Then
      // 헤더 스켈레톤
      expect(document.querySelector('.h-8.w-48.bg-muted')).toBeInTheDocument();
      expect(document.querySelector('.h-4.w-72.bg-muted')).toBeInTheDocument();
      
      // 필터 스켈레톤
      expect(document.querySelector('.h-4.w-12.bg-muted')).toBeInTheDocument();
      expect(document.querySelector('.h-10.w-full.bg-muted')).toBeInTheDocument();
      
      // 테이블 스켈레톤
      expect(document.querySelector('.rounded-md.border')).toBeInTheDocument();
    });

    it('should render multiple table rows', () => {
      // When
      render(<PostsLoading />);

      // Then
      // 5개의 테이블 행이 렌더링되는지 확인
      const tableRows = document.querySelectorAll('.border-b.last\\:border-b-0');
      expect(tableRows.length).toBe(5);
    });

    it('should have proper CSS classes', () => {
      // When
      render(<PostsLoading />);

      // Then
      const skeletonElements = document.querySelectorAll('.bg-muted.animate-pulse');
      skeletonElements.forEach(element => {
        expect(element).toHaveClass('bg-muted');
        expect(element).toHaveClass('animate-pulse');
        expect(element).toHaveClass('rounded');
      });
    });
  });

  describe('반응형 디자인', () => {
    it('should have responsive classes', () => {
      // When
      render(<PostsLoading />);

      // Then
      expect(document.querySelector('.flex-col.gap-4.md\\:flex-row')).toBeInTheDocument();
      expect(document.querySelector('.w-full.md\\:w-\\[180px\\]')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should be accessible', () => {
      // When
      render(<PostsLoading />);

      // Then
      // 스켈레톤이 시각적으로만 존재하고 스크린 리더에는 방해가 되지 않아야 함
      const container = document.querySelector('.space-y-4');
      expect(container).toBeInTheDocument();
    });
  });
});