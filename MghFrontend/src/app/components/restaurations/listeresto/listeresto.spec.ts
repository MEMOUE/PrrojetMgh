import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listeresto } from './listeresto';

describe('Listeresto', () => {
  let component: Listeresto;
  let fixture: ComponentFixture<Listeresto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listeresto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listeresto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
