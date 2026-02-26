import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockHistorique } from './stock-historique';

describe('StockHistorique', () => {
  let component: StockHistorique;
  let fixture: ComponentFixture<StockHistorique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockHistorique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockHistorique);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
