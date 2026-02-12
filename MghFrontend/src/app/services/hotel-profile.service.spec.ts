import { TestBed } from '@angular/core/testing';

import { HotelProfileService } from './hotel-profile.service';

describe('HotelProfileService', () => {
  let service: HotelProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
