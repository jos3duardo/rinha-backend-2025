import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryColumn({ type: 'uuid', name: 'correlation_id', unique: true })
  correlationId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', name: 'payment_processor', nullable: true })
  paymentProcessor: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
