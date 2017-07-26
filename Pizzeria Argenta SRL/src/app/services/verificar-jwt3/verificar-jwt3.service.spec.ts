import { TestBed, inject } from '@angular/core/testing';

import { VerificarJWT3Service } from './verificar-jwt3.service';

describe('VerificarJWT3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VerificarJWT3Service]
    });
  });

  it('should ...', inject([VerificarJWT3Service], (service: VerificarJWT3Service) => {
    expect(service).toBeTruthy();
  }));
});
