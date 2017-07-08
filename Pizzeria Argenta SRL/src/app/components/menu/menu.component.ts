import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AutService } from '../../services/auth/aut.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, Input, Output {

  constructor(private router: Router, public autService : AutService) { }

  ngOnInit() {
  }

  @Output() onMostrarCarrito = new EventEmitter<any>();

  salir()
  {
    if (confirm("¿Desea cerrar la sesion actual?"))
    {
      localStorage.setItem('token', null);
      window.alert('Sesion cerrada!!!');
      this.router.navigate(['/login']);
    }
  }

  Comprobar()
  {
    return this.autService.isLogued();
  }

  ObtenerUsuario()
  {
    return this.autService.getToken().usuario;
  }

  ToggleCarrito()
  {
    this.onMostrarCarrito.emit(true);
  }
}
