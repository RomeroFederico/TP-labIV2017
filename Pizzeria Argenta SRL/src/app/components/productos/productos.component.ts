import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { IMultiSelectTexts } from 'angular-2-dropdown-multiselect';

import { ComunicacionService } from '../../services/comunicacion/comunicacion';
import { Subscription }   from 'rxjs/Subscription';

export class Producto
{
  constructor(public idProducto : number = 1, public descripcion: string = "Grande de Muzzarella", public promocion : string = "", public tipo : string = "Pizza", public precio : number = 0, public img : string = "default.jpg", public locales : Array<any> = new Array<any>())
  {
      
  }
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, Input, Output {

  // Default selection
  optionsModel: number[] = [0];

  // Settings configuration
  mySettings: IMultiSelectSettings = {
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-block',
      dynamicTitleMaxItems: 3,
      displayAllSelectedText: true,
      selectionLimit: 1,
      autoUnselect: true,
      closeOnSelect: true,
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
      checkAll: 'Select all',
      uncheckAll: 'Unselect all',
      checked: 'item selected',
      checkedPlural: 'items selected',
      searchPlaceholder: 'Find',
      defaultTitle: 'Select',
      allSelected: 'All selected',
  };

  // Labels / Parents
  myOptions: IMultiSelectOption[] = [
  ];

  productosBase : Array<Producto>;
  productos : Array<Producto>;

  locales : Array<any> = null;

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  localesCargados : boolean = null;

  localSeleccionado = "Seleccione un local";

  columnasProductos : string = "col-sm-3";

  subscription: Subscription;

  errorProductos : boolean = null;
  errorLocales : boolean = null;
  errorProductosLocales : boolean = null;

  localDelUsuario : any = null;
  errorUsuarioSinLocal : boolean = null;
  errorCargarLocalDelUsuario : boolean = null;

  registrar : boolean = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router, private comunicacionService: ComunicacionService)
  {
    if (this.Comprobar() && (this.ObtenerUsuario().tipo == "Empleado" || this.ObtenerUsuario().tipo == "Encargado"))
    {
      this.CargarLocalDelUsuario();
    }
    else
    {
      this.CargarLocales();
      this.CargarProductos();
    }
  }

  ngOnInit() {
  }

