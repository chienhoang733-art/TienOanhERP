import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HrmModule } from './hrm/hrm.module';

@Module({
  imports: [HrmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
