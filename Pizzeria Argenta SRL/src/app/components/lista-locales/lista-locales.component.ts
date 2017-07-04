import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

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
               public productos : Array<Producto> = null,
               public empleados : Array<any> = null,
               public errorProductos : boolean = null,
               public errorEmpleados : boolean = null)
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
               public usuarioImg : string = "",
               public legajo : string = "")
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
  selector: 'app-lista-locales',
  templateUrl: './lista-locales.component.html',
  styleUrls: ['./lista-locales.component.css']
})
export class ListaLocalesComponent implements OnInit {

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  locales : Array<Local>;

  cargando : boolean = null;
  registrar : boolean = null;
  error : boolean = null;

  localModificar : any = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router)
  {
    this.CargarLocales();
  }

  ngOnInit() {
  }

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
        gerente.legajo = local.legajo;

        this.locales[this.locales.length - 1].gerente = gerente;

        var direccionCompleta = local.direccion + ", " + local.localidad + ", " + local.provincia + ", " + local.pais;
        this.locales[this.locales.length - 1].direccionCompleta = direccionCompleta;
        this.CargarProductosDelLocal(local);
        this.CargarEmpleadosDelLocal(local);
      });
    })
    .catch( error => {
      this.error = true;
      console.log(error);
    })
  }

  ReintentarCargarLocales()
  {
    this.error = null;
    this.CargarLocales();
  }

  CargarProductosDelLocal(local : Local)
  {
    this.ws.ObtenerProductosDelLocal(local.idLocal).then((data) =>
    {
      local.productos = data;
    })
    .catch( error => {
      local.errorProductos = true;
      console.log(error);
    })
  }

  ReintentarCargarProductos(local)
  {
    local.errorProductos = null;
    this.CargarProductosDelLocal(local);
  }

  CargarEmpleadosDelLocal(local : Local)
  {
    this.ws.ObtenerEmpleadosDelLocal(local.idLocal).then((data) =>
    {
      console.log(local.idLocal);
      console.log(data);
      local.empleados = data;
    })
    .catch( error => {
      local.errorEmpleados = true;
      console.log(error);
    })
  }

  ReintentarCargarEmpleados(local)
  {
    local.errorEmpleados = null;
    this.CargarEmpleadosDelLocal(local);
  }

  AlternarRegistro()
  {
    if (this.registrar == null)
    {
      this.localModificar = null;
      this.registrar = true;
    }
    else
      this.registrar = null;
  }

  CapturarEventoRegistrado($event)
  {
    if ($event == true)
    {
      this.locales = null;
      this.registrar = null;
      this.CargarLocales();
    }
    else
    {
      this.registrar = null;
    }
  }

  Modificar(local : any)
  {
    console.log("Voy a modificar local");
    console.log(local);
    this.localModificar = local;
    this.registrar = true;
  }

  Mostrar(local)
  {
    console.log(local);
  }

}
