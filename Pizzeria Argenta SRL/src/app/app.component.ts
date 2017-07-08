import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  principal = "";
  mostrarCarrito = null;
  title = 'app works!';

  mostrarBorrar = null;

  CapturarEventoMostrarCarrito()
  {
    if (this.mostrarCarrito != null)
    {
      this.mostrarCarrito = null;
      this.principal = "";
    }
    else
    {
      this.principal = "col-sm-9";
      this.mostrarCarrito = true;
    }
  }
}
