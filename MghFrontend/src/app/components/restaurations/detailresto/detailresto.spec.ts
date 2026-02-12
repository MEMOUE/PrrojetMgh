import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailresto } from './detailresto';

describe('Detailresto', () => {
  let component: Detailresto;
  let fixture: ComponentFixture<Detailresto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailresto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailresto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
