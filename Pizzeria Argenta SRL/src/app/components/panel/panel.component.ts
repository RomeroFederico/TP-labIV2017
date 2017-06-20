import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

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
               public direccionCompleta : string = "")
  {}
}

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
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

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
    this.user = this.ObtenerUsuario();
    this.user.direccionCompleta = this.user.direccion + ", " + this.user.localidad + ", " + this.user.provincia + ", " + this.user.pais;
    console.log(this.user);
    this.usuarioSinModificar = new User();
  }

  ngOnInit() {
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
    if (this.user.nombre == "" || this.user.apellido == "" ||
        this.direccion == "" || this.user.telefono == "")
    {
      alert("Complete los campos para continuar. ");
      return;
    }

    if (!(confirm("¿Desea modificar sus datos?")))
      return;

    let direccion = this.direccion.split(", ");
    this.user.direccion = direccion[0];
    this.user.localidad = direccion[1];
    this.user.provincia = direccion[2];
    this.user.pais = direccion[3];
    this.user.direccionCompleta = this.direccion;

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
        alert(data.mensaje);
      }
    })
    .catch( e => {
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
      (error) => { this.cargandoPosicion = null; this.errorCargandoPosicion = true; console.log(error); }, 
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
    };
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
