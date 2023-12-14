import { Schema } from 'mongoose';

const travelPlaceSchema = new Schema({
  // 해당 게시글의 ObjectId
  postId: { type: Schema.Types.ObjectId, ref: 'Post', require: true },
  // 여행 데이 (첫째날, 둘째날...)
  travelDay: { type: Number, require: true },
  // 장소
  placeName: { type: String, require: true },
  // 이미지
  placeImageSrc: { type: String, require: true },
  // 별점
  starScore: { type: Number, require: true },
  // 카테고리
  category: { type: String, require: true },
  // 거리 ( 맞는지 모름 수정 필요함)
  distance: { type: Number, require: true },
});

export default travelPlaceSchema;
