import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {}

  @Post('extract-data')
  async extractData(@Body() body: { imageUrl: string; prompt: string }) {
    const { imageUrl, prompt } = body;
    return await this.openAIService.extractDataFromImage(imageUrl, prompt);
  }
}
