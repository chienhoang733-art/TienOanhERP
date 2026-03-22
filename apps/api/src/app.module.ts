import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HrmModule } from './hrm/hrm.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';

@Module({
  imports: [PrismaModule, AuthModule, HrmModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT auth globally - use @Public() to exempt routes
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Apply permissions check globally - use @RequirePermissions() on routes
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
