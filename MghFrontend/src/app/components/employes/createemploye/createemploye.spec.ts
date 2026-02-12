import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createemploye } from './createemploye';

describe('Createemploye', () => {
  let component: Createemploye;
  let fixture: ComponentFixture<Createemploye>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createemploye]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createemploye);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
