import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listrservation } from './listrservation';

describe('Listrservation', () => {
  let component: Listrservation;
  let fixture: ComponentFixture<Listrservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listrservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listrservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
