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

    console.log(this.usuarios);
  }

}
