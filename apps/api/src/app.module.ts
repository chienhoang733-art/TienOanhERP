import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HrmModule } from './hrm/hrm.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HrmModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
