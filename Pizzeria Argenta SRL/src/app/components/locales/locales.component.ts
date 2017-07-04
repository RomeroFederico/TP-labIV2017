import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

declare var google;

export class Local
{
  constructor (public idLocal : number = 1,
               public idUsuario : number = 1,
               public img1 : string = "default.png",
               public img2 : string = "default.png",
               public img3 : string = "default.png",
               public direccionCompleta : string = "",
               public direccion : string = "",
               public localidad : string = "",
               public provincia : string = "",
               public pais : string = "",
               public capacidad : number = 1,
               public telefono : string = "",
               public lat : number = 0,
               public lng : number = 0,
               public marcador : any = null,
               public gerente : Gerente = null,
               public productos : Array<Producto> = null)
  {

  }
}

export class Gerente
{
  constructor (public idUsuario : number = 0,
               public nombre : string = "", 
               public apellido : string = "",
               public sexo : string = "", 
               public email : string = "", 
               public telefonoUsuario : string = "",
               public direccionUsuario : string = "", 
               public localidadUsuario : string = "", 
               public provinciaUsuario : string = "", 
               public paisUsuario : string = "", 
               public usuarioImg : string = "")
  {

  }
}

export class Producto
{
  constructor(public idProducto : number = 0,
              public descripcion: string = "Grande de Muzzarella",
              public promocion : string = "",
              public tipo : string = "Pizza",
              public precio : number = 0,
              public img : string = "default.jpg")
  {
      
  }
}

@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.css']
})
export class LocalesComponent implements OnInit {

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  num = 1;
  num2 = 1;
  item1 = "item";
  item2 = "item";
  item3 = "item";

  active1 = "";
  active2 = "";
  active3 = "";

  locales : Array<Local>;
  local : Local = null;

  marcadorUsuario : any = null;
  locacionUsuario : string = null;
  direccionUsuario : string = null;
  localidadUsuario : string  = null;

  distancia : string = null;
  duracion : string = null;

  directionsService;
  directionsDisplay;

  mostrarErrorGeoposicon : Boolean = null;
  mostrarCargando : Boolean = true;

  seleccionProducto : Array<number> = new Array<number>();
  seleccionLocal : number = 0;

  @ViewChild('map') mapElement: ElementRef;

