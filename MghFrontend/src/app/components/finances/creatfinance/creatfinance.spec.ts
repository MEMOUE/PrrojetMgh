import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creatfinance } from './creatfinance';

describe('Creatfinance', () => {
  let component: Creatfinance;
  let fixture: ComponentFixture<Creatfinance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creatfinance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Creatfinance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
