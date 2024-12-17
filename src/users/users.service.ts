import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    const { userId, name, mobileNo, gender, email, country } = createUserDto;

    try {
      const existingUser = await this.userRepository.findOne({
        where: { userId },
      });

      if (existingUser) {
        existingUser.name = name;
        existingUser.mobileNo = mobileNo;
        existingUser.gender = gender;
        existingUser.email = email;
        existingUser.country = country;

        return this.userRepository.save(existingUser);
      }

      const newUser = this.userRepository.create({
        userId,
        name,
        mobileNo,
        gender,
        email,
        country,
      });

      return this.userRepository.save(newUser);
    } catch (error) {
      return this.handleError(error, 'Error creating user');
    }
  }

  async getAllUsers(): Promise<Users[]> {
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
