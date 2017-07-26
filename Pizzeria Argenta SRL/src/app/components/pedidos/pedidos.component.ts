import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

declare var google;

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  seleccion : string = "";

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  errorPedidoActual : boolean = null;

  pedidoActual : {productos : Array<any>, idLocal : any, distancia : any, tiempo : any, direccion : any, localidad : any} = null;

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

  cargando : boolean = null;

  cargandoVerificacion : boolean = null;
  cliente : any = null;
  email : string = "";

  errorVerificado : boolean = null;
  noExiste : boolean = null;
  vacioEmail : boolean = null;

  exitoVerificacion : boolean = null;

  directionsService;

  datosExitosos : boolean = null;

  localDelUsuario : any = null;
  errorUsuarioSinLocal : boolean = null;
  errorCargarLocalDelUsuario : boolean = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router, private actRoute: ActivatedRoute)
  {
    if (this.Comprobar() && this.ObtenerUsuario().tipo == 'Cliente')
      this.Mostrar("En Proceso");
    else if (this.Comprobar() && (this.ObtenerUsuario().tipo == 'Empleado' || this.ObtenerUsuario().tipo == 'Encargado'))
      this.Mostrar("Actual");
  }

  ngOnInit()
  {
    this.actRoute.queryParams
      .subscribe(params => {
        console.log(params);
        if (params["Local"] && params["Productos"])
        {
          this.pedidoActual = {productos : null, idLocal : null, distancia : null, tiempo : null, direccion : '---', localidad : '---'};
          this.pedidoActual.productos = params["Productos"];
          this.pedidoActual.idLocal = params["Local"];

          if (params["Tiempo"] && params["Distancia"])
          {
            this.pedidoActual.distancia = params["Distancia"];
            this.pedidoActual.tiempo = params["Tiempo"];
          }

          if (params["Direccion"] && params["Localidad"])
          {
            this.pedidoActual.direccion = params["Direccion"];
            this.pedidoActual.localidad = params["Localidad"];
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

  VerificarEmailUsuario(email)
  {
    this.cargandoVerificacion = true;
    this.exitoVerificacion = null;
    this.errorVerificado = null;
    this.noExiste = null;
    this.vacioEmail = null;

    if (this.email.length == 0)
    {
      this.cargandoVerificacion = null;
      this.vacioEmail = true;
      return;
    }

    this.ws.ObtenerClientePorEmail(email).then((data) => {

      this.cargandoVerificacion = null;

      if (data.exito)
      {
        this.cliente = data.cliente;
        this.cliente.direccionCompleta = this.cliente.direccion + ", " + this.cliente.localidad + ", " + this.cliente.provincia + ", " + this.cliente.pais;
        this.exitoVerificacion = true;

        this.ObtenerCordenadasUsuario();
      }
      else
        this.noExiste = true;
    })
    .catch((error) => { this.cargandoVerificacion = null; this.errorVerificado = true; console.log(error)})
  }

  // 2
  ObtenerCordenadasUsuario()
  {
      this.ws.getlatlng(this.cliente.direccionCompleta).then( data => {
        var cordenadas = data.results[0].geometry.location;
        this.cliente.lat = cordenadas.lat;
        this.cliente.lng = cordenadas.lng;
        let position = new google.maps.LatLng(this.cliente.lat, this.cliente.lng);
        this.cliente.position = position;

        this.pedido.local.direccionCompleta = this.pedido.local.direccion + ", " + this.pedido.local.localidad + ", " + this.pedido.local.provincia + ", " + this.pedido.local.pais;
        this.ObtenerCordenadaLocal(this.pedido.local.direccionCompleta, this.pedido.local);
      })
      .catch( e => {
        console.log(e);
        this.ObtenerCordenadasUsuario();
      } );
  }

  ObtenerCordenadaLocal(direccion, local)
  {
      this.ws.getlatlng(direccion).then( data => {
        var cordenadas = data.results[0].geometry.location;
        local.lat = cordenadas.lat;
        local.lng = cordenadas.lng;
        let position = new google.maps.LatLng(local.lat, local.lng);
        local.position = position;
        this.ObtenerDistanciaYTiempoConLocal(local, 2);
      })
      .catch( e => {
        console.log(e);
        this.ObtenerCordenadaLocal(local, direccion);
      } );
  }

  ObtenerDistanciaYTiempoConLocal(local, opcion)
  {
    this.directionsService = new google.maps.DirectionsService;

    this.directionsService.route({
      origin: local.position,
      destination: this.cliente.position,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);
        // Hago la distancia y tiempo aqui...

        this.pedidoActual.direccion = this.cliente.direccion;
        this.pedidoActual.localidad = this.cliente.localidad;

        this.pedidoActual.distancia = response.routes[0].legs[0].distance.text;
        this.pedidoActual.tiempo = response.routes[0].legs[0].duration.text;

        this.datosExitosos = true;

        alert("Cliente y datos de envio verificados!!!");

      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
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

      this.pedido.productos.forEach((producto) => {
        producto.cantidad = 1;
      })

    })
    .catch((error) => { this.errorPedidoActual = true; console.log(error); });
  }

  ReintentarTraerDetallesPedidoActual()
  {
    this.errorPedidoActual = null;
    this.TraerDetallePedidoActual();
  }

  IncrementarCantidad(producto)
  {
    if (producto.cantidad < 10)
    {
      producto.cantidad++;
      this.VolverACalcular();
    }
  }

  DecrementarCantidad(producto)
  {
    if (producto.cantidad > 1)
    {
      producto.cantidad--;
      this.VolverACalcular();
    }
  }

  ObtenerCantidadTotal()
  {
    var contador = 0;

    this.pedido.productos.forEach((producto) => {
      contador += producto.cantidad;
    })

    return contador;
  }

  VolverACalcular()
  {
    var precioTotal = 0;

    this.pedido.productos.forEach((producto) => {
      if (this.ComprobarPromo(producto.promocion))
        precioTotal = precioTotal + Number(producto.precio) * 0.75 * producto.cantidad;
      else
        precioTotal = precioTotal + Number(producto.precio) * producto.cantidad;
    })

    this.pedido.precio = precioTotal;
  }

  CalcularPedido(productos)
  {
    var total : number = 0;

    productos.forEach(producto => {
      if (this.ComprobarPromo(producto.promocion))
        total = total + Number(producto.precio) * 0.75;
      else
        total = total + Number(producto.precio);
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
      this.router.navigate(["/locales"], { queryParams: { Productos: this.pedidoActual.productos, idLocal : this.pedido.local.idLocal }});
    }
  }

  ConfirmarPedido()
  {
    if (this.cliente == null)
    {
      alert("Ingrese un cliente valido!!!");
      return;
    }
    else if (this.datosExitosos == null)
    {
      alert("Aun no se comprobo los datos de envio, espere un momento...");
      return;
    }

    var resultado = confirm("Confirma el pedido actual\n(Precio total: "  + this.pedido.precio + "$)?");
    if (resultado)
      this.RegistrarPedido();
    else
      console.log("Volver");
  }

  RegistrarPedido()
  {
    this.cargando = true;
    this.ws.RegistrarPedido({idCliente : this.cliente.idUsuario,
                             idLocal : this.pedido.local.idLocal,
                             estado : "En Proceso",
                             precioTotal : this.pedido.precio,
                             cantidad : this.ObtenerCantidadTotal(),
                             direccion : this.pedidoActual.direccion,
                             localidad : this.pedidoActual.localidad,
                             productos : this.ObtenerIdProductos()}).then((data) => {
        console.log(data);
        this.cargando = null;

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

      this.cargando = null;
      console.log(error); 
      alert("Ocurrio un error inesperado en el servidor, vuelva a intentarlo mas tarde.");
    });
  }

  CargarLocalDelUsuario(tipo)
  {
    this.errorUsuarioSinLocal = null;

    this.ws.ObtenerLocalDelUsuario(this.ObtenerUsuario()).then((data) => {

      console.log(data);

      if (data.local == false)
      {
        console.log("No hay local para mostrar...");
        if (tipo == "En Proceso")
          this.cargandoPedidosEnProceso = null;
        else if (tipo == "Recibidos")
          this.cargandoPedidosRecibidos = null;
        this.errorUsuarioSinLocal = true;
      }
      else
      {
        console.log("Se encontro un local...");
        this.localDelUsuario = data.local;
        this.CargarPedidosDelLocal(this.localDelUsuario.idLocal, tipo);
      }
    })
    .catch((error) => { this.ReintentarCargarLocalDelUsuario(tipo);  console.log(error)} );
  }

  ReintentarCargarLocalDelUsuario(tipo)
  {
    this.errorCargarLocalDelUsuario = null;
    this.CargarLocalDelUsuario(tipo);
  }

  CargarPedidosDelLocal(idLocal, tipo)
  {
    this.ws.TraerPedidosDelLocal({idLocal : 1, tipo : tipo}).then((data) => {

      console.log(data);

      if (tipo == "En Proceso")
      {
        this.cargandoPedidosEnProceso = null;
        this.pedidoEnProceso = new Array<any>();

        if (data.exito)
        {
          this.pedidoEnProceso = data.pedidos;

          this.pedidoEnProceso.forEach(pedido => {

            pedido.cliente = {nombre : pedido.nombre, apellido : pedido.apellido, img : pedido.imgUsuario, telefono : pedido.telefonoUsuario, email : pedido.email};
            
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

            pedido.cliente = {nombre : pedido.nombre, apellido : pedido.apellido, img : pedido.imgUsuario, telefono : pedido.telefonoUsuario, email : pedido.email};
            
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

  CargarPedidos(tipo)
  {
    if (tipo == "En Proceso")
      this.cargandoPedidosEnProceso = true;
    else if (tipo == "Recibidos")
      this.cargandoPedidosRecibidos = true;

    if (this.Comprobar() && this.ObtenerUsuario().tipo == 'Cliente')
    {
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
  
  else if (this.Comprobar() && (this.ObtenerUsuario().tipo == 'Empleado' || this.ObtenerUsuario().tipo == 'Encargado'))
  {
    this.CargarLocalDelUsuario(tipo);
  }
  }

  ReintentarCargarPedidosEnProceso()
  {
    this.errorPedidosEnProceso = null;
    this.CargarPedidos(this.seleccion);
  }

  ReintentarCargarPedidosRecibidos()
  {
    this.errorPedidosRecibidos = null;
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

  Comprobar()
  {
    return this.autService.isLogued();
  }

  ObtenerUsuario()
  {
    return this.autService.getToken().usuario;
  }

  ObtenerIdProductos()
  {
    let ids : Array<{producto : number, cantidad : number}> = new Array<{producto : number, cantidad : number}>();

    this.pedido.productos.forEach((producto) => { ids.push({producto : producto.idProducto, cantidad : producto.cantidad}); });

    console.log(ids);

    return ids;
  }

}
