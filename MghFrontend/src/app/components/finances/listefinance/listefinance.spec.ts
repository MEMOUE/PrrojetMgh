import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listefinance } from './listefinance';

describe('Listefinance', () => {
  let component: Listefinance;
  let fixture: ComponentFixture<Listefinance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listefinance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listefinance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
