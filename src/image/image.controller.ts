import { Controller, Post, Body } from '@nestjs/common';
import { ImageService } from './image.service';
import { UploadImageDto } from './dto/uploadImage.dto';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  async uploadImage(@Body() uploadImageDto: UploadImageDto) {
    return this.imageService.uploadImage(uploadImageDto);
  }
}
