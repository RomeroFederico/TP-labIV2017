import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { FileUploader } from 'ng2-file-upload';

export class Producto
{
  constructor(public idProducto : number = 0,
              public descripcion: string = "",
              public promocion : string = "Lunes",
              public tipo : string = "Pizza",
              public precio : number = 0,
              public img : string = "default.png",
              public idLocal : number = 0)
  {
      
  }
}

@Component({
  selector: 'app-agregar-producto',
  templateUrl: './agregar-producto.component.html',
  styleUrls: ['./agregar-producto.component.css']
})
export class AgregarProductoComponent implements OnInit, Input, Output {

  producto : Producto = new Producto();
  local : any = null;

  modifico : boolean = null;

  mensaje : string;
  mostrarMensaje : boolean = null;
  mensajeMostrar : string = "";
  mostrarError : boolean = null;
  mostrarInfo : boolean = null;

  vacioPrecio : boolean = null;
  vacioDescripcion : boolean = null;

  cargando : boolean = null;

  //File upload

  public uploader1:FileUploader = new FileUploader({url: this.ws.url + "subir/productos/tmp"});
  public uploader2:FileUploader = new FileUploader({url: this.ws.url + "subir/productos/tmp"});
  public uploader3:FileUploader = new FileUploader({url: this.ws.url + "subir/productos/tmp"});

  public hasBaseDropZoneOver:boolean = false;
  public hasAnotherDropZoneOver:boolean = false;
  img1 : string = null;
  img2 : string = null;
  img3 : string = null;

  @ViewChild('myInput1')
  myInputVariable1: any;

  //Fin File upload

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
    this.uploader1.onBeforeUploadItem = (item) =>
    {
      console.info("item",item);
      item.withCredentials=false;
    }
    this.uploader1.onSuccessItem = (item, response) =>
    {
      var data = JSON.parse(response);

      this.cargando = null;

      if (data.exito)
      {
        this.img1 = data.imagenSubida;
        console.log(this.img1);
      }
      else
      {
        this.myInputVariable1.nativeElement.value = "";
        alert(data.mensaje);
      }
      this.uploader1.queue.pop();
    }

    this.uploader1.onErrorItem = (item, Response) =>
    {
      this.myInputVariable1.nativeElement.value = "";
      this.cargando = null;
      this.uploader1.queue.pop();
      alert("Error en imagen 1, vuelva a intentar");
      console.log("Error");
    }
  }

  ngOnInit() {
  }

  @Output() onRegistrado = new EventEmitter<any>();

  @Input()

  set Local(local : any)
  {
    if (local != null)
    {
      this.local = local;
    }
  }

  @Input()

  set Producto(producto : any)
  {
    if (producto != null)
    {
      this.modifico = true;
      this.producto = producto;
    }
  }

  Subir()
  {
    this.cargando = true;

    this.uploader1.queue[0].upload();
  }

  MostrarConsola(mensaje)
  {
    console.log(mensaje);
  }

  Registrarse()
  {
    this.mostrarError = null;
    this.mostrarMensaje = null;
    this.mostrarInfo = null;

    this.vacioDescripcion = null;
    this.vacioPrecio = null;

    if (this.producto.descripcion == "")
      this.vacioDescripcion = true;
      
    if (this.producto.precio <= 0)
      this.vacioPrecio = true;

    if (this.vacioDescripcion != null || this.vacioPrecio != null)
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      return;
    }

    if (!(confirm("¿Desea " + (this.modifico != null? "modificar" : "registrar") + " el producto con estos datos?")))
      return;
    
    if (this.modifico != null)
      this.ModificarProducto();
    else
      this.RegistrarProducto();
  }

  RegistrarProducto()
  {
    console.log("Ok");

    if (this.img1 != null)
      this.producto.img = this.img1;

    this.producto.idLocal = this.local.idLocal;

    console.log(this.producto);

    this.cargando = true;

    this.ws.RegistrarProducto(this.producto).then( data => {
      console.log("Accediendo al servidor...");
      this.cargando = null;
      console.log(data);
      if (data.exito)
      {
        alert("Producto registrado con exito!!!");
        this.onRegistrado.emit(true);
      }
      else
      {
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
      }
    })
    .catch( e => {
      this.cargando = null;
      this.mostrarError = true;
      console.log(e);
    } );
  }

  ModificarProducto()
  {
    if (this.img1 != null)
      this.producto.img = this.img1;

    this.producto.idLocal = this.local.idLocal;

    this.cargando = true;

    this.ws.ModificarProducto(this.producto).then( data => {
      console.log("Accediendo al servidor...");
      console.log(data);
      this.cargando = null;
      if (data.exito)
      {
        alert("Producto modificado con exito!!!");
        this.onRegistrado.emit(true);
      }
      else
      {
        this.mensajeMostrar = data.mensaje;
        this.mostrarMensaje = true;
      }
    })
    .catch( e => {
      this.cargando = null;
      this.mostrarError = true;
      console.log(e);
    } );
  }

  CancelarRegistro()
  {
    if (confirm("Desea cancelar " + (this.modifico != null? "la modificacion" : "el registro") + " del producto?"))
      this.onRegistrado.emit(false);
  }

}
