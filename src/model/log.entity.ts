import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export const ACCESS_LOG_TABLE = 'access_log';

@Entity(ACCESS_LOG_TABLE)
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

export const VENDOR_LOG_TABLE = 'vendor_log';

@Entity(VENDOR_LOG_TABLE)
export class VendorLog {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true, comment: '参数内容' })
  parameter: string;

  @Index()
  @Column({ comment: '访问URL' })
  url: string;

  @Index()
  @Column({ comment: '响应结果' })
  status: number;

  @Column({ nullable: true, comment: '响应内容' })
  content: string;

  @Index()
  @Column({ comment: '响应时间(毫秒)' })
  responseTime: number;

  @Exclude({ toPlainOnly: true })
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
