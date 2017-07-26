import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  usuarios = null;

  cargando : boolean = null;
  registrar : boolean = null;
  error : boolean = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router)
  {
    this.CargarUsuarios();
  }

  ngOnInit() {
  }

  CargarUsuarios()
  {
    this.ws.ObtenerClientes().then((data) => 
    {
      console.log(data);
      this.usuarios = data;
    }
    )
    .catch((error) => { this.error = true; console.log(error)} );
  }

  ReintentarCargarUsuarios()
  {
    this.error = null;
    this.CargarUsuarios();
  }

  // USADO POR ENCARGADO
  Modificar(usuario)
  {
    if (!confirm("Desea modificar al cliente " + usuario.apellido + " " + usuario.nombre + "?"))
      return;

    this.cargando = true;

    this.ws.ModificarUsuario(usuario).then((data) => {
      this.cargando = null;
      if (data.exito)
      {
        usuario.tipoBase = usuario.tipo;
        usuario.estadoBase = usuario.estado;
        alert("Cliente modificado con exito!!!");
      }
      else
        alert(data.mensaje);
    })
    .catch((error) => { this.cargando = null; alert("Ocurrio un error en el servidor, vuelva a intentar"); console.log("Error"); })
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
      this.usuarios = null;
      this.registrar = null;
      this.CargarUsuarios();
    }
    else
    {
      this.registrar = null;
    }
  }

}
