import { createClient } from '@/lib/supabase';
import { createPostSchema } from '@/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod 스키마로 유효성 검사
    const validatedData = createPostSchema.parse(body);
    
    // Supabase 클라이언트 생성
    const supabase = createClient();
    
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    // 포스트 생성
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: validatedData.title,
        topic: validatedData.topic,
        keywords: validatedData.keywords,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        is_public: validatedData.isPublic,
        allow_comments: validatedData.allowComments,
        notify_followers: validatedData.notifyFollowers,
        scheduled_at: validatedData.scheduledAt,
        author_id: user.id,
        status: 'draft',
      })
      .select()
      .single();
    
    if (postError) {
      console.error('포스트 생성 오류:', postError);
      return NextResponse.json(
        { success: false, message: '포스트 생성에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // 태그 저장
    if (validatedData.tags && validatedData.tags.length > 0) {
      const { error: tagsError } = await supabase
        .from('post_tags')
        .insert(
          validatedData.tags.map(tag => ({
            post_id: post.id,
            tag_name: tag,
          }))
        );
      
      if (tagsError) {
        console.error('태그 저장 오류:', tagsError);
        // 태그 저장 실패는 포스트 생성을 중단시키지 않음
      }
    }
    
    // 채널 연결
    if (validatedData.channelIds && validatedData.channelIds.length > 0) {
      const { error: channelsError } = await supabase
        .from('post_channels')
        .insert(
          validatedData.channelIds.map(channelId => ({
            post_id: post.id,
            channel_id: channelId,
          }))
        );
      
      if (channelsError) {
        console.error('채널 연결 오류:', channelsError);
        // 채널 연결 실패는 포스트 생성을 중단시키지 않음
      }
    }
    
    return NextResponse.json({
      success: true,
      data: post,
      message: '포스트가 성공적으로 생성되었습니다',
    });
    
  } catch (error) {
    console.error('API 오류:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: '입력 데이터가 올바르지 않습니다' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const supabase = createClient();
    
    // 현재 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    // 포스트 목록 조회
    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (postsError) {
      console.error('포스트 조회 오류:', postsError);
      return NextResponse.json(
        { success: false, message: '포스트 조회에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
