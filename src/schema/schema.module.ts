import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaService } from './schema.service';
import { SchemaController } from './schema.controller';
import { Schema } from './entities/schema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schema])],
  controllers: [SchemaController],
  providers: [SchemaService],
  exports: [SchemaService],
})
export class SchemaModule {}
