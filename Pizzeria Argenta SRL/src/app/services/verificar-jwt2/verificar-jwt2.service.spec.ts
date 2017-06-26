import { TestBed, inject } from '@angular/core/testing';

import { VerificarJWT2Service } from './verificar-jwt2.service';

describe('VerificarJWT2Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VerificarJWT2Service]
    });
  });

  it('should ...', inject([VerificarJWT2Service], (service: VerificarJWT2Service) => {
    expect(service).toBeTruthy();
  }));
});
