import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailChambre } from './detail-chambre';

describe('DetailChambre', () => {
  let component: DetailChambre;
  let fixture: ComponentFixture<DetailChambre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailChambre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailChambre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
