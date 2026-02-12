import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listeemploye } from './listeemploye';

describe('Listeemploye', () => {
  let component: Listeemploye;
  let fixture: ComponentFixture<Listeemploye>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listeemploye]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listeemploye);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
