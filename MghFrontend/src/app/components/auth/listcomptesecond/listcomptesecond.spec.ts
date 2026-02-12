import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listcomptesecond } from './listcomptesecond';

describe('Listcomptesecond', () => {
  let component: Listcomptesecond;
  let fixture: ComponentFixture<Listcomptesecond>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listcomptesecond]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listcomptesecond);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
