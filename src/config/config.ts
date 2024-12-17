import * as path from 'path';

export const gcsConfig = {
  projectId: 'zaver-app-production',
  keyFilename: path.join(process.cwd(), 'src/config/key.json'),
  bucketName: 'gonsave-ocr',
};

export const visionConfig = {
  projectId: 'zaver-app-production',
  keyFilename: path.join(process.cwd(), 'src/config/key.json'),
};
