import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

declare var google;

export class User {
  constructor( public nombre : string = "", 
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
               public legajo : string = "")
  {}
}

@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.css']
})
export class AgregarUsuarioComponent implements OnInit, Input, Output {

  direccion : string = "";

  user: User = new User('','');

  mensaje : string;
  mostrarMensaje : boolean = null;
  mensajeMostrar : string = "";
  mostrarError : boolean = null;
  mostrarInfo : boolean = null;

  cargando : boolean = null;

  cargandoPosicion : boolean = null;
  errorCargandoPosicion : boolean = null;

  cargandoVerificacion = null;
  verificado : boolean = null;
  verificadoF : boolean = null;
  errorVerificado : boolean = null;

  cargandoVerificacionLegajo = null;
  verificadoLegajo : boolean = null;
  verificadoFLegajo : boolean = null;
  errorVerificadoLegajo : boolean = null;

  vacioEmail : boolean = null;
  vacioPassword : boolean = null;
  vacioApellido : boolean = null;
  vacioNombre : boolean = null;
  vacioDireccion : boolean = null;
  vacioTelefono : boolean = null;
  vacioLegajo : boolean = null;

  validarDireccion : boolean = null;
  validarEmail : boolean = null;
  validarPassword : boolean = null;
  validarLegajo : boolean = null;

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
  }

  ngOnInit() {
  }

  @Output() onRegistrado = new EventEmitter<any>();

  ValidarEmail(email)
  {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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

  ValidarSoloNumeros(event, atributo)
  {
    let newText: string = event.target.value;
    if (/^\d+$/.test(newText) || newText == "") {
      //input is valid, so update the model
      if (atributo == "Telefono")
        this.user.telefono = newText;
      else
        this.user.legajo = newText;
    }
    else {
      //restore the original value
      if (atributo == "Telefono")
        event.target.value = this.user.telefono;
      else
        event.target.value = this.user.legajo;
    }
  }

  ValidarDireccion()
  {
    this.cargando = true;

    this.ws.getlatlng(this.direccion).then((value) => {

      console.log(value);

      if (value.results.length == 0)
      {
        this.mostrarInfo = true;
        this.mensaje = "Direccion invalida. "; 
        this.validarDireccion = true;
        this.cargando = null;
      }
      else
      {
        //this.ModificarUsuario();
        console.log("Validado!!!!");
        this.RegistrarUsuario();
      }
    })
    .catch((error) => { this.cargando = null; console.log("Error"); });
  }

  Registrarse()
  {
    this.mostrarError = null;
    this.mostrarMensaje = null;
    this.mostrarInfo = null;

    this.vacioEmail = null;
    this.vacioPassword = null;
    this.vacioApellido = null;
    this.vacioNombre = null;
    this.vacioDireccion = null;
    this.vacioTelefono = null;
    this.vacioLegajo = null;

    this.validarPassword = null;
    this.validarDireccion = null;
    this.validarEmail = null;
    this.validarLegajo = null;

    if (this.user.email == "")
      this.vacioEmail = true;

    if (this.user.password == "")
      this.vacioPassword = true;

    if (this.user.nombre == "")
      this.vacioNombre = true;

    if (this.user.apellido == "")
      this.vacioApellido = true;

    if (this.direccion == "")
      this.vacioDireccion = true;
      
    if (this.user.telefono == "")
      this.vacioTelefono = true;

    if (this.user.tipo != "Cliente" && this.user.legajo == "")
      this.vacioLegajo = true;

    if (!this.ValidarEmail(this.user.email))
      this.validarEmail = true;

    if (this.user.password.length < 6)
      this.validarPassword = true;

    if (this.user.tipo != "Cliente" && this.user.legajo.length < 6)
      this.validarLegajo = true;

    if (this.vacioEmail != null || this.vacioPassword != null || this.vacioApellido != null || this.vacioNombre != null || this.vacioDireccion != null || this.vacioTelefono != null)
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      return;
    }
    else if (!this.ValidarEmail(this.user.email))
    {
      this.mostrarInfo = true;
      this.mensaje = "El email ingresado no es valido. ";
      return;
    }
    else if (this.user.password.length < 6)
    {
      this.mostrarInfo = true;
      this.mensaje = "El password ingresado no es valido. ";
      return;
    }
    else if (this.user.tipo != "Cliente" && this.user.legajo.length < 6)
    {
      this.mostrarInfo = true;
      this.mensaje = "El legajo ingresado no es valido. ";
      return;
    }

    if (!(confirm("¿Desea registrar con estos datos?")))
      return;
    
    this.ValidarDireccion();
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
        timeout: 3000,
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

  VerificarEmailUsuario(email : string)
  {
    this.verificado = null;
    this.verificadoF = null;
    this.errorVerificado = null;
    this.validarEmail = null;
    this.vacioEmail = null;

    if (email.length == 0)
    {
      console.log("No se ha ingresado un email valido!!!");
      this.errorVerificado = true;
    }
    else if (!this.ValidarEmail(this.user.email))
    {
      this.validarEmail = true;
      return;
    }
    else
    {
      this.cargandoVerificacion = true;

      this.ws.VerificarEmail(email).then((data) => {

        this.cargandoVerificacion = null;

        if (data.exito)
          this.verificado = true;
        else
          this.verificadoF = true;
      })
      .catch((error) => { this.errorVerificado = true; this.cargandoVerificacion = null; console.log(error); })
    }
  }

  VerificarLegajoUsuario(legajo : string)
  {
    this.verificadoLegajo = null;
    this.verificadoFLegajo = null;
    this.errorVerificadoLegajo = null;
    this.validarLegajo = null;
    this.vacioLegajo = null;

    if (legajo.length == 0)
    {
      console.log("No se ha ingresado un legajo !!!");
      this.errorVerificadoLegajo = true;
    }
    else if (legajo.length < 6)
    {
      this.validarLegajo = true;
      return;
    }
    else
    {
      this.cargandoVerificacionLegajo = true;

      this.ws.VerificarLegajo(legajo).then((data) => {

        this.cargandoVerificacionLegajo = null;

        if (data.exito)
          this.verificadoLegajo = true;
        else
          this.verificadoFLegajo = true;
      })
      .catch((error) => { this.errorVerificadoLegajo = true; this.cargandoVerificacionLegajo = null; console.log(error); })
    }
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

  RegistrarUsuario()
  {
    this.cargando = true;

    let direccion = this.direccion.split(", ");
    this.user.direccion = direccion[0];
    this.user.localidad = direccion[1];
    this.user.provincia = direccion[2];
    this.user.pais = direccion[3];

    if (this.user.tipo == "Cliente")
      this.user.legajo = null;

    this.ws.Registrar(this.user).then( data => {
      console.log("Accediendo al servidor...");
      console.log(data);
      this.cargando = null;
      if (data.exito)
      {
        alert("Usuario registrado con exito!!!");
        this.onRegistrado.emit(true);
      }
      else
      {
        if (this.user.tipo == "Cliente")
          this.user.legajo = "";
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
      }
    })
    .catch( e => {
      if (this.user.tipo == "Cliente")
          this.user.legajo = "";
      this.cargando = null;
      this.mostrarError = true;
      console.log(e);
    } );
  }

  CancelarRegistro()
  {
    if (confirm("Desea cancelar el registro de usuario?"))
      this.onRegistrado.emit(false);
  }

}
