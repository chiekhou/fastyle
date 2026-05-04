'use strict';
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Fonction factory pour créer un uploader selon le dossier
const createUploader = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `beauty-app/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Seules les images sont acceptées.'), false);
      }
    },
  });
};

// Uploaders par entité
const uploadServiceImage = createUploader('services').single('image');
const uploadProductImage = createUploader('products').single('image');
const uploadProductImages = createUploader('products').array('images', 5);

module.exports = { uploadServiceImage, uploadProductImage, uploadProductImages };
