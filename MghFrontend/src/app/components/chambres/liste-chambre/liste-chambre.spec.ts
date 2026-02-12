import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeChambre } from './liste-chambre';

describe('ListeChambre', () => {
  let component: ListeChambre;
  let fixture: ComponentFixture<ListeChambre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeChambre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeChambre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
