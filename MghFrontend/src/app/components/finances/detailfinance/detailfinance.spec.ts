import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailfinance } from './detailfinance';

describe('Detailfinance', () => {
  let component: Detailfinance;
  let fixture: ComponentFixture<Detailfinance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailfinance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailfinance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
