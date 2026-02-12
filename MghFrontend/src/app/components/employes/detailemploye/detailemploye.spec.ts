import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailemploye } from './detailemploye';

describe('Detailemploye', () => {
  let component: Detailemploye;
  let fixture: ComponentFixture<Detailemploye>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailemploye]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailemploye);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
