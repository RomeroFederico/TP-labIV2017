import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { RecaptchaModule } from 'ng-recaptcha';

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
               public response : string = "")
  {}
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  registrar : boolean = null;

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

  vacioEmail : boolean = null;
  vacioPassword : boolean = null;
  vacioApellido : boolean = null;
  vacioNombre : boolean = null;
  vacioDireccion : boolean = null;
  vacioTelefono : boolean = null;

  validarDireccion : boolean = null;
  validarEmail : boolean = null;
  validarPassword : boolean = null;

  validarCaptcha : boolean = null;

  captcha : string = null;

  @ViewChild('miCaptcha')
  miCaptcha: any;

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
    this.user.email = '';
  }

  ngOnInit()
  {
    this.route.queryParams
      .subscribe(params => {
        if (params["mensaje"])
        {
          this.mostrarInfo = true;
          this.mensaje = params["mensaje"];
        }
      });

    if (this.aut.isLogued())
      this.router.navigateByUrl("/home");
  }

  resolved(captchaResponse: string)
  {
      console.log(`Resolved captcha with response ${captchaResponse}:`);
      this.captcha = captchaResponse;
  }

  VerificarCaptcha()
  {
    this.ws.VerificarCaptcha({response: this.captcha}).then((data => {
      console.log(data);
    }))
    .catch((error) => { console.log(error); });
  }

  Rellenar(tipo : string)
  {
    if (tipo == "Cliente")
    {
      this.user.email = "a@a.com";
      this.user.password = "123456";
    }
    else if (tipo == "Empleado")
    {
      this.user.email = "ignacio@gmail.com";
      this.user.password = "ignacio";
    }
    else if (tipo == "Encargado")
    {
      this.user.email = "juan@juan.com";
      this.user.password = "juan";
    }
    else
    {
      this.user.email = "admin@admin.com";
      this.user.password = "789456123";
    }
  }

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
    document.getElementById("mostrarMensaje").scrollIntoView();

    this.ws.getlatlng(this.direccion).then((value) => {

      console.log(value);

      if (value.results.length == 0)
      {
        this.mostrarInfo = true;
        this.mensaje = "Direccion invalida. "; 
        this.validarDireccion = true;
        this.cargando = null;
        //document.getElementById("mostrarMensaje").scrollIntoView();
      }
      else
      {
        //this.ModificarUsuario();
        console.log("Validado!!!!");
        this.RegistrarUsuario();
        //this.VerificarCaptcha();
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

    this.validarPassword = null;
    this.validarDireccion = null;
    this.validarEmail = null;
    this.validarCaptcha = null;

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

    if (!this.ValidarEmail(this.user.email))
      this.validarEmail = true;

    if (this.user.password.length < 6)
      this.validarPassword = true;

    if (this.captcha == null)
      this.validarCaptcha = true;

    if (this.vacioEmail != null || this.vacioPassword != null || this.vacioApellido != null || this.vacioNombre != null || this.vacioDireccion != null || this.vacioTelefono != null)
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      document.getElementById("mostrarMensaje").scrollIntoView();
      return;
    }
    else if (!this.ValidarEmail(this.user.email))
    {
      this.mostrarInfo = true;
      this.mensaje = "El email ingresado no es valido. ";
      document.getElementById("mostrarMensaje").scrollIntoView();
      return;
    }
    else if (this.user.password.length < 6)
    {
      this.mostrarInfo = true;
      this.mensaje = "El password ingresado no es valido. ";
      document.getElementById("mostrarMensaje").scrollIntoView();
      return;
    }
    else if (this.captcha == null)
    {
      this.mostrarInfo = true;
      this.mensaje = "No se ha ingresado el captcha. ";
      document.getElementById("mostrarMensaje").scrollIntoView();
      return;
    }

    if (!(confirm("¿Desea registrarse con estos datos?")))
      return;
    
    this.ValidarDireccion();
  }

  Login()
  {
    this.mostrarError = null;
    this.mostrarMensaje = null;
    this.mostrarInfo = null;

    if (this.user.password == "" && this.user.email == "")
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      return;
    }
    else if(this.user.password == "")
    {
      this.mostrarInfo = true;
      this.mensaje = "No se ha ingresado la contraseña. ";
      return;
    }
    else if(this.user.email == "")
    {
      this.mostrarInfo = true;
      this.mensaje = "No se ha ingresado el email. ";
      return;
    }

    this.cargando = true;
    document.getElementById("mostrarMensaje").scrollIntoView();

    this.ws.Login(this.user).then( data => {
      console.log("Accediendo al servidor...");
      this.cargando = null;
      if (data.exito)
      {
        if ( data.token )
        {
          location.reload();
          localStorage.setItem('token', data.token);
          console.log(this.aut.getToken());
          this.router.navigateByUrl("/home");
        }
      }
      else
      {
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
        document.getElementById("mostrarMensaje").scrollIntoView();
        console.log(data.mensaje);
      }
    })
    .catch( e => {
      this.cargando = null;
      this.mostrarError = true;
      document.getElementById("mostrarMensaje").scrollIntoView();
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

  IrARegistro()
  {
    this.registrar = true;
    console.log("LLendo a registrarse...");
  }

  RegistrarUsuario()
  {
    this.cargando = true;
    document.getElementById("mostrarMensaje").scrollIntoView();

    let direccion = this.direccion.split(", ");
    this.user.direccion = direccion[0];
    this.user.localidad = direccion[1];
    this.user.provincia = direccion[2];
    this.user.pais = direccion[3];
    this.user.response = this.captcha;

    this.ws.Registrar(this.user).then( data => {
      console.log("Accediendo al servidor...");
      this.cargando = null;
      if (data.exito)
      {
        if ( data.token )
        {
          location.reload();
          localStorage.setItem('token', data.token);
          alert("Usuario registrado con exito!!!");
          this.router.navigateByUrl("/home");
        }
        console.log(data);
      }
      else
      {
        this.miCaptcha.reset();
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
        document.getElementById("mostrarMensaje").scrollIntoView();
        console.log(data.mensaje);
      }
    })
    .catch( e => {
      this.miCaptcha.reset();
      this.cargando = null;
      this.mostrarError = true;
      document.getElementById("mostrarMensaje").scrollIntoView();
      console.log(e);
    } );
  }

  CancelarRegistro()
  {
    console.log(this.direccion.split(", "));
    console.log(this.user);
    this.user = new User();
    this.direccion = "";
    this.registrar = null;
  }

}
