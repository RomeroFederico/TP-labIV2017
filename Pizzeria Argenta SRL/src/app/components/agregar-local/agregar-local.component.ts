import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WsService } from '../../services/ws/ws.service';
import { AutService } from '../../services/auth/aut.service';

import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { IMultiSelectSettings } from 'angular-2-dropdown-multiselect';
import { IMultiSelectTexts } from 'angular-2-dropdown-multiselect';

import { FileUploader } from 'ng2-file-upload';

declare var google;

export class Local
{
  constructor (public idLocal : number = 1,
               public idUsuario : number = 1,
               public img1 : string = "default.png",
               public img2 : string = "default.png",
               public img3 : string = "default.png",
               public img1Anterior : string = "",
               public img2Anterior : string = "",
               public img3Anterior : string = "",
               public direccionCompleta : string = "",
               public direccion : string = "",
               public localidad : string = "",
               public provincia : string = "",
               public pais : string = "",
               public capacidad : number = 1,
               public telefono : string = "",
               public lat : number = 0,
               public lng : number = 0,
               public marcador : any = null,
               public gerente : Gerente = null,
               public productos : Array<any> = null,
               public empleados : Array<any> = null)
  {

  }
}

export class Gerente
{
  constructor (public idUsuario : number = 0,
               public nombre : string = "", 
               public apellido : string = "",
               public sexo : string = "", 
               public email : string = "", 
               public telefonoUsuario : string = "",
               public direccionUsuario : string = "", 
               public localidadUsuario : string = "", 
               public provinciaUsuario : string = "", 
               public paisUsuario : string = "", 
               public usuarioImg : string = "",
               public legajo : number = 0)
  {

  }
}

export class Producto
{
  constructor(public idProducto : number = 0,
              public descripcion: string = "Grande de Muzzarella",
              public promocion : string = "",
              public tipo : string = "Pizza",
              public precio : number = 0,
              public img : string = "default.jpg")
  {
      
  }
}

@Component({
  selector: 'app-agregar-local',
  templateUrl: './agregar-local.component.html',
  styleUrls: ['./agregar-local.component.css']
})
export class AgregarLocalComponent implements OnInit, Input, Output {

  direccion : string = "";

  local: Local = new Local();

  modifico : boolean = null;

  mensaje : string;
  mostrarMensaje : boolean = null;
  mensajeMostrar : string = "";
  mostrarError : boolean = null;
  mostrarInfo : boolean = null;

  cargando : boolean = null;

  cargandoPosicion : boolean = null;
  errorCargandoPosicion : boolean = null;

  vacioDireccion : boolean = null;
  vacioTelefono : boolean = null;
  vacioCapacidad : boolean = null;
  vacioProducto : boolean = null;
  vacioEncargado : boolean = null;
  vacioEmpleado : boolean = null;

  validarDireccion : boolean = null;

  productos : any = null;
  //usuarios : any = null;
  empleados : any = null;
  encargados : any = null;

  errorProductos : boolean = null;
  errorEncargados : boolean = null;
  errorEmpleados : boolean = null;

  noHayEmpleados : boolean = null;
  noHayEncargados : boolean = null;

  //Configuracion de los multiselect

  // Default selection
  optionsModelProductos: number[] = [];
  optionsModelEncargados: number[] = [];
  optionsModelEmpleados: number[] = [];

  // Settings configuration
  mySettings: IMultiSelectSettings = {
      showCheckAll: true,
      showUncheckAll: true,
      enableSearch: true,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-block',
      dynamicTitleMaxItems: 1,
      displayAllSelectedText: true,
      selectionLimit: 0,
      autoUnselect: false,
      closeOnSelect: false,
      maxHeight: '200px',
  };

  mySettings2: IMultiSelectSettings = {
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-block',
      dynamicTitleMaxItems: 1,
      displayAllSelectedText: true,
      selectionLimit: 1,
      autoUnselect: true,
      closeOnSelect: true,
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
      checkAll: 'Seleccionar todos',
      uncheckAll: 'Desmarcar todos',
      checked: 'Producto seleccionado',
      checkedPlural: 'Producto seleccionados',
      searchPlaceholder: 'Buscar',
      defaultTitle: 'Seleccionar al menos 1 producto',
      allSelected: 'Todos los productos',
  };

