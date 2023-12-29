import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as postService from '../services/postService.js';

export async function getPosts(req, res) {
  const filter = req.query;
  console.log(filter);

  // 전체 조회
  if (Object.keys(req.query).length === 0) {
    const allPosts = await postService.getAllPosts();
    return res.status(200).json({ posts: allPosts });
  }
  //정렬 기준 ('latest', 'oldest', 'likeCount')
  // 장소와 태그, 정렬 조회
  if (filter.city || filter.tag || filter.sort) {
    let tags;
    if (filter.tag) {
      tags = filter.tag.split(',');
    }
    const posts = await postService.findPostsByDestinationAndTag(filter.city, tags, filter.sort);
    return res.status(200).json({ posts });
  }
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

  const body = JSON.parse(req.body.payload);

  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    body;

  let newSchedules = schedules.map((schedule) => schedule);

  req.files.forEach((file) => {
    // '1-1'을 [1, 1] 형태로 변환합니다.
    const indices = file.originalname.split('-').map((num) => parseInt(num, 10) - 1);
    const scheduleRow = newSchedules[indices[0]];

    if (scheduleRow && scheduleRow[indices[1]]) {
      // schedules의 해당 인덱스에 있는 객체의 placeImageSrc에 file.path를 할당합니다.
      scheduleRow[indices[1]].placeImageSrc = `/images/${file.filename}`;
    }
  });

  await postService.createPost(userId, {
    title,
    destination,
    startDate,
    endDate,
    tag,
    schedules: newSchedules,
    distances,
    cost: parseInt(cost),
    peopleCount: parseInt(peopleCount),
    isPublic,
    reviewText,
  });

  return res.status(201).json({ message: '게시글이 등록되었습니다.' });
}

// 특정 사용자의 게시글 수정
export async function updatePost(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;

  // if (!userId) {
  //   throw new CustomError(commonError.USER_UNKNOWN_ERROR, '수정하려는 특정 사용자를 찾을 수 없습니다.', {
  //     statusCode: 404,
  //   });
  // }

  // if (!postId) {
  //   throw new CustomError(
  //     commonError.POST_UNKNOWN_ERROR,
  //     '수정하려는 해당 게시글의 고유 아이디값을 찾을 수 없습니다.',
  //     {
  //       statusCode: 404,
  //     },
  //   );
  // }

  const body = JSON.parse(req.body.payload);

  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    body;

  let newSchedules = schedules.map((schedule) => schedule);

  req.files.forEach((file) => {
    // '1-1'을 [1, 1] 형태로 변환합니다.
    const indices = file.originalname.split('-').map((num) => parseInt(num, 10) - 1);
    const scheduleRow = newSchedules[indices[0]];

    if (scheduleRow && scheduleRow[indices[1]]) {
      // schedules의 해당 인덱스에 있는 객체의 placeImageSrc에 file.path를 할당합니다.
      scheduleRow[indices[1]].placeImageSrc = `/images/${file.filename}`;
    }
  });

  const result = await postService.updatePost(userId, postId, {
    title,
    destination,
    startDate,
    endDate,
    tag,
    schedules: newSchedules,
    distances,
    cost: parseInt(cost),
    peopleCount: parseInt(peopleCount),
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

  return res.status(204).json('삭제되었습니다.');
}
