import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios = null;
  usuariosBase = null;

  cargando : boolean = null;
  registrar : boolean = null;

  constructor(public ws : WsService, public autService : AutService,
              private router: Router)
  {
    this.CargarUsuarios();
  }

  ngOnInit() {
  }

  CargarUsuarios()
  {
    this.ws.ObtenerUsuarios().then((data) => 
    {
      console.log(data);
      this.usuariosBase = data.filter((item) => {
        return item.tipo != "Administrador";
      })
      this.usuariosBase.forEach(usuario => {
        usuario.estadoBase = usuario.estado;
        usuario.tipoBase = usuario.tipo;
      });
      this.Mostrar('Todos');
    }
    )
    .catch((error) => { console.log(error)} );
  }

  Mostrar(opcion)
  {
    this.usuarios = this.usuariosBase;

    if (opcion == 'Cliente')
      this.usuarios = this.usuarios.filter((item)=>{
        return item.tipo == "Cliente";
      })
    else if (opcion == 'Empleado')
      this.usuarios = this.usuarios.filter((item)=>{
        return item.tipo == "Empleado";
      })
    else if (opcion == 'Encargado')
      this.usuarios = this.usuarios.filter((item)=>{
        return item.tipo == "Encargado";
    })
  }

  Modificar(usuario)
  {
    if (!confirm("Desea modificar al usuario " + usuario.apellido + " " + usuario.nombre + "?"))
      return;

    this.cargando = true;

    this.ws.ModificarUsuario(usuario).then((data) => {
      this.cargando = null;
      if (data.exito)
      {
        usuario.tipoBase = usuario.tipo;
        usuario.estadoBase = usuario.estado;
        alert("Usuario modificado con exito!!!");
      }
      else
        alert(data.mensaje);
    })
    .catch((error) => { this.cargando = null; alert("Ocurrio un error en el servidor, vuelva a intentar"); console.log("Error"); })
  }

  Comprobar(usuario)
  {
    if (!(usuario.tipo == usuario.tipoBase && usuario.estado == usuario.estadoBase))
      return null;
    else
      return true;
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
      this.usuariosBase = null;
      this.registrar = null;
      this.CargarUsuarios();
    }
    else
    {
      this.registrar = null;
    }
  }

}