  //@Output() onAgregarAlCarrito = new EventEmitter<any>();

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    //this.subscription.unsubscribe();
  }

  SeleccionDeLocal()
  {
    console.log(this.optionsModel);
    this.FiltrarPorLocal(this.optionsModel[0]);
  }

  CargarLocalDelUsuario()
  {
    this.ws.ObtenerLocalDelUsuario(this.ObtenerUsuario()).then((data) => {

      console.log(data);

      if (data.local == false)
      {
        console.log("No hay local para mostrar...");
        this.errorUsuarioSinLocal = true;
      }
      else
      {
        console.log("Se encontro un local...");
        this.localDelUsuario = data.local;
        this.CargarProductosDelLocalDelUsuario(this.localDelUsuario);
      }
    })
    .catch((error) => { this.errorCargarLocalDelUsuario = true;  console.log(error)} );
  }

  ReintentarCargarLocalDelUsuario()
  {
    this.errorCargarLocalDelUsuario = null;
    this.CargarLocalDelUsuario();
  }

  CargarProductosDelLocalDelUsuario(local)
  {
    this.ws.ObtenerProductosDelLocal(local.idLocal).then((data) => 
    {
      console.log(data);
      this.productosBase = data;
      this.Mostrar('Todos');
    }
    )
    .catch((error) => { this.errorProductos = true;  console.log(error)} );
  }

  ReintentarOficial()
  {
    if (this.errorCargarLocalDelUsuario == true)
      this.ReintentarCargarLocalDelUsuario();
    else if (this.errorProductos == true)
    {
      this.errorProductos = null;
      this.CargarProductosDelLocalDelUsuario(this.localDelUsuario);
    }
  }

  CargarProductosDelLocal()
  {
    this.ws.ObtenerProductos().then((data) => 
    {
      console.log(data);
      this.productosBase = data;
      this.CargarLocalesPorProductos();
      this.Mostrar('Todos');
    }
    )
    .catch((error) => { this.errorProductos = true;  console.log(error)} );
  }

  CargarProductos()
  {
    this.ws.ObtenerProductos().then((data) => 
    {
      console.log(data);
      this.productosBase = data;
      this.CargarLocalesPorProductos();
      this.Mostrar('Todos');
    }
    )
    .catch((error) => { this.errorProductos = true;  console.log(error)} );
  }

  Reintentar()
  {
    if (this.errorProductos == true)
    {
      this.errorProductos = null;
      this.CargarProductos();
    }
    if (this.errorLocales == true)
    {
      this.errorLocales = null;
      this.CargarLocales();
    }
    if (this.errorProductosLocales == true)
    {
      this.errorProductosLocales = null;
      this.CargarLocalesPorProductos();
    }
  }

  CargarLocales()
  {
    this.ws.ObtenerLocales().then( data => {
      this.locales = data;

      this.locales.forEach(local => {
      
        this.myOptions.push({id: local.idLocal, name: local.direccion + ", " + local.localidad});
      });
      this.optionsModel = [this.locales[0].idLocal];
    })
    .catch( error => {
      this.errorLocales = true;
      console.log(error);
    })
  }

  CargarLocalesPorProductos()
  {
    // this.productosBase.forEach(producto => {
    //   producto.locales = ["Magliaccion 33XX, Glew.", "San Martin 78XX, Longchamps", "Mi Localidad 71XX, Adrogue"];
    // });
    this.ws.ObtenerLocalesDeProductos().then((data) => 
    {
      this.localesCargados = true;

      console.log(data);

      this.productosBase.forEach(producto => {
        producto.locales = new Array<any>();
        data.forEach(local => {
          if (local.idProducto == producto.idProducto)
            producto.locales.push(local);
        });
      });

      this.FiltrarPorLocal(1);
    })
    .catch((error) => { this.errorProductosLocales = true; console.log(error)} );
  }

  Mostrar(opcion)
  {
    this.productos = this.productosBase;

    if (opcion == 'Pizza')
      this.productos = this.productos.filter((item)=>{
        return item.tipo == "Pizza";
      })
    else if (opcion == 'Empanadas')
      this.productos = this.productos.filter((item)=>{
        return item.tipo == "Empanadas";
      })
    else if (opcion == 'Combo')
      this.productos = this.productos.filter((item)=>{
        return item.tipo == "Combo";
    })
  }

  FiltrarPorLocal(id)
  {
    this.productos = this.productosBase;

    if (id != 0)
    {
      this.productos = this.productos.filter((producto) => {
        var resultado = false;

        producto.locales.forEach((local) => {
          if (local.idLocal == id)
            resultado = true;
        })

        return resultado;
      })

      console.log(this.productos);
    }
  }

  ObtenerUsuario()
  {
    return this.autService.getToken().usuario;
  }

  Comprobar()
  {
    return this.autService.isLogued();
  }

  ComprobarPromo(diaPromo)
  {
    var dia : any = this.dias[new Date().getDay()]
    return dia == diaPromo || dia == "Domingo";
  }

  HacerPedido(producto) {
    this.router.navigate(["/locales"], { queryParams: { idProducto: producto.idProducto, idLocal : this.localDelUsuario.idLocal }});
  }

  EnviarAlCarrito(producto)
  {
    console.log("Envio al carrito...");
    producto.localSeleccionado = this.optionsModel[0];
    this.comunicacionService.EnviarAlCarrito(producto);
  }

  AlternarRegistro()
  {
    if (this.registrar == null)
      this.registrar = true;
    else
      this.registrar = null;
  }

  CapturarEventoRegistrado($event)
  {
    if ($event == true)
    {
      this.registrar = null;
      this.productos = null;
      this.productosBase = null;
      this.localDelUsuario = null;
      this.CargarLocalDelUsuario();
    }
    else
    {
      this.registrar = null;
    }
  }
}
