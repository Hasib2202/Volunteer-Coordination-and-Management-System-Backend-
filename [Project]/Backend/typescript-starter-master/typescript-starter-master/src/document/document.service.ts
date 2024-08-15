// src/document/document.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  // Define your methods for document handling
  async uploadDocument(file: Express.Multer.File, eventId: number): Promise<DocumentEntity> {
    const document = this.documentRepository.create({
      filename: file.filename,
      path: file.path,
      event: { id: eventId },
    });
    return this.documentRepository.save(document);
  }
}
