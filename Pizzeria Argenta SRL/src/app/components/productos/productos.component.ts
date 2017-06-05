import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

export class Producto
{
  constructor(public descripcion: string = "Grande de Muzzarella", public promocion : string = "", public tipo : string = "Pizza", public precio : number = 0, public img : string = "default.jpg", public locales : Array<string> = ["Callao...", "Magliaccio..."])
  {
      
  }
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productosBase : Array<Producto>;
  productos : Array<Producto>;

  dias: string[] = ["Domingo", "Lunes", "Martes", "Miercoles", "Juevez", "Viernes", "Sabado"];

  constructor(public ws : WsService, public autService : AutService)
  {
    this.CargarProductos();
  }

  ngOnInit() {
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
    .catch((error) => { console.log(error)} )
  }

  CargarLocalesPorProductos()
  {
    this.productosBase.forEach(producto => {
      producto.locales = ["Magliaccion 33XX, Glew.", "San Martin 78XX, Longchamps", "Mi Localidad 71XX, Adrogue"];
    });
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
      this. productos = this.productos.filter((item)=>{
        return item.tipo == "Combo";
    })
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

}
