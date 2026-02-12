import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listestock } from './listestock';

describe('Listestock', () => {
  let component: Listestock;
  let fixture: ComponentFixture<Listestock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listestock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listestock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
