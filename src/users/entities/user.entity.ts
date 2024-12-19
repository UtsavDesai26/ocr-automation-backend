import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'response_path', type: 'varchar', length: 255 })
  responsePath: string;

  @Column({ name: 'request_id', type: 'varchar', length: 100 })
  requestId: string;

  @Column({ name: 'triggered_at', type: 'timestamp' })
  triggeredAt: Date;

  @Column({ name: 'bot_id', type: 'varchar', length: 100 })
  botId: string;

  @Column({ name: 'bot_connection_id', type: 'varchar', length: 100 })
  botConnectionId: string;

  @Column({ name: 'bot_name', type: 'varchar', length: 100 })
  botName: string;

  @Column({ name: 'bot_platform', type: 'varchar', length: 50 })
  botPlatform: string;

  @Column({ name: 'bot_language', type: 'varchar', length: 50 })
  botLanguage: string;

  @Column({ name: 'current_language', type: 'varchar', length: 50 })
  currentLanguage: string;

  @Column({ name: 'channel_id', type: 'varchar', length: 100 })
  channelId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100 })
  userId: string;

  @Column({ name: 'user_handle', type: 'varchar', length: 100, nullable: true })
  userHandle: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  @Column({ name: 'user_first_name', type: 'varchar', length: 50 })
  userFirstName: string;

  @Column({ name: 'user_last_name', type: 'varchar', length: 50 })
  userLastName: string;

  @Column({ name: 'user_gender', type: 'varchar', length: 10, nullable: true })
  userGender: string;

  @Column({ name: 'user_locale', type: 'varchar', length: 20 })
  userLocale: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ name: 'user_phone', type: 'varchar', length: 20, nullable: true })
  userPhone: string;

  @Column({ name: 'user_country', type: 'varchar', length: 50 })
  userCountry: string;

  @Column({ name: 'user_timezone', type: 'varchar', length: 50 })
  userTimezone: string;

  @Column({
    name: 'user_company',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userCompany: string;

  @Column({
    name: 'user_external_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userExternalId: string;

  @Column({ name: 'user_first_active', type: 'timestamp', nullable: true })
  userFirstActive: Date;

  @Column({ name: 'user_last_active', type: 'timestamp', nullable: true })
  userLastActive: Date;

  @Column({ name: 'datetime_received', type: 'timestamp' })
  datetimeReceived: Date;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'message_type', type: 'varchar', length: 50 })
  messageType: string;

  @Column({ name: 'attributes', type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ name: 'command', type: 'varchar', length: 100, nullable: true })
  command: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
