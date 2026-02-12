import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creatrservation } from './creatrservation';

describe('Creatrservation', () => {
  let component: Creatrservation;
  let fixture: ComponentFixture<Creatrservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creatrservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Creatrservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
