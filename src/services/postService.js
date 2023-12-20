import { Post } from '../models/schemas/Post.js';

// 모든 게시글 조회
export async function getAllPosts() {
  try {
    return await Post.find({});
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 게시글 조회
export async function getPostByPostId(postId) {
  try {
    const post = await Post.findOne({ postId });

    if (!post || post.length === 0) {
      throw new Error('게시글이 없습니다.');
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

// 게시글 추가
export async function createPost(
  userId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  // 여행일정과 관련된 변수 설정
  const singleScheduleLength = schedules.length;

  // 세부 장소와 거리에 관련된 변수 설정
  const singleSchedulePlaceCounts = schedules.map((location) => location.length - 1);
  const distancesCounts = distances.map((distance) => distance.length);

  // 여행일정 수 계산 (5월 30일 ~ 6월 2일이여도 계산 가능)
  const dtMs = endDate.getTime() - startDate.getTime();
  console.log(dtMs);
  const travelDays = dtMs / (1000 * 60 * 60 * 24);

  // 등록된 여행 날짜와 디데이 불일치 또는 세부 장소와 거리 갯수 불일치 시 오류 반환
  // 오류 메시지를 각각 다르게 정확한 이유로 넘겨야할지, 묶어서 오류 메시지를 넘길지 고민
  if (singleScheduleLength !== travelDays) {
    throw new Error('등록된 여행 날짜와 여행 일정 수가 일치하지 않습니다.');
  }

  if (singleSchedulePlaceCounts.length !== distancesCounts.length) {
    throw new Error('등록된 여행 장소 갯수와 거리 갯수가 일치하지 않습니다.');
  }

  try {
    await Post.create(userId, {
      title,
      destination,
      startDate,
      endDate,
      tag,
      schedules,
      distances,
      cost,
      peopleCount,
      isPublic,
      reviewText,
    });
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 사용자의 게시글 수정 (해당 사용자가 수정하는게 맞는지 확인 필수)
export async function updatePost(
  userId,
  postId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  const post = await Post.findById(postId).populate('authorId').lean();

  if (!post) {
    throw new Error('해당 게시글을 찾을 수 없습니다.');
  }

  // 작성자와 수정하려는 사용자가 일치한지
  if (post.authorId !== userId) {
    throw new Error('게시글을 수정할 권한이 없습니다.');
  }

  try {
    const updatedPost = await Post.updateOne(postId, {
      title,
      destination,
      startDate,
      endDate,
      tag,
      schedules,
      distances,
      cost,
      peopleCount,
      isPublic,
      reviewText,
    });

    if (updatedPost.modifiedCount === 0) {
      throw new Error('게시글 수정을 실패하였습니다.');
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 사용자의 게시글 삭제
export async function deletePost(userId, postId) {
  const post = await Post.findById(postId).populate('authorId').lean();

  if (!post) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  if (post.authorId !== userId) {
    throw new Error('게시글을 삭제할 권한이 없습니다.');
  }

  try {
    const deletedPost = await Post.deleteOne(postId);

    if (!deletedPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }
  } catch (err) {
    throw new Error(err.message);
  }
}
