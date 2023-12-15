import Post from '../models/schemas/post.js';

export async function getAllPosts() {
  try {
    const posts = await Post.find({}).exec();

    return posts;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getPostById(_id) {
  try {
    return await Post.findOne({ _id }).exec();
  } catch (err) {
    throw new Error(err);
  }
}

export async function createPost(postProps) {
  // 입력된 게시글 내용이 없는 경우 에러 처리
  if (!postProps) {
    return { status: 400, message: '게시글 내용이 없습니다.' };
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
    const data = await Post.updateOne({ _id }, postDate).exec();

    if (!data) {
      return { status: 200, message: '수정 실패' };
    }
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
    throw new Error('삭제 할 수 없습니다.');
  }
}

export async function deletePostById(_id) {
  try {
    return await Post.deleteOne({ _id });
  } catch (err) {
    throw new Error('삭제 할 수 없습니다.');
  }
}