  myTexts2: IMultiSelectTexts = {
      checked: 'Encargado seleccionado',
      defaultTitle: 'Seleccionar',
  };

  myTexts3: IMultiSelectTexts = {
      checkAll: 'Seleccionar todos',
      uncheckAll: 'Desmarcar todos',
      checked: 'Empleado seleccionado',
      checkedPlural: 'Empleado seleccionados',
      searchPlaceholder: 'Buscar',
      defaultTitle: 'Seleccionar al menos 3 empleados',
      allSelected: 'Todos los empleados',
  };

  // Labels / Parents
  myOptions: IMultiSelectOption[] = [
      { id: 0, name: 'Seleccionar producto/s', isLabel: true }
  ];

  myOptions2: IMultiSelectOption[] = [
      { id: 0, name: 'Seleccionar encargado', isLabel: true }
  ];

  myOptions3: IMultiSelectOption[] = [
      { id: 0, name: 'Seleccionar empleado/s', isLabel: true }
  ];

  //Fin Configuracion de los multiselect

  //File upload

  public uploader1:FileUploader = new FileUploader({url: this.ws.url + "subir/locales/tmp"});
  public uploader2:FileUploader = new FileUploader({url: this.ws.url + "subir/locales/tmp"});
  public uploader3:FileUploader = new FileUploader({url: this.ws.url + "subir/locales/tmp"});

  public hasBaseDropZoneOver:boolean = false;
  public hasAnotherDropZoneOver:boolean = false;
  img1 : string = null;
  img2 : string = null;
  img3 : string = null;

  @ViewChild('myInput1')
  myInputVariable1: any;

  @ViewChild('myInput2')
  myInputVariable2: any;

  @ViewChild('myInput3')
  myInputVariable3: any;

  //Fin File upload

  constructor(private router: Router, private route: ActivatedRoute, 
              private ws: WsService, private aut : AutService)
  {
    console.log("Paso por el constructor de agregar local");
    this.CargarProductos();
    //this.CargarUsuarios();
    this.CargarEmpleadosLibres();
    this.CargarEncargadosLibres();

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

    this.uploader2.onBeforeUploadItem = (item) =>
    {
      console.info("item",item);
      item.withCredentials=false;
    }
    this.uploader2.onSuccessItem = (item, response) =>
    {
      var data = JSON.parse(response);

      this.cargando = null;

      if (data.exito)
      {
        this.img2 = data.imagenSubida;
        console.log(this.img2);
      }
      else
      {
        this.myInputVariable2.nativeElement.value = "";
        alert(data.mensaje);
      }
      this.uploader2.queue.pop();
    }

    this.uploader2.onErrorItem = (item, Response) =>
    {
      this.myInputVariable2.nativeElement.value = "";
      this.cargando = null;
      this.uploader2.queue.pop();
      alert("Error en imagen 2, vuelva a intentar");
      console.log("Error");
    }

    this.uploader3.onBeforeUploadItem = (item) =>
    {
      console.info("item",item);
      item.withCredentials=false;
    }
    this.uploader3.onSuccessItem = (item, response) =>
    {
      var data = JSON.parse(response);

      this.cargando = null;

      if (data.exito)
      {
        this.img3 = data.imagenSubida;
      }
      else
      {
        this.myInputVariable3.nativeElement.value = "";
        alert(data.mensaje);
      }
      this.uploader3.queue.pop();
    }

    this.uploader3.onErrorItem = (item, Response) =>
    {
      this.cargando = null;
      this.myInputVariable3.nativeElement.value = "";
      this.uploader3.queue.pop();
      alert("Error en imagen 3, vuelva a intentar");
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
      this.modifico = true;

      if (Object.keys(this.local.empleados).length != 0)
      {
        this.local.empleados.forEach(usuario => {
          this.myOptions3.push({id: usuario.idUsuario, name: usuario.legajo + ": " + usuario.apellido + ", " + usuario.nombre});
          this.optionsModelEmpleados.push(usuario.idUsuario);
        });
      }

      this.myOptions2.push({id: this.local.gerente.idUsuario, name: this.local.gerente.legajo + ": " + this.local.gerente.apellido + ", " + this.local.gerente.nombre});
      this.optionsModelEncargados.push(this.local.gerente.idUsuario);

      console.log(this.local);

      if (Object.keys(this.local.productos).length != 0)
      {
        this.local.productos.forEach(producto => {
          this.optionsModelProductos.push(producto.idProducto);
        });
      }

      this.direccion = this.local.direccionCompleta;
      this.local.img1Anterior = this.local.img1;
      this.local.img2Anterior = this.local.img2;
      this.local.img3Anterior = this.local.img3;
    }
  } 

