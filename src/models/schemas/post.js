import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema(
  {
    // 사용자의 닉네임
    nickName: { type: String, required: true },
    // 사용자의 프로필 주소
    profileImageSrc: { type: String },
    // 게시물 메인 타이틀
    title: { type: String, required: true },
    // 여행 지역명
    travelDestination: { type: String, required: true },
    // 여행 시작 날짜
    travelStartDate: { type: Date, required: true },
    // 여행 마지막 날짜
    travelEndDate: { type: Date, required: true },
    // 게시글 태그들
    tag: { type: [String] },
    // 여행 세부 장소들
    travelPlace: [{ type: Schema.Types.ObjectId, ref: 'TravelPlace', required: true }],
    // 여행 경비
    travelCost: { type: Number, require: true },
    // 게시글 공개 or 비공개 유무
    isPublic: {
      type: Boolean,
      default: false,
    },
    // 찜(즐겨찾기) 수
    postBookMarkCount: { type: Number, default: 0 },
    // 댓글 수
    commentCount: { type: Number, default: 0 },
    // 댓글들
    comment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    // 후기글
    reviewText: { type: String },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model('Post', postSchema);
export default Post;
