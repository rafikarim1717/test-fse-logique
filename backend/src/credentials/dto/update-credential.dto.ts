import { PartialType } from '@nestjs/mapped-types';
import { CreateCredentialDto } from './create-credential.dto.js';

export class UpdateCredentialDto extends PartialType(CreateCredentialDto) {}