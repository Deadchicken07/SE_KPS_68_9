import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ค้นหาจังหวัด
  @Get('provinces')
  searchProvinces(@Query('q') q?: string) {
    return this.locationService.searchProvinces(q);
  }

  // ค้นหาอำเภอ (ต้องมี provinceId เพื่อไม่ให้ค้นทั้งประเทศ)
  @Get('districts')
  searchDistricts(
    @Query('provinceId', ParseIntPipe) provinceId: number,
    @Query('q') q?: string,
  ) {
    return this.locationService.searchDistricts(provinceId, q);
  }

  // ค้นหาตำบล
  @Get('sub-districts')
  searchSubDistricts(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('q') q?: string,
  ) {
    return this.locationService.searchSubDistricts(districtId, q);
  }
}
