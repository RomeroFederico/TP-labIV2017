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
  usuariosBase : any = null;

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
  }

  CargarUsuarios()
  {
    if (this.Comprobar() && this.ObtenerUsuario().tipo == 'Empleado')
    {
      this.ws.ObtenerClientes().then((data) => 
      {
        console.log(data);
        this.usuarios = data;
        this.usuarios.forEach(usuario => {
          usuario.estadoBase = usuario.estado;
        });
      }
      )
      .catch((error) => { this.error = true; console.log(error)} );
    }
    else if (this.Comprobar() && this.ObtenerUsuario().tipo == 'Encargado')
    {
      this.ws.ObtenerClientesYEmpleados(this.ObtenerUsuario().idUsuario).then((data) => 
      {
        console.log(data);
        this.usuarios = data;
        this.usuariosBase = data;
        this.usuarios.forEach(usuario => {
          usuario.estadoBase = usuario.estado;
        });
        this.Mostrar('Todos');
      }
      )
      .catch((error) => { this.error = true; console.log(error)} );
      }
  }

  ReintentarCargarUsuarios()
  {
    this.error = null;
    this.CargarUsuarios();
  }

  ComprobarSiSeModifico(usuario)
  {
    if (usuario.estado != usuario.estadoBase)
      return null;
    else
      return true;
  }

  // USADO POR ENCARGADO
  Modificar(usuario)
  {
    if (!confirm("Desea modificar al usuario " + usuario.apellido + " " + usuario.nombre + "?"))
      return;

    this.cargando = true;

    this.ws.ModificarUsuario(usuario).then((data) => {
      this.cargando = null;
      if (data.exito)
      {
        usuario.estadoBase = usuario.estado;
        alert("Usuario modificado con exito!!!");
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

  ObtenerUsuario()
  {
    return this.autService.getToken().usuario;
  }

  Comprobar()
  {
    return this.autService.isLogued();
  }
}
