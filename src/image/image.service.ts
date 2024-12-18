import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/images.entity';
import { UploadImageDto } from './dto/uploadImage.dto';
import { gcsConfig } from '../config/config';
import { SchemaService } from 'src/schema/schema.service';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly storage: Storage;
  private readonly bucketName = gcsConfig.bucketName;

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly openaiService: OpenAIService,
    private readonly schemaService: SchemaService,
  ) {
    this.storage = new Storage({
      projectId: gcsConfig.projectId,
      keyFilename: gcsConfig.keyFilename,
    });
  }

  async uploadImage(
    dto: UploadImageDto,
  ): Promise<{ schemaName: string; result: Record<string, any> }> {
    const { userId, schemaName, imageUrl } = dto;
    console.log('dto', dto);

    try {
      const fields = await this.getSchemaFields(schemaName);
      const dynamicPrompt = this.generateDynamicPrompt(fields);

      const analysisResult = await this.analyzeImage(imageUrl, dynamicPrompt);

      if (Object.keys(analysisResult).length === 0) {
        throw new BadRequestException('No data extracted from the image');
      }

      const fileData = await this.downloadImage(imageUrl);
      const gcsUrl = await this.uploadToGCS(
        fileData.buffer,
        fileData.contentType,
        userId,
      );

      await this.saveImageRecord(userId, schemaName, gcsUrl, analysisResult);
      await this.insertDataIntoSchema(schemaName, userId, analysisResult);

      return { schemaName, result: analysisResult };
    } catch (error) {
      this.logger.error(
        `Error during image upload: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        error.message || 'Failed to process the image',
      );
    }
  }

  private async downloadImage(
    imageUrl: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const contentType = response.headers['content-type'];

      if (!contentType.startsWith('image/')) {
        throw new BadRequestException('Provided URL is not an image');
      }

      return { buffer: Buffer.from(response.data), contentType };
    } catch (error) {
      this.logger.error(
        `Failed to download image from URL: ${imageUrl}`,
        error.stack,
      );
      throw new BadRequestException(
        'Invalid image URL or inaccessible resource',
      );
    }
  }

  private async uploadToGCS(
    buffer: Buffer,
    contentType: string,
    userId: string,
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}-${userId}-image.jpg`;
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);

      await file.save(buffer, { contentType });

      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error('Failed to upload image to GCS', error.stack);
      throw new InternalServerErrorException('Image upload failed');
    }
  }

  private async analyzeImage(
    imageUrl: string,
    prompt: string,
  ): Promise<Record<string, any>> {
    try {
      return await this.openaiService.extractDataFromImage(imageUrl, prompt);
    } catch (error) {
      console.log('error', error);
      this.logger.error(
        'Failed to analyze the image using OpenAI',
        error.stack,
      );
      throw new InternalServerErrorException('Image analysis failed');
    }
  }

  private async saveImageRecord(
    userId: string,
    schemaName: string,
    imageUrl: string,
    analysisResult: Record<string, any>,
  ): Promise<void> {
    try {
      await this.imageRepository.save({
        userId,
        schemaName,
        imageUrl,
        analysisResult,
      });
    } catch (error) {
      this.logger.error(
        'Failed to save image record to the database',
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save image record');
    }
  }

  private async insertDataIntoSchema(
    schemaName: string,
    userId: string,
    analysisResult: Record<string, any>,
  ): Promise<void> {
    try {
      if (!analysisResult) {
        throw new BadRequestException(
          `No data extracted for schema: ${schemaName}`,
        );
      }

      await this.schemaService.insertDataIntoTable(
        schemaName,
        userId,
        analysisResult,
      );
    } catch (error) {
      this.logger.error('Failed to insert data into schema', error.stack);
      throw new InternalServerErrorException(
        `Error storing data in schema: ${schemaName}`,
      );
    }
  }

  private async getSchemaFields(schemaName: string): Promise<string[]> {
    try {
      return await this.schemaService.getFields(schemaName);
    } catch (error) {
      this.logger.error(
        `Failed to fetch fields for schema: ${schemaName}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch schema fields');
    }
  }

  private generateDynamicPrompt(fields: string[]): string {
    const prompt = `Goal:\nEfficiently extract structured data from images with service details using OCR technology, ensuring accurate recognition and clear distinction of ambiguous values.\n\nInstruction:\nExtract the following fields from the given image. The image contains details about services. For each field listed below, attempt to identify and extract the value from the image. If a field cannot be found or determined, explicitly mark it as Not Found. Provide the output in a json format for each field. The fields to extract are:\n\n${fields
      .map((field) => `${field}`)
      .join(
        '\n',
      )}\n\nUse OCR techniques to capture text from the image. Ensure values are extracted accurately, accounting for any variations in text orientation or quality. If any value is ambiguous or unclear, indicate it as Not Found. Return only the JSON structure matching the fields specified, without any additional explanation or notes.`;

    return prompt;
  }
}
