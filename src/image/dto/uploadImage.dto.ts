import { IsNotEmpty, IsString, IsUUID, IsUrl } from 'class-validator';

export class UploadImageDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  schemaName: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}
