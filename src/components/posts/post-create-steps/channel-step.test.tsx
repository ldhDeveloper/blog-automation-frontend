import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { PostChannelStep } from './channel-step';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      topic: '',
      keywords: '',
      channelIds: [],
      isPublic: true,
      tags: [],
      scheduledAt: undefined,
      allowComments: true,
      notifyFollowers: true,
      content: '',
      excerpt: '',
    },
  });

  return (
    <form>
      {children}
    </form>
  );
};

describe('PostChannelStep', () => {
  it('렌더링이 올바르게 된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    expect(screen.getByText('채널 선택')).toBeInTheDocument();
    expect(screen.getByText('개인 블로그')).toBeInTheDocument();
    expect(screen.getByText('YouTube 채널')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('RSS 피드')).toBeInTheDocument();
  });

  it('채널을 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    const blogChannel = screen.getByText('개인 블로그').closest('[role="button"]');
    expect(blogChannel).toBeInTheDocument();
    
    await user.click(blogChannel!);
    
    // 선택된 채널이 요약에 표시되는지 확인
    expect(screen.getByText('선택된 채널 (1개)')).toBeInTheDocument();
    expect(screen.getByText('개인 블로그')).toBeInTheDocument();
  });

  it('여러 채널을 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    const blogChannel = screen.getByText('개인 블로그').closest('[role="button"]');
    const youtubeChannel = screen.getByText('YouTube 채널').closest('[role="button"]');
    
    await user.click(blogChannel!);
    await user.click(youtubeChannel!);
    
    expect(screen.getByText('선택된 채널 (2개)')).toBeInTheDocument();
    expect(screen.getByText('개인 블로그')).toBeInTheDocument();
    expect(screen.getByText('YouTube 채널')).toBeInTheDocument();
  });

  it('선택된 채널을 해제할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    const blogChannel = screen.getByText('개인 블로그').closest('[role="button"]');
    
    // 채널 선택
    await user.click(blogChannel!);
    expect(screen.getByText('선택된 채널 (1개)')).toBeInTheDocument();
    
    // 채널 해제
    await user.click(blogChannel!);
    expect(screen.getByText('최소 하나의 채널을 선택해주세요')).toBeInTheDocument();
  });

  it('채널이 선택되지 않으면 안내 메시지가 표시된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    expect(screen.getByText('최소 하나의 채널을 선택해주세요')).toBeInTheDocument();
  });

  it('채널 선택 시 시각적 피드백이 제공된다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    const blogChannel = screen.getByText('개인 블로그').closest('[role="button"]');
    
    // 선택 전
    expect(blogChannel).not.toHaveClass('ring-2', 'ring-blue-500', 'bg-blue-50');
    
    // 선택 후
    await user.click(blogChannel!);
    expect(blogChannel).toHaveClass('ring-2', 'ring-blue-500', 'bg-blue-50');
  });

  it('체크박스가 올바르게 표시된다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    const blogChannel = screen.getByText('개인 블로그').closest('[role="button"]');
    const checkbox = screen.getByRole('checkbox', { name: /개인 블로그/i });
    
    expect(checkbox).not.toBeChecked();
    
    await user.click(blogChannel!);
    expect(checkbox).toBeChecked();
  });

  it('채널 정보가 올바르게 표시된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    // 각 채널의 정보 확인
    expect(screen.getByText('개인 기술 블로그')).toBeInTheDocument();
    expect(screen.getByText('개발 관련 영상 채널')).toBeInTheDocument();
    expect(screen.getByText('개발 소식 공유')).toBeInTheDocument();
    expect(screen.getByText('개발 일상 공유')).toBeInTheDocument();
    expect(screen.getByText('RSS 구독자용 피드')).toBeInTheDocument();
  });

  it('플랫폼 배지가 표시된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostChannelStep form={form} />);
    
    expect(screen.getByText('blog')).toBeInTheDocument();
    expect(screen.getByText('youtube')).toBeInTheDocument();
    expect(screen.getByText('twitter')).toBeInTheDocument();
    expect(screen.getByText('instagram')).toBeInTheDocument();
    expect(screen.getByText('rss')).toBeInTheDocument();
  });
});
