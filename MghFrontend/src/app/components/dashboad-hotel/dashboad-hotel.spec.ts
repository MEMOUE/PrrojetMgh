import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboadHotel } from './dashboad-hotel';

describe('DashboadHotel', () => {
  let component: DashboadHotel;
  let fixture: ComponentFixture<DashboadHotel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboadHotel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboadHotel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
