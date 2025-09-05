import { createPostSchema, type CreatePostForm } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { PostBasicInfoStep } from './basic-info-step';

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

describe('PostBasicInfoStep', () => {
  it('렌더링이 올바르게 된다', () => {
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    expect(screen.getByText('기본 정보 입력')).toBeInTheDocument();
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText('주제 *')).toBeInTheDocument();
    expect(screen.getByLabelText('키워드')).toBeInTheDocument();
  });

  it('제목을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    const titleInput = screen.getByLabelText('제목 *');
    await user.type(titleInput, '테스트 포스트');
    
    expect(titleInput).toHaveValue('테스트 포스트');
  });

  it('주제를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    const topicInput = screen.getByLabelText('주제 *');
    await user.type(topicInput, 'React');
    
    expect(topicInput).toHaveValue('React');
  });

  it('키워드를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    const keywordsInput = screen.getByLabelText('키워드');
    await user.type(keywordsInput, 'React, JavaScript, 프론트엔드');
    
    expect(keywordsInput).toHaveValue('React, JavaScript, 프론트엔드');
  });

  it('입력된 정보 미리보기가 표시된다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    const titleInput = screen.getByLabelText('제목 *');
    const topicInput = screen.getByLabelText('주제 *');
    const keywordsInput = screen.getByLabelText('키워드');
    
    await user.type(titleInput, '테스트 포스트');
    await user.type(topicInput, 'React');
    await user.type(keywordsInput, 'React, JavaScript');
    
    expect(screen.getByText('입력 정보 미리보기')).toBeInTheDocument();
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('React, JavaScript')).toBeInTheDocument();
  });

  it('문자 수 표시가 올바르게 된다', async () => {
    const user = userEvent.setup();
    const form = useForm<CreatePostForm>();
    render(<PostBasicInfoStep form={form} />);
    
    const titleInput = screen.getByLabelText('제목 *');
    await user.type(titleInput, '테스트');
    
    expect(screen.getByText('2 / 200자')).toBeInTheDocument();
  });
});
