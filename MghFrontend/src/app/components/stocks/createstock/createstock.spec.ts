import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createstock } from './createstock';

describe('Createstock', () => {
  let component: Createstock;
  let fixture: ComponentFixture<Createstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
