import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AutService } from './services/auth/aut.service';
import { WsService } from './services/ws/ws.service';

import { ComunicacionService } from './services/comunicacion/comunicacion';

declare var google;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ComunicacionService]
})
export class AppComponent {

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  usuario : any = null;

  principal = "";
  mostrarCarrito = null;

  mostrarBorrar = null;

  productos : Array<any> = null;
  productosFiltrados : Array<any> = null;

  // Obtener posicion del usuario y locales
  cargandoPosicion : boolean = null;
  errorCargandoPosicion : boolean = null;
  direccionUsuario : any = null;
  posicionUsuario : any = null;

  locales : any = null;

  localSeleccionado : any = null;

  directionsService;

  exitoAlCargarPosicion : boolean = null;

  distanciaSeleccionada : any = null;
  duracionSeleccionada : any = null;

  direccionSeleccionada : any = null;

  cargandoPedido : boolean = null;

  constructor(private router: Router, public comunicacionService : ComunicacionService, public ws : WsService, public aut : AutService)
  {
    comunicacionService.producto$.subscribe(producto => {
        //console.log(producto);
        this.CargarAlCarrito(producto);
      });

    if (this.aut.isLogued())
    {
      this.usuario = this.ObtenerUsuario();
      if (this.usuario.tipo == "Cliente")
        this.InicializarDirecciones();
    }
  }

  ngOnInit() {
    if (this.aut.isLogued())
    {
      this.ws.ValidarToken().then((data) => {
        console.log(data);
        if (!data.exito)
        {
          alert(data.mensaje);
          this.Logout();
        }
      })
      .catch((error) => { alert("Error en el servidor, vuelva a iniciar sesion mas tarde..."); this.Logout(); console.log(error); });
    }
  }

  Logout()
  {
    localStorage.setItem('token', null);
    this.mostrarCarrito = null;
    this.principal = "";
    this.router.navigate(['/login']);
  }

  ComprobarPromo(diaPromo)
  {
    var dia : any = this.dias[new Date().getDay()];
    return dia == diaPromo || dia == "Domingo";
  }

  ObtenerUsuario()
  {
    return this.aut.getToken().usuario;
  }

  // Inicializar direccion del pedido
  // 1
  InicializarDirecciones()
  {
    this.directionsService = new google.maps.DirectionsService;
    this.usuario.direccionCompleta = this.usuario.direccion + ", " + this.usuario.localidad + ", " + this.usuario.provincia + ", " + this.usuario.pais;
    this.direccionSeleccionada = this.usuario.direccionCompleta;
    this.ObtenerCordenadasUsuario();
  }

  // 2
  ObtenerCordenadasUsuario()
  {
      this.ws.getlatlng(this.usuario.direccionCompleta).then( data => {
        var cordenadas = data.results[0].geometry.location;
        this.usuario.lat = cordenadas.lat;
        this.usuario.lng = cordenadas.lng;
        let position = new google.maps.LatLng(this.usuario.lat, this.usuario.lng);
        this.usuario.position = position;
        this.ObtenerDireccionUsuario();
      })
      .catch( e => {
        console.log(e);
        this.ObtenerCordenadasUsuario();
      } );
  }