  Subir(queImagen : number)
  {
    this.cargando = true;

    if (queImagen == 0)
    {
      this.uploader1.queue[0].upload();
    }
    else if (queImagen == 1)
    {
      this.uploader2.queue[0].upload();
    }
    else
    {
      this.uploader3.queue[0].upload();
    }
  }

  MostrarConsola(mensaje)
  {
    console.log(mensaje);
  }

  ValidarSoloNumeros(event, atributo)
  {
    let newText: string = event.target.value;
    if (/^\d+$/.test(newText) || newText == "") {
      if (atributo == "Telefono")
        this.local.telefono = newText;
      else
        this.local.capacidad = Number(newText);
    }
    else {
      if (atributo == "Telefono")
        event.target.value = this.local.telefono;
      else
        event.target.value = this.local.capacidad;
    }
  }

  ValidarDireccion()
  {
    this.cargando = true;

    this.ws.getlatlng(this.direccion).then((value) => {

      console.log(value);

      if (value.results.length == 0)
      {
        this.mostrarInfo = true;
        this.mensaje = "Direccion invalida. "; 
        this.validarDireccion = true;
        this.cargando = null;
      }
      else
      {
        console.log("Validado!!!!");
        if (this.modifico == null)
          this.RegistrarUsuario();
        else
          this.ModificarLocal();
      }
    })
    .catch((error) => { this.cargando = null; console.log("Error"); });
  }

  Registrarse()
  {
    this.mostrarError = null;
    this.mostrarMensaje = null;
    this.mostrarInfo = null;

    this.vacioDireccion = null;
    this.vacioTelefono = null;
    this.vacioCapacidad = null;
    this.vacioProducto = null;
    this.vacioEncargado = null;
    this.vacioEmpleado = null;

    this.validarDireccion = null;

    if (this.direccion == "")
      this.vacioDireccion = true;
      
    if (this.local.telefono == "")
      this.vacioTelefono = true;

    if (this.local.capacidad == 0)
      this.vacioCapacidad = true;

    if (this.optionsModelProductos.length == 0)
      this.vacioProducto = true;

    if (this.optionsModelEncargados.length == 0)
      this.vacioEncargado = true;

    if (this.optionsModelEmpleados.length < 3)
      this.vacioEmpleado = true;

    if (this.vacioDireccion != null || this.vacioTelefono != null || this.vacioCapacidad != null || this.vacioProducto != null || this.vacioEncargado != null || this.vacioEmpleado != null)
    {
      this.mostrarInfo = true;
      this.mensaje = "Complete los campos para continuar. ";
      return;
    }

    if (!(confirm("¿Desea " + (this.modifico != null? "modificar" : "registrar") + " el local con estos datos?")))
      return;
    
    this.ValidarDireccion();
  }

