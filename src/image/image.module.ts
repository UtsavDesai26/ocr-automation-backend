import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { Image } from './entities/images.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaModule } from 'src/schema/schema.module';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), OpenAIModule, SchemaModule],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
