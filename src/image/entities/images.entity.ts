import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  schemaName: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  analysisResult: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
