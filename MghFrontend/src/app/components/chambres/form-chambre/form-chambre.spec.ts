import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormChambre } from './form-chambre';

describe('FormChambre', () => {
  let component: FormChambre;
  let fixture: ComponentFixture<FormChambre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormChambre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormChambre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
