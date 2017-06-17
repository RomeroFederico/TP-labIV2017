import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  pedidoActual : {productos : Array<any>, idLocal : any, distancia : any, tiempo : any} = null;

  pedido : {local : any, productos : Array<any>, precio : number} = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router, private actRoute: ActivatedRoute)
  {
    
  }

  ngOnInit()
  {
    this.actRoute.queryParams
      .subscribe(params => {
        console.log(params);
        if (params["Local"] && params["Productos"])
        {
          this.pedidoActual = {productos : null, idLocal : null, distancia : null, tiempo : null};
          this.pedidoActual.productos = params["Productos"];
          this.pedidoActual.idLocal = params["Local"];

          if (params["Tiempo"] && params["Distancia"])
          {
            this.pedidoActual.distancia = params["Distancia"];
            this.pedidoActual.tiempo = params["Tiempo"];
          }

          this.TraerDetallePedidoActual();
        }
    });
  }

  ComprobarPromo(diaPromo)
  {
    var dia : any = this.dias[new Date().getDay()]
    return dia == diaPromo || dia == "Domingo";
  }

  TraerDetallePedidoActual()
  {   
    this.ws.ObtenerListaProductosYLocal(this.pedidoActual).then((data) => {
      
      console.log(data);
      this.pedido = {productos : data.productos, local : data.local, precio : this.CalcularPedido(data.productos)};

    })
    .catch((error) => { console.log(error); });
  }

  CalcularPedido(productos)
  {
    var total : number = 0;

    productos.forEach(producto => {
      if (this.ComprobarPromo(producto.promocion))
        total = total + producto.precio * 0.75;
      else
        total = total + producto.precio;
    });

    return total;
  }

}
