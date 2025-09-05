import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCreateForm } from './post-create-form';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PostCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 올바르게 된다', () => {
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    expect(screen.getByText('새 포스트 생성')).toBeInTheDocument();
    expect(screen.getByText('기본 정보')).toBeInTheDocument();
    expect(screen.getByText('채널 선택')).toBeInTheDocument();
    expect(screen.getByText('옵션 설정')).toBeInTheDocument();
    expect(screen.getByText('내용 작성')).toBeInTheDocument();
    expect(screen.getByText('미리보기')).toBeInTheDocument();
  });

  it('첫 번째 단계에서 기본 정보를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const titleInput = screen.getByLabelText('제목 *');
    const topicInput = screen.getByLabelText('주제 *');
    const keywordsInput = screen.getByLabelText('키워드');
    
    await user.type(titleInput, '테스트 포스트');
    await user.type(topicInput, 'React');
    await user.type(keywordsInput, 'React, JavaScript, 프론트엔드');
    
    expect(titleInput).toHaveValue('테스트 포스트');
    expect(topicInput).toHaveValue('React');
    expect(keywordsInput).toHaveValue('React, JavaScript, 프론트엔드');
  });

  it('필수 필드가 비어있으면 다음 단계로 진행할 수 없다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const nextButton = screen.getByText('다음');
    expect(nextButton).toBeDisabled();
  });

  it('필수 필드를 입력하면 다음 단계로 진행할 수 있다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const titleInput = screen.getByLabelText('제목 *');
    const topicInput = screen.getByLabelText('주제 *');
    
    await user.type(titleInput, '테스트 포스트');
    await user.type(topicInput, 'React');
    
    const nextButton = screen.getByText('다음');
    expect(nextButton).not.toBeDisabled();
    
    await user.click(nextButton);
    
    // 두 번째 단계로 이동
    expect(screen.getByText('채널 선택')).toBeInTheDocument();
  });

  it('이전 버튼으로 단계를 되돌릴 수 있다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    // 첫 번째 단계에서 다음으로 이동
    const titleInput = screen.getByLabelText('제목 *');
    const topicInput = screen.getByLabelText('주제 *');
    
    await user.type(titleInput, '테스트 포스트');
    await user.type(topicInput, 'React');
    
    const nextButton = screen.getByText('다음');
    await user.click(nextButton);
    
    // 이전 버튼으로 돌아가기
    const prevButton = screen.getByText('이전');
    await user.click(prevButton);
    
    // 첫 번째 단계로 돌아감
    expect(screen.getByText('기본 정보')).toBeInTheDocument();
  });

  it('입력값이 유지된다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const titleInput = screen.getByLabelText('제목 *');
    const topicInput = screen.getByLabelText('주제 *');
    
    await user.type(titleInput, '테스트 포스트');
    await user.type(topicInput, 'React');
    
    // 다음 단계로 이동
    const nextButton = screen.getByText('다음');
    await user.click(nextButton);
    
    // 이전 단계로 돌아가기
    const prevButton = screen.getByText('이전');
    await user.click(prevButton);
    
    // 입력값이 유지되는지 확인
    expect(titleInput).toHaveValue('테스트 포스트');
    expect(topicInput).toHaveValue('React');
  });

  it('제목이 200자를 초과하면 유효성 검사에 실패한다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const titleInput = screen.getByLabelText('제목 *');
    const longTitle = 'a'.repeat(201);
    
    await user.type(titleInput, longTitle);
    
    // 유효성 검사 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('제목은 200자 이하로 입력해주세요')).toBeInTheDocument();
    });
  });

  it('주제가 100자를 초과하면 유효성 검사에 실패한다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const topicInput = screen.getByLabelText('주제 *');
    const longTopic = 'a'.repeat(101);
    
    await user.type(topicInput, longTopic);
    
    // 유효성 검사 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('주제는 100자 이하로 입력해주세요')).toBeInTheDocument();
    });
  });

  it('키워드가 500자를 초과하면 유효성 검사에 실패한다', async () => {
    const user = userEvent.setup();
    render(<PostCreateForm />, { wrapper: createWrapper() });
    
    const keywordsInput = screen.getByLabelText('키워드');
    const longKeywords = 'a'.repeat(501);
    
    await user.type(keywordsInput, longKeywords);
    
    // 유효성 검사 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('키워드는 500자 이하로 입력해주세요')).toBeInTheDocument();
    });
  });
});
