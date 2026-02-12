import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createresto } from './createresto';

describe('Createresto', () => {
  let component: Createresto;
  let fixture: ComponentFixture<Createresto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createresto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createresto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
