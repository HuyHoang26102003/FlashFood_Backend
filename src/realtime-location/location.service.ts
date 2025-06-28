// location.service.ts
import { Injectable } from '@nestjs/common';
import { AVERAGE_SPEED_KM_H } from 'src/utils/constants';

@Injectable()
export class LocationService {
  calculateDriverETA(
    driverLocation: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    averageSpeedKmH: number = AVERAGE_SPEED_KM_H
  ): number {
    const distance = this.calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      destination.lat,
      destination.lng
    );
    return (distance / averageSpeedKmH) * 60; // ETA (phút)
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách (km)
  }
}
