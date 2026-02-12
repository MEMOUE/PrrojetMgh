import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailstock } from './detailstock';

describe('Detailstock', () => {
  let component: Detailstock;
  let fixture: ComponentFixture<Detailstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
