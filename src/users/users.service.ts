import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private mapDtoToEntity(createUserDto: CreateUserDto): User {
    const {
      requestId,
      responsePath,
      triggeredAt,
      botId,
      botConnectionId,
      botName,
      botPlatform,
      botLanguage,
      currentLanguage,
      channelId,
      userId,
      userHandle,
      userName,
      userFirstName,
      userLastName,
      userGender,
      userLocale,
      userEmail,
      userPhone,
      userCountry,
      userTimezone,
      userCompany,
      userExternalId,
      userFirstActive,
      userLastActive,
      datetimeReceived,
      message,
      messageType,
      attributes,
      command,
      metadata,
    } = createUserDto;

    return {
      requestId,
      responsePath,
      triggeredAt,
      botId,
      botConnectionId,
      botName,
      botPlatform,
      botLanguage,
      currentLanguage,
      channelId,
      userId,
      userHandle,
      userName,
      userFirstName,
      userLastName,
      userGender,
      userLocale,
      userEmail,
      userPhone,
      userCountry,
      userTimezone,
      userCompany,
      userExternalId,
      userFirstActive,
      userLastActive,
      datetimeReceived,
      message,
      messageType,
      attributes,
      command,
      metadata,
    } as User;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.mapDtoToEntity(createUserDto);

    try {
      // Check if the user already exists
      const existingUser = await this.userRepository.findOne({
        where: { userId: user.userId },
      });

      if (existingUser) {
        // Update existing user
        Object.assign(existingUser, user);
        return this.userRepository.save(existingUser);
      }

      // Create new user
      const newUser = this.userRepository.create(user);
      return this.userRepository.save(newUser);
    } catch (error) {
      return this.handleError(error, 'Error creating user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      return this.handleError(error, 'Error fetching users');
    }
  }

  private handleError(error: any, contextMessage: string): never {
    console.error(`${contextMessage}:`, error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `${contextMessage}. Please try again later.`,
    );
  }
}
