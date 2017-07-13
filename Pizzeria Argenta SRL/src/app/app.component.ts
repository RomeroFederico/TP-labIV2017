import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
// import { AutService } from '../../services/auth/aut.service';

import { ComunicacionService } from './services/comunicacion/comunicacion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ComunicacionService]
})
export class AppComponent {
  principal = "";
  mostrarCarrito = null;

  mostrarBorrar = null;

  productos : Array<any> = null;

  constructor(private router: Router, public comunicacionService : ComunicacionService)
  {
    comunicacionService.producto$.subscribe(producto => {
        //console.log(producto);
        this.CargarAlCarrito(producto);
      });
  }

  ngOnInit() {
  }

  CapturarEventoMostrarCarrito()
  {
    if (this.mostrarCarrito != null)
    {
      this.mostrarCarrito = null;
      this.principal = "";
    }
    else
    {
      this.principal = "col-sm-9";
      this.mostrarCarrito = true;
    }
  }

  CargarAlCarrito(producto : any)
  {
    console.log("Recibo en el carrito...");
    if (this.productos == null)
      this.productos = new Array<any>();

    var busqueda = this.RevisarProductosCarrito(producto.idProducto);

    console.log(busqueda);

    if (busqueda == undefined)
      this.productos.push({idProducto: producto.idProducto, tipo : producto.tipo, descripcion : producto.descripcion, precio : producto.precio, cantidad : 1, img : producto.img});
    else
      busqueda.cantidad = busqueda.cantidad == 10? 10 : busqueda.cantidad + 1;
  }

  RevisarProductosCarrito(idProducto : number) : any
  {
      var producto = this.productos.find((producto) => { return producto.idProducto == idProducto; });
      return producto;
  }

  IncrementarCantidad(producto : any)
  {
    producto.cantidad = producto.cantidad == 10? 10 : producto.cantidad + 1;
  }

  DecrementarCantidad(producto : any)
  {
    producto.cantidad = producto.cantidad == 1? 1 : producto.cantidad - 1;
  }

  QuitarProducto(producto : any)
  {
    console.log(producto);
    this.productos = this.productos.filter((p) => { console.log(p); console.log(p.idProducto != producto.idProducto); return p.idProducto != producto.idProducto; });
  }
}
