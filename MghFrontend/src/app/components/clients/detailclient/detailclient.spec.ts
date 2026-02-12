import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailclient } from './detailclient';

describe('Detailclient', () => {
  let component: Detailclient;
  let fixture: ComponentFixture<Detailclient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailclient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailclient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
