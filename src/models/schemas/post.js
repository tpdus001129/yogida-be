import { Schema } from 'mongoose';

const TravelTypeTag = [
  '체험·액티비티',
  'SNS 핫플레이스',
  '자연적인',
  '유명 관광지',
  '힐링',
  '문화·예술·역사',
  '맛집 탐방',
];

const TravelMateTag = ['혼자', '친구와', '연인과', '아이와', '부모님과', '반려견과', '기타'];

const AgeGroup = [10, 20, 30, 40, 50, 60, 70];

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
    tag: {
      travelTypeTag: { type: String, enum: TravelTypeTag },
      travelMateTag: { type: String, enum: TravelMateTag },
      ageGroup: { type: Number, enum: AgeGroup },
    },
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

export default postSchema;
