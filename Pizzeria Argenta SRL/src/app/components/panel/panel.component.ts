import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { FileUploader } from 'ng2-file-upload';

declare var google;

export class User {
  constructor( public idUsuario : number = 0,
               public nombre : string = "", 
               public apellido : string = "",
               public sexo : string = "Masculino", 
               public email : string = "",
               public password : string = "",
               public telefono : string = "",
               public direccion: string = "", 
               public localidad : string = "", 
               public provincia : string = "", 
               public pais : string = "",
               public estado : number = 1,
               public tipo : string = "Cliente",
               public img : string = "default.png",
               public direccionCompleta : string = "",
               public imgAnterior : string = "")
  {}
}

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
})
export class PanelComponent implements OnInit {

  seleccion : string = "Mi informacion";

  user : User;
  usuarioSinModificar : User;

  direccion : string = "";

  cargandoPosicion : boolean = null;
  errorCargandoPosicion : boolean = null;

  editar : boolean = null;

  cargando : boolean = null;

  imagenAnterior : string;
  public uploader1:FileUploader = new FileUploader({url: this.ws.url + "subir/usuarios/tmp/"});

  @ViewChild('myInput1')
  myInputVariable1: any;

  vacioApellido : boolean = null;
  vacioNombre : boolean = null;
  vacioDireccion : boolean = null;
  vacioTelefono : boolean = null;