  // 3
  ObtenerDireccionUsuario()
  {
    this.cargandoPosicion = true;

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => 
      {
        this.cargandoPosicion = null;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var latlng = new google.maps.LatLng(lat, lng);
        this.posicionUsuario = new google.maps.LatLng(lat, lng);
        this.ObtenerDireccion(lat, lng);
      }, 
      (error) => { this.AlternativaMarcarUsuario(); console.log(error + ". Reintentando en alernativa... "); }, 
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
    };
  }

  // 3-EXTRA Error de Google
  AlternativaMarcarUsuario()
  {
    this.ws.ObtenerPosicion().then((data) => {

      this.cargandoPosicion = null;
      var lat = data.lat;
      var lng = data.lon;
      this.posicionUsuario = new google.maps.LatLng(lat, lng);
      this.ObtenerDireccion(lat, lng);

    })
    .catch ((error) => { this.ObtenerDireccionUsuario(); console.log(error); } )
  }

  // 4
  ObtenerDireccion(lat, lng)
  {
    this.ws.getDireccion(lat, lng)
    .then((data) => { 
      this.direccionUsuario = data.results[0].formatted_address;
      this.CargarLocales();
    })
    .catch((error) => { this.ObtenerDireccion(lat, lng); console.log(error); });
  }

  // 5
  CargarLocales()
  {
    this.ws.ObtenerLocales().then( data => {
      this.locales = new Array<any>();
      data.forEach(local => {
        local.exitoPosicionGPS = false;
        local.exitoPosicionRegistrada = false;
        this.locales.push(local);
        var direccionCompleta = local.direccion + ", " + local.localidad + ", " + local.provincia + ", " + local.pais;
        this.locales[this.locales.length - 1].direccionCompleta = direccionCompleta;
      });
      this.ObtenerCordenadaLocal(this.locales[0], this.locales[0].direccionCompleta, false); // Lo realizo en el primero nada mas, luego se hara cada vez que se cambie el select.
    })
    .catch( error => {
      this.CargarLocales();
      console.log(error);
    });
  }

  // 6
  ObtenerCordenadaLocal(local, direccion, opcionGPS)
  {
      this.ws.getlatlng(direccion).then( data => {
        var cordenadas = data.results[0].geometry.location;
        local.lat = cordenadas.lat;
        local.lng = cordenadas.lng;
        let position = new google.maps.LatLng(local.lat, local.lng);
        local.position = position;
        if (!opcionGPS)
          this.ObtenerDistanciaYTiempoConLocal(local, 1);
        else
          this.ObtenerDistanciaYTiempoConLocal(local, 2);
      })
      .catch( e => {
        console.log(e);
        this.ObtenerCordenadaLocal(local, direccion, opcionGPS);
      } );
  }

  // 7 FINAL
  ObtenerDistanciaYTiempoConLocal(local, opcion)
  {
    this.directionsService.route({
      origin: local.position,
      destination: (opcion == 1? this.usuario.position : this.posicionUsuario),
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);
        // Hago la distancia y tiempo aqui...
        if (opcion == 1)
        {
          local.exitoPosicionRegistrada = true;
          local.distanciaRegistrada = response.routes[0].legs[0].distance.text;
          local.duracionRegistrada = response.routes[0].legs[0].duration.text;
          this.distanciaSeleccionada = local.distanciaRegistrada;
          this.duracionSeleccionada = local.duracionRegistrada;
        }
        else
        {
          local.exitoPosicionGPS = true;
          local.distanciaGPS = response.routes[0].legs[0].distance.text;
          local.duracionGPS = response.routes[0].legs[0].duration.text;
          this.distanciaSeleccionada = local.distanciaGPS;
          this.duracionSeleccionada = local.duracionGPS;
        }

        this.localSeleccionado = local;
        this.exitoAlCargarPosicion = true;
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  CapturarLogout()
  {
    this.mostrarCarrito = null;
    this.principal = "";
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
    if (this.exitoAlCargarPosicion == null)
    {
      alert("Ocurrio un problema, vuelva a intentar mas tarde...");
      return;
    }

    if (this.cargandoPedido != null)
      return;

    console.log("Recibo en el carrito...");
    if (this.productos == null)
      this.productos = new Array<any>();

    var busqueda = this.RevisarProductosCarrito(producto.idProducto);

    if (busqueda == undefined)
      this.productos.push({idProducto: producto.idProducto, 
                           tipo : producto.tipo, 
                           descripcion : producto.descripcion, 
                           precio : Number(producto.precio), 
                           cantidad : 1, 
                           img : producto.img, 
                           promocion : producto.promocion,
                           locales : producto.locales});
    else
      busqueda.cantidad = busqueda.cantidad == 10? 10 : busqueda.cantidad + 1;

    this.principal = "col-sm-9";
    this.mostrarCarrito = true;

    this.localSeleccionado = this.BuscarLocal(producto.localSeleccionado);
    this.CambiarProductos();
  }

  BuscarLocal(idLocal)
  {
    for (var index = 0; index < this.locales.length; index++) {
      if (this.locales[index].idLocal == idLocal)
        return this.locales[index];
    }
    return false;
  }

  RevisarProductosCarrito(idProducto : number) : any
  {
      var producto = this.productos.find((producto) => { return producto.idProducto == idProducto; });
      return producto;
  }

  RevisarSiExisteEnElLocal(producto)
  {
    var res = false;
    for (var index = 0; index < producto.locales.length; index++) {
      if (producto.locales[index].idLocal == this.localSeleccionado.idLocal)
      {
        res = true;
        break;
      }
    }
    return res;
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

    this.CambiarProductos();

    if (this.productos.length == 0)
      this.productos = null;
  }

  CambiarProductos()
  {
    this.productosFiltrados = new Array<any>();

    this.productos.forEach(producto => {
      if (this.RevisarSiExisteEnElLocal(producto))
        this.productosFiltrados.push(producto);
    });

    console.log(this.localSeleccionado);

    this.ObtenerDistanciaYTiempoActual(this.localSeleccionado);
  }

  CambiarDireccion()
  {
    this.ObtenerDistanciaYTiempoActual(this.localSeleccionado);
  }

  ObtenerDistanciaYTiempoActual(local)
  {
    if (this.direccionSeleccionada == this.usuario.direccionCompleta)
    {
      console.log("La direccion seleccionada es la registrada...");
      if (local.exitoPosicionRegistrada)
      {
        console.log("Ya se calculo...");
        this.distanciaSeleccionada = local.distanciaRegistrada;
        this.duracionSeleccionada = local.duracionRegistrada;
      }
      else
      {
        console.log("No se calculo...");
        this.ObtenerCordenadaLocal(local, local.direccionCompleta, false);
      }
    }
    else
    {
      console.log("La direccion seleccionada es la del GPS...");
      if (local.exitoPosicionGPS)
      {
        console.log("Ya se calculo...");
        this.distanciaSeleccionada = local.distanciaGPS;
        this.duracionSeleccionada = local.duracionGPS;
      }
      else
      {
        console.log("No se calculo...");
        console.log(local.direccionCompleta);
        this.ObtenerCordenadaLocal(local, local.direccionCompleta, true);
      }
    }
  }

  ObtenerCantidadTotal()
  {
    var contador = 0;

    this.productosFiltrados.forEach((producto) => {
      contador += producto.cantidad;
    })

    return contador;
  }

  ObtenerPrecioTotal()
  {
    var precioTotal = 0;

    this.productosFiltrados.forEach((producto) => {
      if (this.ComprobarPromo(producto.promocion))
        precioTotal = precioTotal + Number(producto.precio) * 0.75 * producto.cantidad;
      else
        precioTotal = precioTotal + Number(producto.precio) * producto.cantidad;
    })

    return precioTotal;
  }

  ObtenerIdProductos()
  {
    let ids : Array<{producto : number, cantidad : number}> = new Array<{producto : number, cantidad : number}>();

    this.productosFiltrados.forEach((producto) => { ids.push({producto : producto.idProducto, cantidad : producto.cantidad}); });

    console.log(ids);

    return ids;
  }

  ConfirmarPedido()
  {
    var resultado = confirm("Confirma el pedido actual\n(Precio total: "  + this.ObtenerPrecioTotal() + "$)?");
    if (resultado)
      this.RegistrarPedido();
    else
      console.log("Volver");
  }

  RegistrarPedido()
  {
    this.cargandoPedido = true;

    var pedido = {idCliente : this.usuario.idUsuario,
                              idLocal : this.localSeleccionado.idLocal,
                              estado : "En Proceso",
                              precioTotal : this.ObtenerPrecioTotal(),
                              cantidad : this.ObtenerCantidadTotal(),
                              direccion : this.direccionSeleccionada.split(", ")[0],
                              localidad : this.direccionSeleccionada.split(", ")[1],
                              productos : this.ObtenerIdProductos()};

    console.log(pedido);

    this.ws.RegistrarPedido(pedido).then((data) => {
          console.log(data);
          this.cargandoPedido = null;

          if (data.exito)
          {
            this.mostrarCarrito = null;
            this.principal = "";
            this.productos = null;
            this.productosFiltrados = null;
            alert("Pedido realizado con exito!!!");
            this.router.navigateByUrl("/pedidos");
          }
          else
          {
            if (confirm(data.mensaje + "\nDesea volver a pedirlo?\n(Precio total: "  + this.ObtenerPrecioTotal() + "$)?"))
              this.RegistrarPedido();
          }
      })
      .catch((error) => {

        this.cargandoPedido = null;
        console.log(error); 
        alert("Ocurrio un error inesperado en el servidor, vuelva a intentarlo mas tarde.");
      });
  }
}
