import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { SchemaService } from './schema.service';
import { CreateSchemaDto } from './dto/create-schema.dto';

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post()
  async create(@Body() createSchemaDto: CreateSchemaDto) {
    return this.schemaService.createSchema(createSchemaDto);
  }

  @Get()
  async findAll() {
    return this.schemaService.findAllSchemas();
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    return this.schemaService.findSchemaByName(name);
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    return this.schemaService.removeSchema(name);
  }

  @Post(':tableName/data')
  async insertData(@Param('tableName') tableName: string, @Body() data: any) {
    const { userId, analysisResult } = data;
    if (!userId) {
      throw new Error('userId is required');
    }

    return this.schemaService.insertDataIntoTable(
      tableName,
      userId,
      analysisResult,
    );
  }

  @Get(':tableName/data')
  async getData(@Param('tableName') tableName: string, @Query() query: any) {
    return this.schemaService.getDataFromTable(tableName, query);
  }

  @Get(':tableName/data/:userId')
  async getDataByUserId(
    @Param('tableName') tableName: string,
    @Param('userId') userId: string,
  ) {
    return this.schemaService.getDataFromTableByUserId(tableName, userId);
  }
}
