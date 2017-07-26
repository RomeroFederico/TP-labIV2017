import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router }  from '@angular/router';
import { AutService } from '../auth/aut.service';

@Injectable()
export class VerificarJWT3Service implements CanActivate {

  constructor( private router: Router, private auth: AutService ) {
    console.log('isLogued()', auth.isLogued());
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {

        let url: string = state.url;
        console.log('url dentro de canActivate: ', url);
        console.log(route);
        console.log(state);

        if ( this.auth.isLogued() && (this.auth.getToken().usuario.tipo == "Empleado" || this.auth.getToken().usuario.tipo == "Encargado"))
        {
          return true;
        }
        else
        {
          this.router.navigateByUrl('/home');
          return !true;
        }
  }
}
