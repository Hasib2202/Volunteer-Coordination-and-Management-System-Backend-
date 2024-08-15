import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [DocumentService],
  exports: [DocumentService, TypeOrmModule],
})
export class DocumentModule {}
