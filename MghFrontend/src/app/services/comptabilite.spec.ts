import { TestBed } from '@angular/core/testing';

import { Comptabilite } from './comptabilite';

describe('Comptabilite', () => {
  let service: Comptabilite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Comptabilite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
