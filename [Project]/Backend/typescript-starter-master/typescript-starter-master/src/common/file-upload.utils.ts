// // src/common/file-upload-utils.ts
// import { diskStorage } from 'multer';
// import { extname } from 'path';

// // Function to generate a unique filename for uploaded files
// export const editFileName = (req: any, file: Express.Multer.File, callback: Function) => {
//   const fileName = file.originalname.split('.')[0];
//   const fileExtName = extname(file.originalname);
//   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//   callback(null, `${fileName}-${uniqueSuffix}${fileExtName}`);
// };

// // Multer storage configuration
// export const multerOptions = {
//   storage: diskStorage({
//     destination: './uploads',
//     filename: editFileName,
//   }),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB file size limit
//   },
//   fileFilter: (req: any, file: Express.Multer.File, callback: Function) => {
//     const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
//     if (allowedMimes.includes(file.mimetype)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Invalid file type'), false);
//     }
//   },
// };