  validarDireccion : boolean = null;

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
  }

  ngOnInit() {

    this.user = this.ObtenerUsuario();
    this.user.imgAnterior = "";
    this.user.direccionCompleta = this.user.direccion + ", " + this.user.localidad + ", " + this.user.provincia + ", " + this.user.pais;
    console.log(this.user);
    this.usuarioSinModificar = new User();

    this.uploader1.setOptions({url: this.ws.url + "subir/usuarios/tmp/" + this.user.idUsuario});

    this.uploader1.onBeforeUploadItem = (item) =>
    {
      console.info("item",item);
      item.withCredentials = false;
    }
    this.uploader1.onSuccessItem = (item, response) =>
    {
      var data = JSON.parse(response);

      this.cargando = null;

      if (data.exito)
      {
        this.imagenAnterior = data.imagenSubida;
        console.log(this.imagenAnterior);
      }
      else
        alert(data.mensaje);
      this.uploader1.queue.pop();
    }

    this.uploader1.onErrorItem = (item, Response) =>
    {
      this.uploader1.queue.pop();
      this.myInputVariable1.nativeElement.value = "";
      this.cargando = null;
      alert("Error en subir la imagen, vuelva a intentar");
      console.log("Error");
    }
  }

  ValidarSoloLetras(event, atributo)
  {
    let newText: string = event.target.value;
    if (/^[a-zA-Z]+$/.test(newText) || newText == "") {
      //input is valid, so update the model
      if (atributo == "Apellido")
        this.user.apellido = newText;
      else
        this.user.nombre = newText;
    }
    else {
      //restore the original value
      if (atributo == "Apellido")
        event.target.value = this.user.apellido;
      else
        event.target.value = this.user.nombre;
    }
  }

  ValidarSoloNumeros(event)
  {
    let newText: string = event.target.value;
    if (/^\d+$/.test(newText) || newText == "") {
      //input is valid, so update the model
      this.user.telefono = newText;
    }
    else {
      //restore the original value
      event.target.value = this.user.telefono;
    }
  }

  ValidarDireccion()
  {
    this.cargando = true;

    this.ws.getlatlng(this.direccion).then((value) => {

      console.log(value);

      if (value.results.length == 0)
      {
        alert("La direccion ingresada es invalida!!!");
        this.validarDireccion = true;
        this.cargando = null;
      }
      else
        this.ModificarUsuario();
    })
    .catch((error) => { this.cargando = null; console.log("Error"); });
  }

  MostrarConsola(mensaje)
  {
    console.log(mensaje);
  }

  Mostrar(seleccion : string)
  {
    if (seleccion != this.seleccion && this.cargando == null)
    {
      this.seleccion = seleccion;

      if (this.seleccion == "Cambiar imagen")
      {
        this.imagenAnterior = this.user.img;
        this.CopiarDatos(this.user, this.usuarioSinModificar);
      }
    }
  }

  ObtenerUsuario()
  {
    return this.aut.getToken().usuario;
  }

  HabilitarModificacion()
  {
    this.editar = true;
    this.direccion = this.user.direccionCompleta;
    
    this.CopiarDatos(this.user, this.usuarioSinModificar);
  }

  CancelarModificacion()
  {
    if (confirm("¿Deseas cancelar la modificacion?"))
    {
      this.editar = null;
      this.direccion = "";
      this.CopiarDatos(this.usuarioSinModificar, this.user);
    }
  }

  CopiarDatos(uno : User, dos : User)
  {
    dos.idUsuario = uno.idUsuario;
    dos.apellido = uno.apellido;
    dos.nombre = uno.nombre;
    dos.img = uno.img;
    dos.sexo = uno.sexo;
    dos.email = uno.email;
    dos.password = uno.password;
    dos.telefono = uno.telefono;
    dos.direccion = uno.direccion;
    dos.localidad = uno.localidad;
    dos.provincia = uno.provincia;
    dos.pais = uno.pais;
    dos.direccionCompleta = uno.direccionCompleta;
    dos.estado = uno.estado;
    dos.tipo = uno.tipo;
  }

  Modificar()
  {
    this.vacioApellido = null;
    this.vacioNombre = null;
    this.vacioDireccion = null;
    this.vacioTelefono = null;
    this.validarDireccion = null;

    if (this.user.nombre == "")
      this.vacioNombre = true;

    if (this.user.apellido == "")
      this.vacioApellido = true;

    if (this.direccion == "")
      this.vacioDireccion = true;
      
    if (this.user.telefono == "")
      this.vacioTelefono = true;

    if (this.vacioApellido != null || this.vacioNombre != null || this.vacioDireccion != null ||this.vacioTelefono != null)
    {
      alert("Error!!!, algunos campos no se han completados");
      return;
    }

    if (!(confirm("¿Desea modificar sus datos?")))
      return;
    
    this.ValidarDireccion();
  }

  ModificarUsuario()
  {
    let direccion = this.direccion.split(", ");
    this.user.direccion = direccion[0];
    this.user.localidad = direccion[1];
    this.user.provincia = direccion[2];
    this.user.pais = direccion[3];
    this.user.direccionCompleta = this.direccion;

    this.ws.ModificarUsuario(this.user).then( data => {
      this.cargando = null;
      console.log(data);
      if (data.exito)
      {
        this.editar = null;
        alert("Usuario Modificado con exito!!!");
        if ( data.token )
        {
          localStorage.setItem('token', data.token);
          location.reload();
        }
      }
      else
      {
        alert(data.mensaje);
      }
    })
    .catch( e => {
      this.cargando = null;
      alert("Ocurrio un error, vuelva a intentarlo. ");
      console.log(e);
    } );
  }

  Subir()
  {
    this.cargando = true;

    this.uploader1.queue[0].upload();
  }

  ModificarImagen()
  {
    this.user.img = this.imagenAnterior;
    this.user.imgAnterior = this.usuarioSinModificar.img;

    console.log(this.user);

    if (this.user.img == this.user.imgAnterior)
    {
      alert("No se ha cargado una imagen!!!");
      return;
    }

    if (!(confirm("¿Desea modificar su imagen?")))
      return;

    this.ws.ModificarUsuario(this.user).then( data => {
      console.log(data);
      if (data.exito)
      {
        this.editar = null;
        alert("Usuario Modificado con exito!!!");
        if ( data.token )
        {
          localStorage.setItem('token', data.token);
          location.reload();
        }
      }
      else
      {
        this.user.img = this.usuarioSinModificar.img;
        alert(data.mensaje);
      }
    })
    .catch( e => {
      this.user.img = this.usuarioSinModificar.img;
      alert("Ocurrio un error, vuelva a intentarlo. ");
      console.log(e);
    } );
  }

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
        this.ObtenerDireccion(lat, lng);
      }, 
      (error) => { /*this.cargandoPosicion = null; this.errorCargandoPosicion = true;*/ this.AlternativaMarcarUsuario(); console.log(error + ". Reintentando en alernativa... "); }, 
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    };
  }

  // Error de Google
  AlternativaMarcarUsuario()
  {
    this.ws.ObtenerPosicion().then((data) => {

      this.cargandoPosicion = null;
      var lat = data.lat;
      var lng = data.lon;
      var latlng = new google.maps.LatLng(lat, lng);
      this.ObtenerDireccion(lat, lng);

    })
    .catch ((error) => { this.cargandoPosicion = null; this.errorCargandoPosicion = true; console.log(error); } )
  }

  /**
  * Obtengo la direccion del usuario.
  */
  ObtenerDireccion(lat, lng)
  {
    this.ws.getDireccion(lat, lng)
    .then((data) => { 
      this.direccion = data.results[0].formatted_address;
    })
    .catch((error) => { console.log(error); });
  }

  ReintentarObtenerDireccionUsuario()
  {
    this.errorCargandoPosicion = null;
    this.ObtenerDireccionUsuario();
  }

}
