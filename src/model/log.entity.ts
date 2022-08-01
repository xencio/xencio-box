import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('access_log')
export class AccessLog {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ip来源' })
  source: string;

  @Index()
  @Column({ nullable: true, comment: '参数内容' })
  parameter: string;

  @Index()
  @Column({ comment: '访问URL' })
  url: string;

  @Column('simple-json', { nullable: true, comment: '错误响应的内容' })
  errorContent: { [key: string]: any };

  @Index()
  @Column({ nullable: true, comment: '错误响应的代码' })
  errorCode: string;

  @Index()
  @Column({ comment: '响应状态码' })
  status: number;

  @Index()
  @Column({ comment: '响应时间(毫秒)' })
  responseTime: number;

  @Exclude({ toPlainOnly: true })
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
