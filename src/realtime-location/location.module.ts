import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LocationGateway } from './location.gateway';
import { LocationService } from './location.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    })
  ],
  providers: [LocationGateway, LocationService],
  exports: [LocationGateway, LocationService]
})
export class LocationModule {}
