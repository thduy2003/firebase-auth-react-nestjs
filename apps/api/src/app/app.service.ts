import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  getData(): { message: string } {
    this.logger.log('chay vo day')
    console.log('ss')
    return { message: 'Hello API' };
  }
}
