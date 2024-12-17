import { IsString, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldDto {
  @IsString()
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Field name must be a valid identifier',
  })
  name: string;

  @IsString()
  type: string;
}

export class CreateSchemaDto {
  @IsString()
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Schema name must be a valid identifier',
  })
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}
