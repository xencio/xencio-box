import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { SiteConfiguration } from '@model/client.entity';

@Entity('bank_connection_option')
export class BankConnectionOption {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '银行标记' })
  @Index()
  bank: string;

  @Column({ comment: '配置信息', type: 'simple-json' })
  options: Record<string, any>;

  @ManyToOne(() => SiteConfiguration)
  client: SiteConfiguration;
}

@Entity('bank_connection_log')
export class BankConnectionLog {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '银行标记' })
  @Index()
  bank: string;

  @Index()
  @Column({ comment: '跟踪标识' })
  traceId: string;

  @Column({ nullable: true, comment: '参数内容' })
  parameter: string;

  @Index()
  @Column({ comment: '访问URL' })
  url: string;

  @Column({ nullable: true, comment: '响应内容' })
  content: string;

  @Index()
  @Column({ comment: '响应时间(毫秒)' })
  responseTime: number;

  @Exclude({ toPlainOnly: true })
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
