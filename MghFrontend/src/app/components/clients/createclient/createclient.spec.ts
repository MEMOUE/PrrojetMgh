import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createclient } from './createclient';

describe('Createclient', () => {
  let component: Createclient;
  let fixture: ComponentFixture<Createclient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createclient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createclient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
