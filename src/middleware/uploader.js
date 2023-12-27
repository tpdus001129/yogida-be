// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'src/images/');
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     // const ext = path.extname(file.originalname); // 파일의 확장자
//     cb(null, file.originalname);
//   },
// });

// const limits = {
//   fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
//   filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
//   fields: 2, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
//   fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
//   files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
// };

// const upload = multer({ storage: storage, limits });

// export default upload;
