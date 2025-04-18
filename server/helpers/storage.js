const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

const uploadFileToStorage = (buffer, mimeType, filename) => {
  return new Promise((resolve, reject) => {
    const file = bucket.file(`voice-messages/${Date.now()}-${filename}`);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
      public: true,
    });
    
    stream.on('error', reject);
    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      resolve(publicUrl);
    });
    
    stream.end(buffer);
  });
};

module.exports = { uploadFileToStorage };