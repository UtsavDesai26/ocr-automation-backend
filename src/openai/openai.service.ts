import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async extractTextFromImage(imageUrl: string): Promise<string> {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(imageUrl, 'eng');

      return text;
    } catch (error) {
      console.error('Error with Tesseract OCR:', error);
      throw new Error('Failed to extract text from the image');
    }
  }

  async extractDataFromImage(imageUrl: string, prompt: string): Promise<any> {
    console.log('Prompt:', prompt);
    try {
      // Step 1: Extract text from the image
      const extractedText = await this.extractTextFromImage(imageUrl);

      if (!extractedText) {
        throw new Error('No text found in the image');
      }

      // Step 2: Analyze the extracted text using OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Extracted text from the image: "${extractedText}"`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const responseInJson = JSON.parse(response.choices[0]?.message?.content);
      return responseInJson;
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      throw new Error('Failed to process image with OpenAI');
    }
  }
}
