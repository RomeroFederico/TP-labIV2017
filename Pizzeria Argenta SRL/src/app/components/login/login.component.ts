import { Component, OnInit } from '@angular/core';
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
               public img : string = "default.png")
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
        console.log(data.mensaje);
      }
    })
    .catch( e => {
      this.cargando = null;
      this.mostrarError = true;
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
      (error) => { this.cargandoPosicion = null; this.errorCargandoPosicion = true; console.log(error); }, 
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
    };
  }

  VerificarEmailUsuario(email : string)
  {
    this.verificado = null;
    this.verificadoF = null;
    this.errorVerificado = null;

    if (email.length == 0)
    {
      console.log("No se ha ingresado un email valido!!!");
      this.errorVerificado = true;
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

  Registrarse()
  {
    this.mostrarError = null;
    this.mostrarMensaje = null;
    this.mostrarInfo = null;

    if (this.user.password == "" || this.user.email == "" || this.user.nombre == "" || this.user.apellido == "" ||
        this.direccion == "" || this.user.telefono == "")
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      return;
    }

    this.cargando = true;

    let direccion = this.direccion.split(", ");
    this.user.direccion = direccion[0];
    this.user.localidad = direccion[1];
    this.user.provincia = direccion[2];
    this.user.pais = direccion[3];

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
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
        console.log(data.mensaje);
      }
    })
    .catch( e => {
      this.cargando = null;
      this.mostrarError = true;
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
