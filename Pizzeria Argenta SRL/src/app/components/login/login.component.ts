import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

export class User {
  constructor(public email: string = "", public password: string = "")
  {
    this.email = email;
    this.password = password;
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  user: User = new User('','');

  mensaje : string;
  mostrarMensaje : boolean = null;
  mostrarError : boolean = null;
  mostrarInfo : boolean = null;

  cargando : boolean = null;

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

  enviar()
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

    this.ws.post(this.user).then( data => {
      console.log("Accediendo al servidor...");
      this.cargando = null;
      if (data.exito)
      {
        if ( data.token )
        {
          localStorage.setItem('token', data.token);
          console.log(this.aut.getToken());
          this.router.navigateByUrl("/home");
        }
      }
      else
      {
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

}
