import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class WsService {

  url: string = 'http://www.romerofederico.hol.es/pizza/ws/administracion.php/';

  constructor(public http: Http, private authHttp: AuthHttp)
  {

  }

  Login(user: Object)
  {
    var body =  user;

    return this.http.post(this.url + 'login', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  VerificarEmail(email: string)
  {
    return this.http.get(this.url + 'usuario/email/' + email)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  Registrar(user: Object)
  {
    var body =  user;

    return this.http.post(this.url + 'registrar', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ModificarUsuario(user: Object)
  {
    var body =  user;

    return this.http.post(this.url + 'usuarios/modificar', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerUsuarios()
  {
    return this.http.get(this.url + 'usuarios')
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }
  
  getlatlng(address = 'Av Bartolomé Mitre 750,Avellaneda,Buenos Aires, Argentina'){

    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  getDireccion(lat, lng)
  {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  getDistancia(direccion1 : string, direccion2 : string){

    var re = / /gi; 

    return this.http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + direccion1.replace(re, '+') + '&destinations=' + direccion2.replace(re, '+'))
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  // Error de geolocation. 
  ObtenerPosicion()
  {
    return this.http.get("http://ip-api.com/json")
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerProductos()
  {
    return this.http.get(this.url + 'productos')
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerLocales()
  {
    return this.http.get(this.url + 'locales')
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerProductosDelLocal(idLocal)
  {
    return this.http.get(this.url + 'productos/local/' + idLocal)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerLocalesDeProductos()
  {
    return this.http.get(this.url + 'productos/local')
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  ObtenerListaProductosYLocal(obj)
  {
    var body =  obj;

    return this.http.post(this.url + 'pedidos/detalle', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  RegistrarPedido(obj)
  {
    var body =  obj;

    return this.http.post(this.url + 'pedidos/nuevo', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  TerminarPedido(obj)
  {
    var body =  obj;

    return this.http.post(this.url + 'pedidos/terminar', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  TraerPedidos(obj)
  {
    var body =  obj;

    return this.http.post(this.url + 'pedidos', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  GuardarEncuesta(obj)
  {
    var body =  obj;

    return this.http.post(this.url + 'encuesta/registrar', body)
    .toPromise()
    .then( this.extractData )
    .catch( this.handleError );
  }

  private extractData(res: Response) {
    let body = res.json();    
    
    return body || { };
  }

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error( errMsg );
    console.error( 'CATCH' );
    return Observable.throw(errMsg);
  }
}
