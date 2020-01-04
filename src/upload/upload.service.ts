import { ConsulConfig, InjectConfig } from '@nestcloud/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { createHash } from 'crypto';
import { extname } from 'path';
import * as sharp from 'sharp';

function randomSHA1Hash() {
  return createHash('sha1')
    .update(Date.now() + '' + Math.random())
    .digest('hex');
}

@Injectable()
export class UploadService {
  private s3: S3;

  constructor(
    @InjectConfig() private config: ConsulConfig,
  ) {
    config.watch('aws', data => {
      this.s3 = new S3(data);
    });
  }

  async saveFile(file) {
    if (!file) {
      throw new BadRequestException("File is missing!");
    }

    const uploadStream = this.s3.upload({
      Bucket: this.config.get('aws.bucket'),
      Key: randomSHA1Hash() + extname(file.originalname).toLowerCase(),
      ACL: 'public-read',
      Body: await sharp(file.buffer)
        .resize(512, 512, { withoutEnlargement: true })
        .toBuffer()
    });

    const response = await uploadStream.promise();

    return { imageUrl: response.Location }

  }
}