  ObtenerDireccionUsuario()
  {
    this.cargandoPosicion = true;

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => 
      {
        this.cargandoPosicion = null;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var latlng = new google.maps.LatLng(lat, lng);
        this.ObtenerDireccion(lat, lng);
      }, 
      (error) => { /*this.cargandoPosicion = null; this.errorCargandoPosicion = true;*/ this.AlternativaMarcarUsuario(); console.log(error + ". Reintentando en alernativa... "); }, 
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
    };
  }

  // Error de Google
  AlternativaMarcarUsuario()
  {
    this.ws.ObtenerPosicion().then((data) => {

      this.cargandoPosicion = null;
      var lat = data.lat;
      var lng = data.lon;
      var latlng = new google.maps.LatLng(lat, lng);
      this.ObtenerDireccion(lat, lng);

    })
    .catch ((error) => { this.cargandoPosicion = null; this.errorCargandoPosicion = true; console.log(error); } )
  }

  /**
  * Obtengo la direccion del usuario.
  */
  ObtenerDireccion(lat, lng)
  {
    this.ws.getDireccion(lat, lng)
    .then((data) => { 
      this.direccion = data.results[0].formatted_address;
    })
    .catch((error) => { console.log(error); });
  }

  ReintentarObtenerDireccionUsuario()
  {
    this.errorCargandoPosicion = null;
    this.ObtenerDireccionUsuario();
  }

  RegistrarUsuario()
  {
    console.log("Ok");

    let direccion = this.direccion.split(", ");
    this.local.direccion = direccion[0];
    this.local.localidad = direccion[1];
    this.local.provincia = direccion[2];
    this.local.pais = direccion[3];

    if (this.img1 != null)
      this.local.img1 = this.img1;

    if (this.img2 != null)
      this.local.img2 = this.img2;

    if (this.img3 != null)
      this.local.img3 = this.img3;

    this.local.idUsuario = this.optionsModelEncargados[0];
    this.local.productos = this.optionsModelProductos;
    this.local.empleados = this.optionsModelEmpleados;

    console.log(this.local);

    this.ws.RegistrarLocal(this.local).then( data => {
      console.log("Accediendo al servidor...");
      this.cargando = null;
      if (data.exito)
      {
        alert("Local registrado con exito!!!");
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

  ModificarLocal()
  {
    let direccion = this.direccion.split(", ");
    this.local.direccion = direccion[0];
    this.local.localidad = direccion[1];
    this.local.provincia = direccion[2];
    this.local.pais = direccion[3];

    if (this.img1 != null)
      this.local.img1 = this.img1;

    if (this.img2 != null)
      this.local.img2 = this.img2;

    if (this.img3 != null)
      this.local.img3 = this.img3;

    this.local.idUsuario = this.optionsModelEncargados[0];
    this.local.productos = this.optionsModelProductos;
    this.local.empleados = this.optionsModelEmpleados;

    console.log(this.local);

    this.ws.ModificarLocal(this.local).then( data => {
      console.log("Accediendo al servidor...");
      console.log(data);
      this.cargando = null;
      if (data.exito)
      {
        alert("Local modificado con exito!!!");
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
    if (confirm("Desea cancelar " + (this.modifico != null? "la modificacion" : "el registro") + " del local?"))
      this.onRegistrado.emit(false);
  }

  CargarProductos()
  {
    this.ws.ObtenerProductos().then((data) => 
    {
      this.productos = data;

      this.productos.forEach(producto => {
        this.myOptions.push({id: producto.idProducto, name: producto.descripcion});
      });
    }
    )
    .catch((error) => { this.errorProductos = true; console.log(error); } );
  }

  ReintentarCargaProductos()
  {
    this.errorProductos = null;
    this.CargarProductos();
  }

  CargarEmpleadosLibres()
  {
    this.ws.ObtenerEmpleadosLibres().then((data) => 
    {
      console.log(data);
      if (data == false || Object.keys(data).length === 0)
      {
        if (this.myOptions3.length == 1)
          this.noHayEmpleados = true;
        else
          this.empleados = this.local.empleados;
      }
      else
      {
        this.empleados = data;
        this.empleados.forEach(usuario => {
          this.myOptions3.push({id: usuario.idUsuario, name: usuario.legajo + ": " + usuario.apellido + ", " + usuario.nombre});
        });
      }
    }
    )
    .catch((error) => { this.errorEmpleados = true; console.log(error); } );
  }

  CargarEncargadosLibres()
  {
    this.ws.ObtenerEncargadosLibres().then((data) => 
    {
      console.log(data);
      if (data == false || Object.keys(data).length === 0)
      {
        if (this.myOptions2.length == 1)
          this.noHayEncargados = true;
        else
          this.encargados = [this.local.gerente];
      }
      else
      {
        this.encargados = data;
        this.encargados.forEach(usuario => {
          this.myOptions2.push({id: usuario.idUsuario, name: usuario.legajo + ": " + usuario.apellido + ", " + usuario.nombre});
        });
      }
    }
    )
    .catch((error) => { this.errorEncargados = true; console.log(error); } );
  }

  ReintentarCargarEmpleadosLibres()
  {
    this.errorEmpleados = null;
    this.CargarEmpleadosLibres();
  }

  ReintentarCargarEncargadosLibres()
  {
    this.errorEncargados = null;
    this.CargarEncargadosLibres();
  }

}
