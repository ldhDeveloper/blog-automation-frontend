import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { PostPreviewStep } from './preview-step';

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

describe('PostPreviewStep', () => {
  it('렌더링이 올바르게 된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('미리보기 및 확인')).toBeInTheDocument();
    expect(screen.getByText('포스트 미리보기')).toBeInTheDocument();
    expect(screen.getByText('기본 정보')).toBeInTheDocument();
    expect(screen.getByText('채널 및 설정')).toBeInTheDocument();
    expect(screen.getByText('추가 옵션')).toBeInTheDocument();
  });

  it('입력된 제목이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
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
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
  });

  it('입력된 주제가 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
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
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('주제: React')).toBeInTheDocument();
  });

  it('입력된 키워드가 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: 'React, JavaScript, 프론트엔드',
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
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('React, JavaScript, 프론트엔드')).toBeInTheDocument();
  });

  it('입력된 요약이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: true,
        tags: [],
        scheduledAt: undefined,
        allowComments: true,
        notifyFollowers: true,
        content: '',
        excerpt: '이것은 포스트 요약입니다.',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('이것은 포스트 요약입니다.')).toBeInTheDocument();
  });

  it('입력된 내용이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: true,
        tags: [],
        scheduledAt: undefined,
        allowComments: true,
        notifyFollowers: true,
        content: '이것은 포스트 내용입니다.\n여러 줄로 작성되었습니다.',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('이것은 포스트 내용입니다.\n여러 줄로 작성되었습니다.')).toBeInTheDocument();
  });

  it('선택된 채널이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: ['1', '2'],
        isPublic: true,
        tags: [],
        scheduledAt: undefined,
        allowComments: true,
        notifyFollowers: true,
        content: '',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('개인 블로그')).toBeInTheDocument();
    expect(screen.getByText('YouTube 채널')).toBeInTheDocument();
  });

  it('공개 설정이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: false,
        tags: [],
        scheduledAt: undefined,
        allowComments: true,
        notifyFollowers: true,
        content: '',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('비공개')).toBeInTheDocument();
  });

  it('태그가 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: true,
        tags: ['React', 'JavaScript'],
        scheduledAt: undefined,
        allowComments: true,
        notifyFollowers: true,
        content: '',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('예약 발행 시간이 미리보기에 표시된다', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString();
    
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: true,
        tags: [],
        scheduledAt: dateString,
        allowComments: true,
        notifyFollowers: true,
        content: '',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText(futureDate.toLocaleString('ko-KR'))).toBeInTheDocument();
  });

  it('추가 옵션이 미리보기에 표시된다', () => {
    const form = useForm<CreatePostForm>({
      defaultValues: {
        title: '테스트 포스트',
        topic: 'React',
        keywords: '',
        channelIds: [],
        isPublic: true,
        tags: [],
        scheduledAt: undefined,
        allowComments: false,
        notifyFollowers: false,
        content: '',
        excerpt: '',
      },
    });
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('아니오')).toBeInTheDocument();
  });

  it('입력되지 않은 필드는 기본값으로 표시된다', () => {
    const form = useForm<CreatePostForm>({
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
    
    render(<PostPreviewStep form={form} />);
    
    expect(screen.getByText('제목이 입력되지 않았습니다')).toBeInTheDocument();
    expect(screen.getByText('미선택')).toBeInTheDocument();
  });
});
