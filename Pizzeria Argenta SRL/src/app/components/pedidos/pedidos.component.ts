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

  seleccion : string = "Actual";

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  pedidoActual : {productos : Array<any>, idLocal : any, distancia : any, tiempo : any} = null;

  pedido : {local : any, productos : Array<any>, precio : number} = null;

  pedidoExitoso : boolean = null;

  pedidoExitosoTiempo : any = null;

  cargandoPedidosEnProceso : boolean= null;
  errorPedidosEnProceso : boolean = null;
  pedidoEnProceso : Array<any> = new Array<any>();

  cargandoEnvioRecibido : boolean = null;

  cargandoPedidosRecibidos : boolean = null;
  errorPedidosRecibidos : boolean = null;
  pedidosRecibidos : Array<any> = new Array<any>();

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

  Mostrar(seleccion : string)
  {
    if (seleccion != this.seleccion)
    {
      this.seleccion = seleccion;

      if (this.seleccion == 'En Proceso' || this.seleccion == 'Recibidos')
        this.CargarPedidos(seleccion);
    }
  }

  ComprobarPromo(diaPromo)
  {
    var dia : any = this.dias[new Date().getDay()]
    return dia == diaPromo || dia == "Domingo";
  }

  ComprobarPromoPasada(diaPromo, fechaPedido)
  {
    var fecha = new Date(fechaPedido);

    var dia : any = this.dias[fecha.getDay()]
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

  CancelarPedido()
  {
    if (confirm("Estas seguro de cancelar el pedido actual?"))
    {
      this.pedido = null;
      this.pedidoActual = null;
    }
  }

  ModificarPedido()
  {
    if (confirm("Estas seguro de querer modificar el pedido actual?"))
    {
      this.router.navigate(["/locales"], { queryParams: { Productos: this.ObtenerIdProductos(), idLocal : this.pedido.local.idLocal }});
    }
  }

  ConfirmarPedido()
  {
    var resultado = confirm("Confirma el pedido actual\n(Precio total: "  + this.pedido.precio + "$)?");
    if (resultado)
      this.RegistrarPedido();
    else
      console.log("Volver");
  }

  RegistrarPedido()
  {
    this.ws.RegistrarPedido({idCliente : this.ObtenerUsuario().idUsuario,
                             idLocal : this.pedido.local.idLocal,
                             estado : "En Proceso",
                             precioTotal : this.pedido.precio,
                             cantidad : this.pedido.productos.length,
                             productos : this.ObtenerIdProductos()}).then((data) => {
        console.log(data);

        if (data.exito)
        {
          this.pedidoExitosoTiempo = this.pedidoActual.tiempo;
          this.pedidoExitoso = true;
          this.pedidoActual = null;
          this.pedido = null;
          window.history.pushState('', '', '/pedidos');
        }
        else
        {
          if (confirm(data.mensaje + "\nDesea volver a pedirlo?\n(Precio total: "  + this.pedido.precio + "$)?"))
            this.RegistrarPedido();
        }
    })
    .catch((error) => { 
      console.log(error); 

      alert("Ocurrio un error inesperado en el servidor, vuelva a intentarlo mas tarde.");
    });
  }

  CargarPedidos(tipo)
  {
    if (tipo == "En Proceso")
      this.cargandoPedidosEnProceso = true;
    else if (tipo == "Recibidos")
      this.cargandoPedidosRecibidos = true;
    this.ws.TraerPedidos({idCliente : this.ObtenerUsuario().idUsuario, tipo : tipo}).then((data) => {

      console.log(data);

      if (tipo == "En Proceso")
      {
        this.cargandoPedidosEnProceso = null;
        this.pedidoEnProceso = new Array<any>();

        if (data.exito)
        {
          this.pedidoEnProceso = data.pedidos;

          this.pedidoEnProceso.forEach(pedido => {
            
            data.detalles.forEach(producto => {
              if (pedido.idPedido == producto.idPedido)
              {
                if (pedido.productos == undefined)
                  pedido.productos = new Array<any>();
                pedido.productos.push(producto);
              }
            });

          });

        }
      }
      else if (tipo == "Recibidos")
      {
        this.cargandoPedidosRecibidos = null;
        this.pedidosRecibidos = new Array<any>();

        if (data.exito)
        {
          this.pedidosRecibidos = data.pedidos;

          this.pedidosRecibidos.forEach(pedido => {
            
            data.detalles.forEach(producto => {
              if (pedido.idPedido == producto.idPedido)
              {
                if (pedido.productos == undefined)
                  pedido.productos = new Array<any>();
                pedido.productos.push(producto);
              }
            });

          });

        }
      }
    })
    .catch((error) => {
      if (tipo == "En Proceso")
      {
        this.cargandoPedidosEnProceso = null;
        this.errorPedidosEnProceso = true;
      }
      else if (tipo == "Recibidos")
      {
        this.cargandoPedidosRecibidos = null;
        this.errorPedidosRecibidos = true;
      }
      console.log(error); 
    });
  }

  ReintentarCargarPedidosEnProceso()
  {
    this.errorPedidosEnProceso = null;
    this.CargarPedidos(this.seleccion);
  }

  TerminarPedido(pedido)
  {
    if (confirm("Desea marcar como recibido el pedido?"))
    {
      this.cargandoEnvioRecibido = true;

      this.ws.TerminarPedido({idPedido : pedido.idPedido}).then((data) => {

        this.cargandoEnvioRecibido = null;
        console.log(data);

        if (data.exito)
        {
          this.pedidoEnProceso = this.pedidoEnProceso.filter((pedidoEnProceso) => { return pedidoEnProceso.idPedido != pedido.idPedido; })
          if (confirm("Pedido entregado!!!\n¿Desea realizar la encuesta de satisfaccion (anonima)?"))
            this.router.navigateByUrl("encuesta");
        }
        else
          alert(data.mensaje);
      })
      .catch((error) => { this.cargandoEnvioRecibido = null; alert("Ocurrio un problema en el servidor"); console.log(error);});
    }
  }

  ObtenerUsuario()
  {
    return this.autService.getToken().usuario;
  }

  ObtenerIdProductos()
  {
    let ids : Array<number> = new Array<number>();

    this.pedido.productos.forEach((producto) => { ids.push(producto.idProducto); });

    return ids;
  }

}
