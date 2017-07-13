import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
 
@Injectable()
export class ComunicacionService {
 
  // Observable string sources
  private origenDeProducto = new Subject<any>();
 
  // Observable string streams 
  producto$ = this.origenDeProducto.asObservable();
 
  EnviarAlCarrito(producto: any) {
    this.origenDeProducto.next(producto);
  }
}