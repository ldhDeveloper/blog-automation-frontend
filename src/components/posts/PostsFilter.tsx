'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'generating', label: '생성 중' },
  { value: 'ready', label: '준비됨' },
  { value: 'published', label: '게시됨' },
  { value: 'failed', label: '실패' },
];

const sortOptions = [
  { value: 'createdAt', label: '생성일순' },
  { value: 'updatedAt', label: '수정일순' },
  { value: 'title', label: '제목순' },
  { value: 'status', label: '상태순' },
];

export function PostsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 300);

  const updateSearchParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // 검색 시 페이지는 1로 리셋
    if (key !== 'page') {
      params.delete('page');
    }
    
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url);
  }, [searchParams, pathname, router]);

  // 디바운스된 검색어 처리
  React.useEffect(() => {
    updateSearchParams('search', debouncedSearch);
  }, [debouncedSearch, updateSearchParams]);

  const handleStatusChange = (value: string) => {
    updateSearchParams('status', value === 'all' ? '' : value);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams('sort', value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">검색</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="포스트 제목 검색"
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
            aria-label="포스트 검색"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-filter">상태</Label>
        <Select 
          value={searchParams.get('status') || 'all'} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status-filter" className="w-full md:w-[180px]" aria-label="상태">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort-filter">정렬</Label>
        <Select 
          value={searchParams.get('sort') || 'createdAt'} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger id="sort-filter" className="w-full md:w-[180px]" aria-label="정렬">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
