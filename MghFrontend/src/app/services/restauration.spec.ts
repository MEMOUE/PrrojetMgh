import { TestBed } from '@angular/core/testing';

import { Restauration } from './restauration';

describe('Restauration', () => {
  let service: Restauration;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Restauration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
