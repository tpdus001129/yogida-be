import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as postService from '../services/postService.js';

export async function getPosts(req, res) {
  const filter = req.query;

  let posts = [];

  // 전체 조회
  if (Object.keys(filter).length === 0 || !postId) {
    const allPosts = await postService.getAllPosts();
    posts.push(...allPosts);
  }

  // 여행지로 조회
  if (filter.city) {
    const postsByDestination = await postService.getAllPostsByDestination(filter.city);
    posts.push(...postsByDestination);
  }

  // 태그로 조회
  if (filter.tag) {
    const tags = filter.tag.split(',');
    const postsByTags = await postService.getAllPostsByTags(tags);
    posts.push(...postsByTags);
  }

  if (filter.sort) {
    const sort = filter.sort;

    // 정렬기준(최신순, 오래된순, 찜많은 순) 중복 선택되었는지 검사
    if (sort.split(',').length > 1) {
      throw new CustomError(commonError.TAG_COUNT_ERROR, '정렬 기준 선택지는 하나만 선택 가능합니다.', {
        statusCode: 404,
      });
    }

    const sortedPosts = await postService.getPostsBySort(sort, posts);
    posts = sortedPosts;
  }

  return res.status(200).json({ posts });
}

// 특정 게시글 조회
export async function getPostById(req, res) {
  const postId = req.params.postId;

  if (!postId) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글의 고유 아이디 값이 없습니다.', {
      statusCode: 404,
    });
  }

  const post = await postService.getPostById(postId);

  return res.status(200).json(post);
}

// 특정 사용자의 게시글 조회
export async function getAllPostsByUserId(req, res) {
  const userId = req.userId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '조회하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const posts = await postService.getAllPostsByUserId(userId);

  return res.status(200).json({ posts });
}

// 게시글 추가
export async function createPost(req, res) {
  const userId = req.userId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '추가하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    req.body;

  const result = await postService.createPost(userId, {
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

  if (!result) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '이미 같은 ID로 게시글이 등록되어 있습니다.', {
      statusCode: 404,
    });
  }

  return res.status(201).json({ message: '게시글이 등록되었습니다.' });
}

// 특정 사용자의 게시글 수정
export async function updatePost(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '수정하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!postId) {
    throw new CustomError(
      commonError.POST_UNKNOWN_ERROR,
      '수정하려는 해당 게시글의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    req.body;

  const result = await postService.updatePost(userId, postId, {
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

  if (!result) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json({ message: '게시글이 수정되었습니다.' });
}

// 특정 사용자의 게시글 삭제
export async function deletePost(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '삭제하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!postId) {
    throw new CustomError(
      commonError.POST_UNKNOWN_ERROR,
      '삭제하려는 해당 게시글의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  const result = await postService.deletePost(userId, postId);

  if (!result) {
    throw new CustomError(commonError.POST_DELETE_ERROR, '해당 게시글이 존재하지 않아 삭제할 수 없습니다', {
      statusCode: 404,
    });
  }

  return res.status(204);
}
