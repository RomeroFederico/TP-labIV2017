import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { AutService } from '../../services/auth/aut.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  num = 1;
  num2 = 1;
  item1 = "item";
  item2 = "item";
  item3 = "item";

  active1 = "";
  active2 = "";
  active3 = "";

  locales : boolean = null;
  delivery : boolean = null;
  productos : boolean = null;
  
  constructor(public aut : AutService, public router : Router)
  {

  }

  ngOnInit() 
  {
    this.slider();
  }

  Comprobar()
  {
    return this.aut.isLogued();
  }

  ObtenerUsuario()
  {
    return this.aut.getToken().usuario;
  }

  IrA(opcion)
  {
    if (this.Comprobar() && this.ObtenerUsuario().tipo == "Administrador")
      return;
    else
    {
      if (opcion == "Locales")
        this.router.navigate(['/locales']);
      else if (opcion == "Pedidos")
        this.router.navigate(['/pedidos']);
      else
        this.router.navigate(['/productos']);
    }
  }
  
  cambiar(func)
  {
      switch(func)
      {
          case 1:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
      }
  }

  slider()
  {
      switch(this.num2)
      {
          case 1:
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.item1 = "item active";
            this.active1 = "active";
            this.num = 1;
            this.num2 = 2;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item3 = "item";
            this.active3 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.num = 2;
            this.num2 = 3;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
      }
      setTimeout(() => {
             this.slider();
      },
      3000);
  }


  anterior()
  {
      switch(this.num)
      {
          case 1:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
          case 2:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
          case 3:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
      }
  }

  posterior()
  {
      switch(this.num)
      {
          case 1:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item active";
            this.active2 = "active";
            this.item3 = "item";
            this.active3 = "";
            this.num = 2;
            this.num2 = 3;
            break;
          case 2:
            this.item1 = "item";
            this.active1 = "";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item active";
            this.active3 = "active";
            this.num = 3;
            this.num2 = 1;
            break;
          case 3:
            this.item1 = "item active";
            this.active1 = "active";
            this.item2 = "item";
            this.active2 = "";
            this.item3 = "item";
            this.active3 = "";
            this.num = 1;
            this.num2 = 2;
            break;
      }
  }

  Mostrar(elemento)
  {
    console.log(elemento);
    if (elemento == 1)
      this.locales = true;
    else if (elemento == 2)
      this.delivery = true;
    else
      this.productos = true;
  }

  NoMostrar(elemento)
  {
    console.log(elemento);
    if (elemento == 1)
      this.locales = null;
    else if (elemento == 2)
      this.delivery = null;
    else
      this.productos = null;
  }

}
