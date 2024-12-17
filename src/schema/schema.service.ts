import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schema } from './entities/schema.entity';
import { CreateSchemaDto } from './dto/create-schema.dto';

@Injectable()
export class SchemaService {
  constructor(
    @InjectRepository(Schema)
    private readonly schemaRepository: Repository<Schema>,
  ) {}

  /**
   * Creates a new schema and corresponding table in the database.
   */
  async createSchema(dto: CreateSchemaDto): Promise<Schema> {
    try {
      await this.ensureSchemaDoesNotExist(dto.name);

      await this.createDatabaseTable(dto.name, dto.fields);
      const newSchema = this.schemaRepository.create(dto);
      await this.schemaRepository.save(newSchema);

      return newSchema;
    } catch (error) {
      this.handleError(error, 'Failed to create schema');
    }
  }

  /**
   * Retrieves all schemas.
   */
  async findAllSchemas(): Promise<Schema[]> {
    try {
      return await this.schemaRepository.find();
    } catch (error) {
      this.handleError(error, 'Failed to retrieve schemas');
    }
  }

  /**
   * Retrieves a specific schema by name.
   */
  async findSchemaByName(name: string): Promise<Schema> {
    try {
      const schema = await this.schemaRepository.findOne({ where: { name } });
      if (!schema) {
        throw new NotFoundException(`Schema with name '${name}' not found.`);
      }
      return schema;
    } catch (error) {
      this.handleError(error, `Failed to find schema with name '${name}'`);
    }
  }

  /**
   * Deletes a schema and its associated table.
   */
  async removeSchema(name: string): Promise<{ message: string }> {
    try {
      const schema = await this.findSchemaByName(name);
      await this.schemaRepository.remove(schema);
      await this.schemaRepository.query(`DROP TABLE IF EXISTS "${name}"`);

      return { message: 'Schema removed successfully' };
    } catch (error) {
      this.handleError(error, `Failed to remove schema '${name}'`);
    }
  }

  /**
   * Inserts data into a dynamic table based on the schema.
   */
  async insertDataIntoTable(
    tableName: string,
    userId: string,
    analysisResult: Record<string, any>,
  ): Promise<{ message: string }> {
    try {
      const schema = await this.findSchemaByName(tableName);

      const columns = schema.fields.map((field) => `"${field.name}"`);
      const values = schema.fields.map((field) => analysisResult[field.name]);

      await this.schemaRepository.query(
        `
        INSERT INTO "${tableName}" ("userid", ${columns.join(', ')})
        VALUES ($1, ${columns.map((_, i) => `$${i + 2}`).join(', ')})
      `,
        [userId, ...values],
      );

      return { message: 'Data inserted successfully' };
    } catch (error) {
      this.handleError(
        error,
        `Failed to insert data into table '${tableName}'`,
      );
    }
  }

  /**
   * Retrieves data from a dynamic table with optional filtering by userId.
   */
  async getDataFromTable(
    tableName: string,
    query: { userId?: string },
  ): Promise<any[]> {
    try {
      await this.findSchemaByName(tableName);

      const whereClause = query.userId ? `WHERE userId = $1` : '';
      const params = query.userId ? [query.userId] : [];

      return await this.schemaRepository.query(
        `SELECT * FROM "${tableName}" ${whereClause}`,
        params,
      );
    } catch (error) {
      this.handleError(
        error,
        `Failed to retrieve data from table '${tableName}'`,
      );
    }
  }

  /**
   * Retrieves data from a table filtered by userId.
   */
  async getDataFromTableByUserId(
    tableName: string,
    userId: string,
  ): Promise<any[]> {
    try {
      return await this.getDataFromTable(tableName, { userId });
    } catch (error) {
      this.handleError(error, `Failed to retrieve data for user '${userId}'`);
    }
  }

  /**
   * Helper to ensure a schema does not already exist.
   */
  private async ensureSchemaDoesNotExist(name: string): Promise<void> {
    try {
      const existingSchema = await this.schemaRepository.findOne({
        where: { name },
      });
      if (existingSchema) {
        throw new BadRequestException(
          `Schema with name '${name}' already exists.`,
        );
      }
    } catch (error) {
      this.handleError(error, 'Failed to check schema existence');
    }
  }

  /**
   * Creates a new database table based on the provided fields.
   */
  private async createDatabaseTable(
    tableName: string,
    fields: { name: string; type: string }[],
  ): Promise<void> {
    try {
      const columnsDefinition = fields
        .map(({ name, type }) => `"${name}" ${type}`)
        .join(', ');

      const query = `
        CREATE TABLE IF NOT EXISTS "${tableName}" (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          userId VARCHAR(255) NOT NULL,
          ${columnsDefinition}
        );
      `;

      await this.schemaRepository.query(query);
    } catch (error) {
      this.handleError(error, `Failed to create table '${tableName}'`);
    }
  }

  /**
   * Retrieves a list of fields for a given schema.
   */
  async getFields(schemaName: string): Promise<string[]> {
    try {
      const schema = await this.findSchemaByName(schemaName);
      return schema.fields.map((field) => field.name);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving fields for schema: ${schemaName}`,
        error.message,
      );
    }
  }

  /**
   * Centralized error handler for logging and re-throwing meaningful exceptions.
   */
  private handleError(error: any, contextMessage: string): never {
    console.error(`${contextMessage}:`, error);

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException(
      `${contextMessage}. Please try again later.`,
    );
  }
}
