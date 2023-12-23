const commonError = Object.seal({
  DB_ERROR: 'DB Error',
  UNKNOWN_ERROR: 'Unknown Error',
  USER_MATCH_ERROR: 'User Match Error',

  POST_UNKNOWN_ERROR: 'Post Unknown Error',
  POST_TYPE_ERROR: 'Post Type Error',
  POST_MODIFY_ERROR: 'Post Modify Error',
  POST_DELETE_ERROR: 'Post Delete Error',

  TAG_UNKNOWN_ERROR: 'Tag Unknown Error',
  SEARCHED_CITY_UNKNOWN_ERROR: 'Searched City Unknown Error',

  SCHEDULE_MATCH_ERROR: 'Schedule Match Error',
  SCHEDULE_EXIST_ERROR: 'Schedule Exist Error',

  BOOKMARK_UNKNOWN_ERROR: 'Bookmark Unknown Error',
  BOOKMARK_TYPE_ERROR: 'Bookmark Type Error',
  BOOKMARK_DELETE_ERROR: 'Bookmark Delete Error',

  COMMENT_UNKNOWN_ERROR: 'Comment Unknown Error',
  COMMENT_MODIFY_ERROR: 'Comment Modify Error',
  COMMENT_DELETE_ERROR: 'Comment Delete Error',

  LIKE_UNKNOWN_ERROR: 'Like Unknown Error',
  LIKE_DELETE_ERROR: 'Like Delete Error',
  LIKE_CONFLICT: 'Like Conflict',

  VALIDATION_ERROR: 'Validation Error',

  AUTHENTICATION_ERROR: 'Authentication Error',

  KAKAO_API_ERROR: 'Kakao API Error',
});

export default commonError;
