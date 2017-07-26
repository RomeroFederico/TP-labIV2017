import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws/ws.service';

import { CsvService } from "angular2-json2csv";

import jsPDF from 'jspdf';

export class Local
{
  constructor (public idLocal : number = 1,
               public idUsuario : number = 1,
               public img1 : string = "default.png",
               public img2 : string = "default.png",
               public img3 : string = "default.png",
               public direccionCompleta : string = "",
               public direccion : string = "",
               public localidad : string = "",
               public provincia : string = "",
               public pais : string = "",
               public capacidad : number = 1,
               public telefono : string = "")
  {

  }
}

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css'],
  providers: [CsvService]
})
export class EstadisticasComponent implements OnInit {

  seleccion : number = 1;
  cargando : boolean = null;

  // PEDIDOS POR LOCAL
  pedidosLocales : Array<{local : any, cantidad : any, monto : any, productos : any}> = null;
  errorPedidosLocales : boolean = null;
  
  public barChartOptions : any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true
            }
        }]
    },
    maintainAspectRatio: false
  };
  public labels1a : string[] = [];
  public tipo1a : string = 'bar';
  public leyenda1a : boolean = true;
 
  public data1a : any[] = [
    {data: [], label: 'Pedidos'},
    {data: [], label: 'Productos'}
  ];

  public labels1b : string[] = [];
  public tipo1b : string = 'doughnut';
 
  public data1b : any[] = [];

  totalPedidos : number = 0;
  totalMonto : number = 0;
  totalProductos : number = 0;

  mostrarBarra = null;

  //FIN PEDIDOS POR LOCAL

  // PEDIDOS POR USUARIOS

  pedidosUsuarios : Array<any> = null;
  errorPedidosUsuarios : boolean = null;

  totalPedidosUsuarios : number = 0;
  totalMontoUsuarios : number = 0;
  totalProductosUsuarios : number = 0;

  //FIN PEDIDOS POR USUARIOS

  // PEDIDOS POR DIAS

  pedidosDias : Array<any> = null;
  errorPedidosDias : boolean = null;

  totalPedidosDias : number = 0;
  totalMontoDias : number = 0;
  totalProductosDias : number = 0;

  public optionsDias : any = {
    responsive: true,
  };
  public labelsDias : string[] = [];
  public tipoDias : string = 'line';

  public leyendaDias : boolean = true;
 
  public dataDias : any[] = [
    {data: [], label: 'Pedidos'},
    {data: [], label: 'Productos'}
  ];
  public dataDias2 : any[] = [
    {data: [], label: 'Monto'}
  ];
  mostrarDias : boolean = null;

  mostrarMontosDias : boolean = true;

  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: '#FFE88C',
      borderColor: '#C3B009',
      pointBackgroundColor: '#FFE600',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];

  //FIN PEDIDOS POR DIAS

  // PEDIDOS POR PRODUCTOS
  pedidosProductos : Array<any> = null;
  errorPedidosProductos : boolean = null;

  mostrarTablaProductos : boolean = null;

  fechaLimiteInicial : string = "";
  fechaLimiteFinal : string = "";

  fechaInicial : string = "";
  fechaFinal : string = "";

  public pieChartLabels:string[] = [];
  public pieChartData:number[] = [];
  public pieChartType:string = 'pie';
  //FIN PEDIDOS POR PRODUCTOS

  encuestas : Array<any> = [];
  errorEncuestas : boolean = null;

  constructor(public ws : WsService, public csv : CsvService)
  {
    this.CargarTodosLosPedidos();
  }

  ngOnInit() {
    var hoy = new Date();
    var inicio = new Date("2017-06-18");
    this.fechaLimiteFinal = hoy.getFullYear() + "-" + (hoy.getMonth() < 10? "0" : "") +(hoy.getMonth() + 1) + "-" + (hoy.getDate() < 10? "0" : "") + hoy.getDate();
    this.fechaLimiteInicial = inicio.getFullYear() + "-" + (inicio.getMonth() < 10? "0" : "") +(inicio.getMonth() + 1) + "-" + (inicio.getDate() < 10? "0" : "") + inicio.getDate();
    this.fechaInicial = this.fechaLimiteInicial;
    this.fechaFinal = this.fechaLimiteFinal;
  }

  Mostrar(seleccion : number)
  {
    if (seleccion != this.seleccion)
    {
      this.seleccion = seleccion;

      if (seleccion == 1)
      {
        this.errorPedidosLocales = null;
        this.mostrarBarra = true;
        this.CargarTodosLosPedidos();
      }
      else if (seleccion == 2)
      {
        this.errorPedidosUsuarios = null;
        this.CargarTodosLosPedidosUsuarios();
      }
      else if (seleccion == 3)
      {
        this.errorPedidosDias = null;
        this.mostrarDias = null;
        this.mostrarMontosDias = true;
        this.CargarTodosLosPedidosPorDia();
      }
      else if (seleccion == 4)
      {
        this.errorPedidosProductos = null;
        this.fechaInicial = this.fechaLimiteInicial;
        this.fechaFinal = this.fechaLimiteFinal;
        this.mostrarTablaProductos = null;
        this.CargarTodosLosPedidosPorProductos();
      }
      else if (seleccion == 6)
      {
        this.errorEncuestas = null;
        this.CargarTodasLasEncuestas();
      }
    }
  }

  //1- VENTAS POR LOCAL
  CargarTodosLosPedidos()
  {
    this.cargando = true;

    this.ws.TraerTodosLosPedidos().then((pedidos) => {

      this.cargando = null;

      console.log(pedidos);
      this.FiltrarPedidos(pedidos);

    })
    .catch((error) => { this.cargando = null; this.errorPedidosLocales = true; console.log(error); })
  }

  ReintentarCargarTodosLosPedidos()
  {
    this.errorPedidosLocales = null;
    this.CargarTodosLosPedidos();
  }

  FiltrarPedidos(pedidos)
  {
    this.pedidosLocales = new Array<{local : any, cantidad : any, monto : any, productos : any}>();
    pedidos.forEach(pedido => {
      if (this.pedidosLocales[pedido.idLocal - 1] != undefined)
      {
        this.pedidosLocales[pedido.idLocal - 1].cantidad++;
        this.pedidosLocales[pedido.idLocal - 1].monto += Number(pedido.precioTotal);
        this.pedidosLocales[pedido.idLocal - 1].productos += Number(pedido.cantidad);
      }
      else
      {
        this.pedidosLocales[pedido.idLocal - 1] = {local: new Local(pedido.idLocal, pedido.idUsuario, pedido.img1, pedido.img2, pedido.img3,
                                                                "", pedido.direccion, pedido.localidad, pedido.provincia, pedido.pais,
                                                                pedido.capacidad, pedido.telefono),
                                              cantidad : 1, monto : Number(pedido.precioTotal), productos : Number(pedido.cantidad)};
      }
    });
    
    let pedidosArreglar = Array<any>();

    this.pedidosLocales.forEach(pedido => {
      if (pedido != undefined)
        pedidosArreglar.push(pedido);
    });

    this.pedidosLocales = pedidosArreglar;

    this.CalcularTotal();
    this.ConfigurarGrafico(1);
  }

  CalcularTotal()
  {
    this.totalProductos = 0;
    this.totalMonto = 0;
    this.totalPedidos = 0;

    this.pedidosLocales.forEach((detalle) => {
      this.totalProductos +=  Number(detalle.productos);
      this.totalMonto += Number(detalle.monto);
      this.totalPedidos += Number(detalle.cantidad);
    })
  }

  ConfigurarGrafico(opcion)
  {
    if (opcion == 1)
    {
      let data1 : any[] = [];
      let data2 : any[] = [];
      let data3 : any[] = [];

      this.labels1a = [];
      this.labels1b = [];

      this.pedidosLocales.forEach(detalle => {   
        this.labels1a.push('Local ' + detalle.local.idLocal);
        this.labels1b.push('Local ' + detalle.local.idLocal);
        //this.barChartOptions.backgroundColor.push(this.GenerarColor());
        data1.push(detalle.cantidad);
        data2.push(detalle.productos);
        data3.push(detalle.monto);
      });

      let clone = JSON.parse(JSON.stringify(this.data1a));

      clone[0].data = data1;
      clone[1].data = data2;

      this.data1a = clone;
      this.data1b = data3;

      this.mostrarBarra = true;
    }
  }

  CambiarGrafico()
  {
    if (this.mostrarBarra != null)
      this.mostrarBarra = null;
    else
      this.mostrarBarra = true;
  }

  // 2- VENTAS POR USUARIOS
  CargarTodosLosPedidosUsuarios()
  {
    this.cargando = true;

    this.ws.TraerTodosLosPedidosUsuarios().then((pedidos) => {

      this.cargando = null;

      console.log(pedidos);
      this.FiltrarPedidosUsuarios(pedidos);

    })
    .catch((error) => { this.cargando = null; this.errorPedidosUsuarios = true; console.log(error); })
  }

  ReintentarCargarTodosLosPedidosUsuarios()
  {
    this.errorPedidosUsuarios = null;
    this.CargarTodosLosPedidosUsuarios();
  }

  FiltrarPedidosUsuarios(pedidos)
  {
    this.pedidosUsuarios = new Array<any>();
    pedidos.forEach(pedido => {
      if (this.pedidosUsuarios[pedido.idCliente - 1] != undefined)
      {
        this.pedidosUsuarios[pedido.idCliente - 1].cantidad++;
        this.pedidosUsuarios[pedido.idCliente - 1].monto += Number(pedido.precioTotal);
        this.pedidosUsuarios[pedido.idCliente - 1].productos += Number(pedido.cantidad);
      }
      else
      {
        this.pedidosUsuarios[pedido.idCliente - 1] = {nombre: pedido.nombre, apellido: pedido.apellido, localidad: pedido.localidad, fechaPedido: pedido.fechaPedido, 
                                              cantidad : 1, monto : Number(pedido.precioTotal), productos : Number(pedido.cantidad)};
      }
    });

    let pedidosArreglar = Array<any>();

    this.pedidosUsuarios.forEach(pedido => {
      if (pedido != undefined)
        pedidosArreglar.push(pedido);
    });

    this.pedidosUsuarios = pedidosArreglar;

    this.CalcularTotalUsuarios();
  }

  CalcularTotalUsuarios()
  {
    this.totalProductosUsuarios = 0;
    this.totalMontoUsuarios = 0;
    this.totalPedidosUsuarios = 0;

    this.pedidosUsuarios.forEach((detalle) => {
      this.totalProductosUsuarios += detalle.productos;
      this.totalMontoUsuarios += detalle.monto;
      this.totalPedidosUsuarios += detalle.cantidad;
    })
  }

  // 3- Ventas por dias
  CargarTodosLosPedidosPorDia()
  {
    this.cargando = true;

    this.ws.TraerTodosLosPedidosUsuarios().then((pedidos) => {

      this.cargando = null;

      console.log(pedidos);

      pedidos.forEach(pedido => {
        pedido.fechaPedido = pedido.fechaPedido.split(" ")[0];
      });

      console.log(pedidos);

      this.FiltrarPedidosPorDia(pedidos);

    })
    .catch((error) => { this.cargando = null; this.errorPedidosDias = true; console.log(error); })
  }

  ReintentarCargarTodosLosPedidosDias()
  {
    this.errorPedidosDias = null;
    this.CargarTodosLosPedidosPorDia();
  }

  FiltrarPedidosPorDia(pedidos : Array<any>)
  {
    this.pedidosDias = new Array<any>();
    pedidos.forEach(pedido => {
      var resultadoBusqueda = this.pedidosDias.find((p) => { return pedido.fechaPedido == p.fechaPedido});

      if (resultadoBusqueda == undefined)
        this.pedidosDias.push({fechaPedido: pedido.fechaPedido, cantidad : 1,  monto : Number(pedido.precioTotal), productos : Number(pedido.cantidad)});
      else
      {
        resultadoBusqueda.cantidad++;
        resultadoBusqueda.monto += Number(pedido.precioTotal);
        resultadoBusqueda.productos += Number(pedido.cantidad);
      }
    });

    this.CalcularTotalDias();
    this.ConfigurarGraficoDias();
  }

  CalcularTotalDias()
  {
    this.totalProductosDias = 0;
    this.totalMontoDias = 0;
    this.totalPedidosDias = 0;

    this.pedidosDias.forEach((detalle) => {
      this.totalProductosDias += detalle.productos;
      this.totalMontoDias += detalle.monto;
      this.totalPedidosDias += detalle.cantidad;
    });

    console.log(this.pedidosDias);
  }

  ConfigurarGraficoDias()
  {
    let data1 : any = [];
    let data2 : any = [];
    let data3 : any = [];
    this.dataDias = [
      {data: [], label: 'Pedidos'},
      {data: [], label: 'Productos'}
    ];
    this.dataDias2 = [
      {data: [], label: 'Monto'}
    ];
    this.labelsDias = [];

    //var ultimoDia = this.pedidosDias[0].fechaPedido;
    var primerDia = this.pedidosDias[this.pedidosDias.length - 1].fechaPedido;

    var eventStartTime = new Date(primerDia);
    var eventEndTime = new Date();
    var duration = eventEndTime.valueOf() - eventStartTime.valueOf();

    //duration = new Date(duration).getDate();

    duration = 40;

    var indice = this.pedidosDias.length - 1;
    var fechaIndice = eventStartTime;

    for (var index = 0; index <= duration; index++) {

      var fechaIndiceFormateada = fechaIndice.getFullYear() + "-" + (fechaIndice.getMonth() < 10? "0" : "") +(fechaIndice.getMonth() + 1) + "-" + (fechaIndice.getDate() < 10? "0" : "") + fechaIndice.getDate();

      console.log(fechaIndiceFormateada);

      this.labelsDias.push(fechaIndiceFormateada);

      if (indice >= 0 && this.pedidosDias[indice].fechaPedido == fechaIndiceFormateada)
      {
        data1.push(this.pedidosDias[indice].cantidad);
        data2.push(this.pedidosDias[indice].productos);
        data3.push(this.pedidosDias[indice].monto);
        indice--;
      }
      else
      {
        data1.push(0);
        data2.push(0);
        data3.push(0);
      }

      fechaIndice.setDate(fechaIndice.getDate() + 1);
    }

    let clone = JSON.parse(JSON.stringify(this.dataDias));
    let clone2 = JSON.parse(JSON.stringify(this.dataDias2));

    clone[0].data = data1;
    clone[1].data = data2;
    clone2[0].data = data3;

    this.dataDias = clone;
    this.dataDias2 = clone2;

    console.log(this.dataDias);
    console.log(this.dataDias2);

    this.mostrarDias = true;
  }

  CambiarGraficoDias()
  {
    if (this.mostrarMontosDias != null)
      this.mostrarMontosDias = null;
    else
      this.mostrarMontosDias = true;
  }

  // 4- Ventas por productos
  CargarTodosLosPedidosPorProductos()
  {
    this.cargando = true;

    this.ws.TraerTodosLosPedidosProductos().then((pedidos) => {

      this.cargando = null;

      pedidos.forEach(pedido => {
        pedido.fechaPedido = pedido.fechaPedido.split(" ")[0];
      });

      console.log(pedidos);

      this.FiltrarPedidosPorProductos(pedidos);

    })
    .catch((error) => { this.cargando = null; this.errorPedidosProductos = true; console.log(error); })
  }

  ReintentarCargarTodosLosPedidosProductos()
  {
    this.errorPedidosProductos = null;
    this.CargarTodosLosPedidosPorProductos();
  }

  FiltrarPedidosPorProductos(pedidos : Array<any>)
  {
    this.pedidosProductos = new Array<any>();
    pedidos.forEach(pedido => {
      var resultadoBusqueda = this.pedidosProductos.find((p) => { return pedido.idProducto == p.idProducto});

      if (resultadoBusqueda == undefined)
      {
        this.pedidosProductos.push({idProducto: pedido.idProducto, descripcion: pedido.descripcion, tipo: pedido.tipo, total : 0, ventas : [{ fechaPedido: pedido.fechaPedido, cantidad: Number(pedido.cantidadProducto)}]});
      }
      else
      {
        var resultadoBusquedaFecha = resultadoBusqueda.ventas.find((v) => { return pedido.fechaPedido == v.fechaPedido});
        if (resultadoBusquedaFecha == undefined)
          resultadoBusqueda.ventas.push({ fechaPedido: pedido.fechaPedido, cantidad: Number(pedido.cantidadProducto)});
        else
        {
          resultadoBusquedaFecha.cantidad += Number(pedido.cantidadProducto);
        }
      }
    });

    console.log(this.pedidosProductos);

    this.CalcularTotalProductos("2017-06-17");
  }

  CalcularProductosPorFecha()
  {
    var eventStartTime = new Date(this.fechaInicial);

    var eventEndTime = new Date(this.fechaFinal);

    var duration = eventEndTime.valueOf() - eventStartTime.valueOf();

    if (duration <= 0)
    {
      alert("La fecha inicial debe ser menor a la final!!!");
    }

    this.CalcularTotalProductos(this.fechaInicial, this.fechaFinal);
  }

  CalcularTotalProductos(fecha1, fecha2 = "")
  {
    this.pieChartLabels = [];
    this.pieChartData = [];
    var eventStartTime = new Date(fecha1);

    if (fecha2 != "")
      var eventEndTime = new Date(fecha2);
    else 
      var eventEndTime = new Date();

    var duration = eventEndTime.valueOf() - eventStartTime.valueOf();

    duration = new Date(duration).getDate();

    var fechaIndice = eventStartTime;

    this.pedidosProductos.forEach(pedido => {
      pedido.total = 0;
      this.pieChartLabels.push(pedido.descripcion);
    });

    for (var index = 0; index <= duration; index++) {

      var fechaIndiceFormateada = fechaIndice.getFullYear() + "-" + (fechaIndice.getMonth() < 10? "0" : "") +(fechaIndice.getMonth() + 1) + "-" + (fechaIndice.getDate() < 10? "0" : "") + fechaIndice.getDate();

      this.pedidosProductos.forEach(pedido => {
        var resultadoBusquedaFecha = pedido.ventas.find((v) => { return fechaIndiceFormateada == v.fechaPedido});

        if (resultadoBusquedaFecha != undefined)
          pedido.total += resultadoBusquedaFecha.cantidad;
      });

      fechaIndice.setDate(fechaIndice.getDate() + 1);
    }

    this.pedidosProductos.forEach(pedido => {
      this.pieChartData.push(pedido.total);
    });

    this.pedidosProductos = this.pedidosProductos.sort((p1, p2) => { 
      if (p1.total < p2.total) {
        return 1;
      }

      if (p1.total > p2.total) {
          return -1;
      }

      return 0;  
    });

    this.mostrarTablaProductos = true;
    console.log(this.pedidosProductos);
  }

  CargarTodasLasEncuestas()
  {
    this.cargando = true;

    this.ws.TraerTodasLasEncuestas().then((encuestas) => {

      this.cargando = null;

      this.encuestas = encuestas;

      console.log(encuestas);
    })
    .catch((error) => { this.cargando = null; this.errorEncuestas = true; console.log(error); })
  }

  ReintentarCargarTodasLasEncuestas()
  {
    this.errorEncuestas = null;
    this.CargarTodasLasEncuestas();
  }

  // GenerarColor()
  // {
  //   var letters = '0123456789ABCDEF'.split('');
  //   var color = '#';
  //   for (var i = 0; i < 6; i++ ) {
  //       color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }

  GenerarArchivoCsv(opcion)
  {
    let imprimir = [];

    if (opcion == 1)
    {
      this.pedidosLocales.forEach(pedido => {
        imprimir.push({idLocal: pedido.local.idLocal, direccion: pedido.local.direccion, localidad: pedido.local.localidad, cantidad: pedido.cantidad, productos: pedido.productos, monto: pedido.monto})
      });
      this.csv.download(imprimir, "Pedidos por Local");
    }
    else if (opcion == 2)
    {
      // this.pedidosUsuarios.forEach(pedido => {
      //   imprimir.push({usuario: pedido.usuario.idLocal, direccion: pedido.local.direccion, localidad: pedido.local.localidad, cantidad: pedido.cantidad, productos: pedido.productos, monto: pedido.monto})
      // });
      this.csv.download(this.pedidosUsuarios, "Pedidos por Usuarios");
    }
    else if (opcion == 3)
      this.csv.download(this.pedidosDias, "Pedidos por Dias");
    else if (opcion == 4)
    {
      this.pedidosProductos.forEach(pedido => {
        imprimir.push({idProducto: pedido.idProducto, descripcion: pedido.descripcion, tipo: pedido.tipo, total: pedido.total, fechaInicial: this.fechaInicial, fechaFinal: this.fechaFinal});
      });
      this.csv.download(imprimir, "Pedidos por Productos");
    }
    else if (opcion == 6)
      this.csv.download(this.encuestas, "Encuestas");
  }

  GenerarArchivoPdf(opcion)
  {
    if (opcion == 1)
    {
      const elementToPrint = document.getElementById('imprimir1'); //The html element to become a pdf
      const pdf = new jsPDF();
      pdf.addHTML(elementToPrint, () => {
          pdf.save('Pedidos por Local.pdf');
      });
    }
    else if (opcion == 2)
    {
      const elementToPrint = document.getElementById('imprimir2'); //The html element to become a pdf
      const pdf = new jsPDF();
      pdf.addHTML(elementToPrint, () => {
          pdf.save('Pedidos por Usuarios.pdf');
      });
    }
    else if (opcion == 3)
    {
      const elementToPrint = document.getElementById('imprimir3'); //The html element to become a pdf
      const pdf = new jsPDF();
      pdf.addHTML(elementToPrint, () => {
          pdf.save('Pedidos por Dias.pdf');
      });
    }
    else if (opcion == 4)
    {
      const elementToPrint = document.getElementById('imprimir4'); //The html element to become a pdf
      const pdf = new jsPDF();
      pdf.addHTML(elementToPrint, () => {
          pdf.save('Pedidos por Productos.pdf');
      });
    }
    else if (opcion == 6)
    {
      const elementToPrint = document.getElementById('imprimir6'); //The html element to become a pdf
      const pdf = new jsPDF();
      pdf.addHTML(elementToPrint, () => {
          pdf.save('Encuestas.pdf');
      });
    }
  }

}
