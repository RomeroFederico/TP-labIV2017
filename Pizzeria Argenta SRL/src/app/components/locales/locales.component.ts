import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WsService } from '../../services/ws/ws.service';

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
               public marcador : any = null)
  {

  }
}

@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.css']
})
export class LocalesComponent implements OnInit {

  num = 1;
  num2 = 1;
  item1 = "item";
  item2 = "item";
  item3 = "item";

  active1 = "";
  active2 = "";
  active3 = "";

  // lat: number = 51.678418;
  // lng: number = 7.809007;

  // marcador : any;
  // marcador2 : any;
  // position : any;
  // position2 : any;

  locales : Array<Local>;
  local : Local = null;

  marcadorUsuario : any = null;
  locacionUsuario : string = null;

  distancia : string = null;
  duracion : string = null;

  @ViewChild('map') mapElement: ElementRef;

  map: any;

  constructor(public ws : WsService)
  {
    this.CargarLocales();
  }

  ngOnInit()
  {
    //this.ObtenerCordenadas();
    this.slider();
    this.CargarMapa();
    this.MarcarUsuario();
  }

  // loadMap()
  // {
  //   let latLng = new google.maps.LatLng(this.lat, this.lng);
 
  //   let mapOptions = {
  //     center: this.position,
  //     zoom: 9,
  //     minZoom: 9,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   }
 
  //   this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  //   console.log(this.lat, this.lng);

  //   var options = {
  //     enableHighAccuracy: true,
  //     timeout: 5000,
  //     maximumAge: 0
  //   };

  //   var map = this.map;

  //   function MarcarUsuario(pos)
  //   {
  //       var lat = pos.coords.latitude;
  //       var lng = pos.coords.longitude;
  //       var position = new google.maps.LatLng(lat, lng);
  //       var marcador = new google.maps.Marker({position: position, animation: google.maps.Animation.DROP, title: "Usuario"});
  //       marcador.setMap(map);

  //       var infoWindow = new google.maps.InfoWindow({
  //         content: 'usuario',
  //       });

  //       var marcador = marcador

  //       google.maps.event.addListener(marcador, 'mouseover', function () {

  //         infoWindow.open(map, marcador);
  //       });
  //   }

  //   if(navigator.geolocation){
  //     navigator.geolocation.getCurrentPosition(MarcarUsuario, this.error, options);
  //   };
  // }

  MarcarUsuario()
  {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => 
      {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var latlng = new google.maps.LatLng(lat, lng);
        this.marcadorUsuario = new google.maps.Marker({position: latlng, animation: google.maps.Animation.DROP, icon : "assets/ico/pinUser.ico" , title: "Usuario"});
        this.marcadorUsuario.setMap(this.map);
        this.ObtenerDireccion();
      }, 
      (error) => { console.log(error); }, 
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    };
  }

  // Marcar()
  // {
  //     //this.position = new google.maps.LatLng(this.lat, this.lng);
  //     this.marcador = new google.maps.Marker({position: this.position, animation: google.maps.Animation.DROP, icon : "assets/ico/pinLocal.ico", title: "Local"});
  //     this.marcador.setMap(this.map);

  //     console.info(this.position);

  //     var infoWindow = new google.maps.InfoWindow({
  //     //content: "Here I am!"
  //     content: 'asdsad',
  //     });

  //     var marcador = this.marcador

  //     google.maps.event.addListener(marcador, 'mouseover', function () {

  //       infoWindow.open(this.map, marcador);
  //     });
  // }

  // ObtenerCordenadas()
  // {
  //     this.ws.getlatlng().then( data => {
  //       var cordenadas = data.results[0].geometry.location;
  //       this.lat = cordenadas.lat;
  //       this.lng = cordenadas.lng;

  //       this.position = new google.maps.LatLng(this.lat, this.lng);
  //       this.position2 = new google.maps.LatLng(51.678418, 7.809007);

  //       this.loadMap();
  //       this.Marcar();
  //     })
  //     .catch( e => {
  //       console.log(e);
  //     } );
  // }

  // error(err)
  // {
  //   console.warn('ERROR(' + err.code + '): ' + err.message);
  // };

  CargarLocales()
  {
    this.ws.ObtenerLocales().then( data => {
      this.locales = new Array<Local>();
      data.forEach(local => {
        this.locales.push(local);
        var direccionCompleta = local.direccion + " " + local.localidad + ", " + local.provincia + ", " + local.pais;
        this.locales[this.locales.length - 1].direccionCompleta = direccionCompleta;
        this.ObtenerCordenadaLocal(this.locales.length - 1, direccionCompleta);
      });
    })
    .catch( error => {
      console.log(error);
    })
  }

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
  }

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
        this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
    }

    var infoWindow = new google.maps.InfoWindow({
      content: `<div class="media"><div class="media-left media-top">
                      <img class="media-object" src = "assets/images/locales/` + local.img1 + `" style = "  display: block; max-width:150px; max-height:150px; width: auto; height: auto;">
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

    google.maps.event.addListener(marcador, 'click', () => {

      infoWindow.open(this.map, marcador);

      this.locales.forEach(l => {
        l.marcador.setIcon("assets/ico/pinLocal.ico");
      });

      local.marcador.setIcon("assets/ico/pinLocalSeleccionado.ico");
      this.local = local;

      if (this.locacionUsuario != null)
        this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
    });
  }

  ObtenerDireccion()
  {
    this.ws.getDireccion(this.marcadorUsuario.position.lat(), this.marcadorUsuario.position.lng())
    .then((data) => { 
      this.locacionUsuario = data.results[0].formatted_address;

      if (this.local != null)
        this.ObtenerDistanciaYTiempo(this.local.direccionCompleta, this.locacionUsuario);
    })
    .catch((error) => { console.log(error); });
  }

  ObtenerDistanciaYTiempo(dirLocal,dirUsuario)
  {
    console.log(dirLocal);
    console.log(dirUsuario);
    this.ws.getDistancia(dirLocal, dirUsuario)
    .then((data) => { 
      console.log(data);
      this.distancia = data.rows[0].elements[0].distance;
      this.duracion = data.rows[0].elements[0].duration;
    })
    .catch((error) => { console.log(error); });
  }

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
      500);
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
