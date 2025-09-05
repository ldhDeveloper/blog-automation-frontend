import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { PostOptionsStep } from './options-step';

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

describe('PostOptionsStep', () => {
  it('렌더링이 올바르게 된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    expect(screen.getByText('옵션 설정')).toBeInTheDocument();
    expect(screen.getByText('공개 설정')).toBeInTheDocument();
    expect(screen.getByText('태그')).toBeInTheDocument();
    expect(screen.getByText('예약 발행')).toBeInTheDocument();
    expect(screen.getByText('추가 옵션')).toBeInTheDocument();
  });

  it('공개 설정을 토글할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const publicSwitch = screen.getByRole('switch', { name: /공개 포스트/i });
    expect(publicSwitch).toBeChecked();
    
    await user.click(publicSwitch);
    expect(publicSwitch).not.toBeChecked();
  });

  it('태그를 추가할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const tagInput = screen.getByPlaceholderText('태그를 입력하세요');
    const addButton = screen.getByText('추가');
    
    await user.type(tagInput, 'React');
    await user.click(addButton);
    
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('태그를 제거할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const tagInput = screen.getByPlaceholderText('태그를 입력하세요');
    const addButton = screen.getByText('추가');
    
    await user.type(tagInput, 'React');
    await user.click(addButton);
    
    const removeButton = screen.getByRole('button', { name: /remove react/i });
    await user.click(removeButton);
    
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('Enter 키로 태그를 추가할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const tagInput = screen.getByPlaceholderText('태그를 입력하세요');
    
    await user.type(tagInput, 'React');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('중복 태그는 추가되지 않는다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const tagInput = screen.getByPlaceholderText('태그를 입력하세요');
    const addButton = screen.getByText('추가');
    
    await user.type(tagInput, 'React');
    await user.click(addButton);
    
    await user.type(tagInput, 'React');
    await user.click(addButton);
    
    const reactTags = screen.getAllByText('React');
    expect(reactTags).toHaveLength(1);
  });

  it('예약 발행 시간을 설정할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const dateInput = screen.getByLabelText('발행 예정 시간');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().slice(0, 16);
    
    await user.type(dateInput, dateString);
    
    expect(dateInput).toHaveValue(dateString);
  });

  it('댓글 허용을 토글할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const commentsSwitch = screen.getByRole('switch', { name: /댓글 허용/i });
    expect(commentsSwitch).toBeChecked();
    
    await user.click(commentsSwitch);
    expect(commentsSwitch).not.toBeChecked();
  });

  it('팔로워 알림을 토글할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const notificationSwitch = screen.getByRole('switch', { name: /팔로워 알림/i });
    expect(notificationSwitch).toBeChecked();
    
    await user.click(notificationSwitch);
    expect(notificationSwitch).not.toBeChecked();
  });

  it('설정 요약이 표시된다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostOptionsStep form={form} />);
    
    const tagInput = screen.getByPlaceholderText('태그를 입력하세요');
    const addButton = screen.getByText('추가');
    
    await user.type(tagInput, 'React');
    await user.click(addButton);
    
    expect(screen.getByText('설정 요약')).toBeInTheDocument();
    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
