import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listeclient } from './listeclient';

describe('Listeclient', () => {
  let component: Listeclient;
  let fixture: ComponentFixture<Listeclient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listeclient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listeclient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
