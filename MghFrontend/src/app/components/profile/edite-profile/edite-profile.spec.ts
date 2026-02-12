import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditeProfile } from './edite-profile';

describe('EditeProfile', () => {
  let component: EditeProfile;
  let fixture: ComponentFixture<EditeProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditeProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditeProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
