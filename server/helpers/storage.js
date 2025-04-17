const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(process.env.STORAGE_BUCKET);

async function uploadFileToStorage(buffer, mimeType, filename) {
  const file = bucket.file(`voice-messages/${Date.now()}-${filename}`);
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
    public: true,
  });
  
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}

module.exports = { uploadFileToStorage };