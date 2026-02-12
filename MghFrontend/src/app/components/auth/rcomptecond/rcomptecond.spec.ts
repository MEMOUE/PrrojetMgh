import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rcomptecond } from './rcomptecond';

describe('Rcomptecond', () => {
  let component: Rcomptecond;
  let fixture: ComponentFixture<Rcomptecond>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rcomptecond]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rcomptecond);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
