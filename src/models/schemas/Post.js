import mongoose, { Schema } from 'mongoose';

const singleSchedule = new Schema({
  // 장소
  placeName: { type: String, required: true },
  // 이미지
  placeImageSrc: { type: String, required: true },
  // 별점
  star: { type: Number, required: true },
  // 카테고리
  category: { type: String, required: true },
  //위도경도
  placePosition: [{ type: Number, required: true }],
});

const postSchema = new Schema(
  {
    // 작성자 아이디
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 게시물 메인 타이틀
    title: { type: String, required: true },
    // 여행 지역명
    destination: { type: String, required: true },
    // 여행 시작 날짜
    startDate: { type: Date, required: true },
    // 여행 마지막 날짜
    endDate: { type: Date, required: true },
    // 게시글 태그들
    tag: { type: [String] },
    // 여행 세부 장소들
    schedules: { type: [[singleSchedule]], required: true },
    // 세부 장소들 사이 거리
    distances: { type: [[Number]], required: true },
    // 여행 경비
    cost: { type: Number, required: true },
    // 여행 인원수
    peopleCount: { type: Number, required: true },
    // 게시글 공개 or 비공개 유무
    isPublic: {
      type: Boolean,
      default: true,
    },
    // 후기글
    reviewText: { type: String },
  },
  {
    timestamps: true,
  },
);

export const SingleSchedule = mongoose.model('SingleSchedule', singleSchedule);
const Post = mongoose.model('Post', postSchema);

export default Post;
