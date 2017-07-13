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
      { id: -1, name: 'Seleccionar Local', isLabel: true },
      { id: 0, name: 'Todos los locales', parentId: -1 },
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

  constructor(public ws : WsService, public autService : AutService,
              private router: Router, private comunicacionService: ComunicacionService)
  {
    this.CargarLocales();
    this.CargarProductos();
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
    if (this.errorProductos = true)
    {
      this.errorProductos = null;
      this.CargarProductos();
    }
    if (this.errorLocales = true)
    {
      this.errorLocales = null;
      this.CargarLocales();
    }
    if (this.errorProductosLocales = true)
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
      
        this.myOptions.push({id: local.idLocal, name: local.direccion + ", " + local.localidad, parentId: -1});
      });
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

  HacerPedido(local, producto) {
    console.log(local);
    console.log(producto);
    this.router.navigate(["/locales"], { queryParams: { idProducto: producto.idProducto, idLocal : local.idLocal }});
  }

  EnviarAlCarrito(producto)
  {
    console.log("Envio al carrito...");
    //this.onAgregarAlCarrito.emit(producto);
    this.comunicacionService.EnviarAlCarrito(producto);
  }
}
