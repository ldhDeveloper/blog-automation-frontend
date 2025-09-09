'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useQueryErrorHandler } from '@/contexts/error-context';
import { useWorkspace } from '@/contexts/workspace-context';
import { fetchWorkspaces } from '@/lib/api/workspace';
import type { Workspace } from '@/types/workspace';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminOnly, CanManageWorkspace } from './role-based-ui';

interface WorkspaceSwitcherProps {
  onCreateWorkspace?: () => void;
  onManageWorkspace?: (workspace: Workspace) => void;
}

export function WorkspaceSwitcher({ 
  onCreateWorkspace, 
  onManageWorkspace 
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { currentWorkspace, switchToWorkspace, isLoading } = useWorkspace();
  const { handleError } = useQueryErrorHandler();

  const { data: workspaces = [], isLoading: isLoadingWorkspaces, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    enabled: open, // 팝오버가 열릴 때만 로드
  });

  // 에러 처리
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  const handleSelect = async (workspace: Workspace) => {
    if (workspace.id === currentWorkspace?.id) {
      setOpen(false);
      return;
    }

    try {
      await switchToWorkspace(workspace.id);
      setOpen(false);
    } catch (error) {
      console.error('워크스페이스 전환 실패:', error);
    }
  };

  const handleCreateWorkspace = () => {
    setOpen(false);
    onCreateWorkspace?.();
  };

  const handleManageWorkspace = (workspace: Workspace) => {
    setOpen(false);
    onManageWorkspace?.(workspace);
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-between">
        <span className="truncate">워크스페이스 로딩 중...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="truncate">
              {currentWorkspace?.name || '워크스페이스를 선택하세요'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="워크스페이스 검색..." />
          <CommandList>
            <CommandEmpty>
              {isLoadingWorkspaces ? '로딩 중...' : '워크스페이스를 찾을 수 없습니다.'}
            </CommandEmpty>
            <CommandGroup heading="워크스페이스">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.name}
                  onSelect={() => handleSelect(workspace)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{workspace.name}</div>
                      {workspace.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {workspace.id === currentWorkspace?.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    <CanManageWorkspace>
                      {workspace.id === currentWorkspace?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManageWorkspace(workspace);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      )}
                    </CanManageWorkspace>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <AdminOnly>
              <CommandGroup>
                <CommandItem onSelect={handleCreateWorkspace}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 워크스페이스 생성
                </CommandItem>
              </CommandGroup>
            </AdminOnly>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
