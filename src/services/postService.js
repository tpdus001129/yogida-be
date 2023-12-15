import Post from '../models/schemas/post.js';

export async function getAllPosts() {
  try {
    const posts = await Post.find({}).exec();

    if (!posts || posts.length === 0) {
      return { status: 400, message: '게시글이 없습니다.' };
    }

    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getPostById(_id) {
  try {
    const post = await Post.findOne({ _id }).exec();

    if (!post || post.length === 0) {
      return { status: 400, message: '게시글이 없습니다.' };
    }

    return post;
  } catch (err) {
    throw new Error(err);
  }
}

export async function createPost(postProps) {
  // 입력된 게시글 내용이 없는 경우 에러 처리
  if (!postProps) {
    return { status: 400, message: '게시글 내용이 없습니다.' };
  }

  // 여행일정과 관련된 변수 설정
  const singleScheduleLength = postProps.schedules.length;
  const stDate = postProps.startDate;
  const endDate = postProps.endDate;

  // 세부 장소와 거리에 관련된 변수 설정
  const singleSchedulePlaceCounts = postProps.schedules.map((location) => location.length - 1);
  const distancesCounts = postProps.distances.map((distance) => distance.length);

  // 여행일정 수 계산 (5월 30일 ~ 6월 2일이여도 계산 가능)
  const dtMs = endDate.getTime() - stDate.getTime();
  const travelDays = dtMs / (1000 * 60 * 60 * 24);

  // 등록된 여행 날짜와 디데이 불일치 또는 세부 장소와 거리 갯수 불일치 시 오류 반환
  // 오류 메시지를 각각 다르게 정확한 이유로 넘겨야할지, 묶어서 오류 메시지를 넘길지 고민
  if (singleScheduleLength !== travelDays || singleSchedulePlaceCounts.length !== distancesCounts.length) {
    return { status: 400, message: '게시글을 생성하는 중에 문제가 발생했습니다.' };
  }

  try {
    const post = await Post.create(postProps).exec();
    return post;
  } catch (err) {
    throw new Error(err);
  }
}

export async function updatePost(_id, postDate) {
  try {
    const post = await Post.updateOne({ _id }, postDate).exec();

    if (!post) {
      return { status: 400, message: '수정 실패' };
    }

    return { status: 200, message: '수정 성공' };
  } catch (err) {
    throw new Error(err);
  }
}

export async function deletePostById(_id) {
  try {
    const post = await Post.deleteOne({ _id }).exec();

    if (!post) {
      return { status: 400, message: '선택삭제 실패' };
    }

    return { status: 200, message: '선택삭제 성공' };
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteAllPosts(postList) {
  if (!postList) {
    throw new Error('상품 정보가 없습니다.');
  }

  try {
    for (let post of postList) {
      await Post.deleteOne({ _id: post }).exec();
    }
    return;
  } catch (err) {
    throw new Error(err);
  }
}
