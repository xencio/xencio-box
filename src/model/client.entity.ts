import { Exclude } from 'class-transformer';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('site_config')
export class SiteConfiguration {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '访问编号' })
  @Index({ unique: true })
  clientId: string;

  @Column({ comment: '访问名称' })
  name: string;

  @Exclude({ toPlainOnly: true })
  @Column({ comment: '静态token', nullable: true })
  @Index({ unique: true })
  staticToken: string;

  @Exclude({ toPlainOnly: true })
  @Column({ comment: '访问公钥', nullable: true })
  publicKey: string;

  @Column({ comment: '访问公钥过期时限，单位分钟', nullable: true })
  publicOverdue: number;

  @Exclude({ toPlainOnly: true })
  @Column({ comment: '转账公钥', nullable: true })
  transferPublicKey: string;

  @Column({ comment: '转账公钥过期时限，单位分钟', nullable: true })
  transferOverdue: number;

  @Exclude({ toPlainOnly: true })
  @Column({ comment: '白名单组', nullable: true, type: 'simple-json' })
  @Index()
  whitelist: string[];
}