  map: any;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router, private actRoute: ActivatedRoute)
  {
    this.CargarLocales();
  }

  ngOnInit()
  {
    //this.ObtenerCordenadas();
    this.slider();
    this.CargarMapa();
    this.MarcarUsuario();

    this.actRoute.queryParams
      .subscribe(params => {
        console.log(params);
        if (params["idLocal"] && params["Productos"])
        {
          this.seleccionLocal = params["idLocal"];
          params["Productos"].forEach(producto => {
            this.seleccionProducto[producto] = producto;
          });
        }
        else if (params["idLocal"] && params["idProducto"])
        {
          this.seleccionProducto[params["idProducto"]] = params["idProducto"];
          this.seleccionLocal = params["idLocal"];
        }
      });
  }

  /**
  * Cargo el mapa y lo muestro. Tambien inicio los servicios para dibujar la ruta.
  */
  CargarMapa()
  {
    let latLng = new google.maps.LatLng(-34.6623101, -58.36470509999999);
 
    let mapOptions = {
      center: latLng,
      zoom: 11,
      minZoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.map
    })
  }

  /**
  * Marco la posicion del usuario. Si ya se cargo un local, muestro su ruta.
  */
  MarcarUsuario()
  {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => 
      {
        this.mostrarCargando = null;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var latlng = new google.maps.LatLng(lat, lng);
        this.marcadorUsuario = new google.maps.Marker({position: latlng, animation: google.maps.Animation.DROP, icon : "assets/ico/pinUser.ico" , title: "Usuario"});
        this.marcadorUsuario.setMap(this.map);
        this.ObtenerDireccion();

        if (this.local != null)
          this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);
      }, 
      (error) => { this.AlternativaMarcarUsuario(); console.log(error + ". Reintentando en alernativa... "); }, 
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
    };
  }

  // Error de Google
  AlternativaMarcarUsuario()
  {
    this.ws.ObtenerPosicion().then((data) => {

      this.mostrarCargando = null;
      var lat = data.lat;
      var lng = data.lon;
      var latlng = new google.maps.LatLng(lat, lng);
      this.marcadorUsuario = new google.maps.Marker({position: latlng, animation: google.maps.Animation.DROP, icon : "assets/ico/pinUser.ico" , title: "Usuario"});
      this.marcadorUsuario.setMap(this.map);
      this.ObtenerDireccion();

      if (this.local != null)
        this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);

    })
    .catch ((error) => { this.mostrarCargando = null; this.mostrarErrorGeoposicon = true; console.log(error); } )
  }

  /**
  * Reintenta marcar al usuario.
  */
  ReintentarMarcarUsuario()
  {
    this.mostrarErrorGeoposicon = null;
    this.mostrarCargando = true;
    this.MarcarUsuario();
  }

 /**
 * Agrega un info windows al marcador del usuario con su direccion.
 */
  MostrarInformacionPosicionUsuario()
  {
    var infoWindow = new google.maps.InfoWindow({
      content: `<div class="media">
                  <div class="media-body">
                    <h7 class="media-heading">` + this.locacionUsuario + `</h4>
                  </div>
                </div>
              `,
    });

    var marcador = this.marcadorUsuario;

    google.maps.event.addListener(marcador, 'click', () => {
      infoWindow.open(this.map, marcador);
    });
  }

  /**
  * Cargo los locales del sistema y obtengo sus cordenadas.
  */
  CargarLocales()
  {
    this.ws.ObtenerLocales().then( data => {
      this.locales = new Array<Local>();
      data.forEach(local => {
        this.locales.push(local);

        var gerente = new Gerente();

        gerente.idUsuario = local.idUsuario;
        gerente.nombre = local.nombre;
        gerente.apellido = local.apellido;
        gerente.sexo = local.sexo;
        gerente.email = local.email;
        gerente.telefonoUsuario = local.telefonoUsuario;
        gerente.direccionUsuario = local.direccionUsuario;
        gerente.localidadUsuario = local.localidadUsuario;
        gerente.provinciaUsuario = local.provinciaUsuario;
        gerente.paisUsuario = local.paisUsuario;
        gerente.usuarioImg = local.usuarioImg;

        this.locales[this.locales.length - 1].gerente = gerente;

        var direccionCompleta = local.direccion + ", " + local.localidad + ", " + local.provincia + ", " + local.pais;
        this.locales[this.locales.length - 1].direccionCompleta = direccionCompleta;
        this.ObtenerCordenadaLocal(this.locales.length - 1, direccionCompleta);
        this.CargarProductosDelLocal(local);
      });
    })
    .catch( error => {
      console.log(error);
    })
  }

  CargarProductosDelLocal(local : Local)
  {
    this.ws.ObtenerProductosDelLocal(local.idLocal).then((data) =>
    {
      local.productos = data;
    })
    .catch( error => {
      console.log(error);
    })
  }

  /**
  * Obtengo las cordenadas de un local y lo marco en el mapa.
  * @param local posicion del array donde se encuentra el local.
  * @param direccion direccion del local.
  */
  ObtenerCordenadaLocal(local, direccion)
  {
      this.ws.getlatlng(direccion).then( data => {
        var cordenadas = data.results[0].geometry.location;
        this.locales[local].lat = cordenadas.lat;
        this.locales[local].lng = cordenadas.lng;
        console.log("Local " + local + ": ");
        console.log(this.locales[local]);
        this.MarcarLocal(this.locales[local]);
      })
      .catch( e => {
        console.log(e);
      } );
  }

  /**
  * Marco el local en el mapa. Si es el primero en ser cargado, se muestra su informacion. Si cargo la posicion del usuario, muestro su ruta.
  * @param local local a marcar.
  */
  MarcarLocal(local : Local)
  {
    let position = new google.maps.LatLng(local.lat, local.lng);
    local.marcador = new google.maps.Marker({position: position, animation: google.maps.Animation.DROP, icon : "assets/ico/pinLocal.ico", title : "Local"});
    local.marcador.setMap(this.map);
    
    if (this.local == null)
    {
      local.marcador.setIcon("assets/ico/pinLocalSeleccionado.ico");
      this.local = local;

      if (this.locacionUsuario != null)
      {
        //this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
        this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);
      }
    }
    else if (this.seleccionLocal != 0 && this.seleccionLocal == local.idLocal)
    {
      local.marcador.setIcon("assets/ico/pinLocalSeleccionado.ico");
      this.local = local;

      if (this.locacionUsuario != null)
      {
        //this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
        this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);
      }
    }

    var infoWindow = new google.maps.InfoWindow({
      content: `<div class="media"><div class="media-left media-top">
                      <img class="media-object" src = "http://www.romerofederico.hol.es/pizza/ws/img/locales/` + local.img1 + `" style = "  display: block; max-width:150px; max-height:150px; width: auto; height: auto;">
                  </div>
                  <div class="media-body">
                    <h4 class="media-heading">` + local.direccion + `</h4>
                    <h5>` + local.localidad + `</h5>
                    <p><span class="glyphicon glyphicon-phone-alt"></span> Tel : <small>` + local.telefono + `</small></p>
                  </div>
                </div>
              `,
    });

    var marcador = local.marcador

    // Funcion para, al clickear un punto, se muestre el local y su ruta.
    google.maps.event.addListener(marcador, 'click', () => {

      // Abro la ventana de informacion.
      infoWindow.open(this.map, marcador);

      // Pongo todos los iconos de los marcadores por default.
      this.locales.forEach(l => {
        l.marcador.setIcon("assets/ico/pinLocal.ico");
      });

      // Al marcador del local seleccionado lo cambio por el pin de seleccionado y luego lo asigno al local a mostrar.
      local.marcador.setIcon("assets/ico/pinLocalSeleccionado.ico");
      this.local = local;

      // Si el usuario se esta mostrando, obtengo la distancia y tiempo, junto con su ruta.
      if (this.locacionUsuario != null)
      {
        //this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
        this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);
      }
    });
  }

  /**
  * Obtengo la direccion del usuario.
  */
  ObtenerDireccion()
  {
    this.ws.getDireccion(this.marcadorUsuario.position.lat(), this.marcadorUsuario.position.lng())
    .then((data) => {

      this.locacionUsuario = data.results[0].formatted_address;
      var direccionExplotada = this.locacionUsuario.split(', ');
      this.direccionUsuario = direccionExplotada[0];
      this.localidadUsuario = direccionExplotada[1]; 

      this.MostrarInformacionPosicionUsuario();

      if (this.local != null)
      {
        //this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
        this.DibujarRuta(this.local.marcador.position, this.marcadorUsuario.position);
      }
    })
    .catch((error) => { console.log(error); });
  }

  /**
  * Obtengo la distancia y tiempo entre la direccion del local y la del usuario.
  * @param dirLocal direccion del local.
  * @param dirUsuario direccion del usuario.
  */
  ObtenerDistanciaYTiempo(dirLocal,dirUsuario)
  {
    console.log(dirLocal);
    console.log(dirUsuario);
    this.ws.getDistancia(dirLocal, dirUsuario)
    .then((data) => { 
      console.log(data);
      this.distancia = data.rows[0].elements[0].distance.text;
      this.duracion = data.rows[0].elements[0].duration.text;
    })
    .catch((error) => { console.log(error); });
  }

  /**
  * Dibujo la ruta entre dos marcadores.
  * @param posicion1 posicion del marcador 1.
  * @param posicion2 posicion del marcador 2.
  */
  DibujarRuta(posicion1, posicion2)
  {
    console.log("Dibujo la ruta");
    this.directionsService.route({
      origin: posicion1,
      destination: posicion2,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);
        // Hago la distancia y tiempo aqui...
        this.distancia = response.routes[0].legs[0].distance.text;
        this.duracion = response.routes[0].legs[0].duration.text;
        //
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  Comprobar()
  {
    return this.autService.isLogued();
  }

  ComprobarPromo(diaPromo)
  {
    var dia : any = this.dias[new Date().getDay()]
    return dia == diaPromo || dia == "Domingo";
  }

  ProductoSeleccionado(producto : Producto)
  {
    return this.seleccionProducto[producto.idProducto] != undefined;
  }

  Pedir(idProducto : number)
  {
    this.seleccionProducto[idProducto] = idProducto;
  }

  CancelarPedir(idProducto : number)
  {
    this.seleccionProducto[idProducto] = undefined;
  }

  ProcesarPedido()
  {
    if (this.seleccionProducto.length == 0)
      alert("Seleccione un producto primero!!!");
    else
    {
      var productoAPedir = this.seleccionProducto.filter((idProducto) =>
      {
        var resultado = false;

        for (let producto of this.local.productos)
          if (producto.idProducto == idProducto)
          {
            resultado = true;
            break;
          }

        return resultado;
      })

      if (productoAPedir.length == 0)
        alert("Seleccione algun producto que este disponible en el local seleccionado!!!");
      else
      {
        this.router.navigate(['/pedidos'], { queryParams: { Local : this.local.idLocal, Productos : productoAPedir, Distancia : this.distancia, Tiempo : this.duracion, Direccion : this.direccionUsuario, Localidad : this.localidadUsuario}});
      }
    }
  }

  //Funciones del Slider

  cambiar(func)
  {
      switch(func)
      {
          case 1:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
      }
  }

  slider()
  {
      switch(this.num2)
      {
          case 1:
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.item1 = "item active";
            this.active1 = "active";
            this.num = 1;
            this.num2 = 2;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item3 = "item";
            this.active3 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.num = 2;
            this.num2 = 3;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
      }
      setTimeout(() => {
             this.slider();
      },
      1000);
  }


  anterior()
  {
      switch(this.num)
      {
          case 1:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
          case 2:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
      }
  }

  posterior()
  {
      switch(this.num)
      {
          case 1:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
          case 3:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
      }
  }
}
