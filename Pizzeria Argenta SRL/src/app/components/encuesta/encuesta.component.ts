import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CsvService } from "angular2-json2csv";
import { WsService } from '../../services/ws/ws.service';

import { FileUploader } from 'ng2-file-upload';

//import jsPDF from 'jspdf';

export class Encuesta
{
  constructor(public pregunta1 : string = "",
              public pregunta2 : string = "",
              public pregunta3 : string = "",
              public pregunta4 : string = "",
              public pregunta5 : string = "",
              public pregunta6 : string = "",
              public pregunta7 : string = "",
              public pregunta8 : string = "",
              public pregunta9 : string = "",
              public pregunta10 : string = "",
              public pregunta11 : string = "",
              public pregunta12 : string = "",
              public pregunta13 : string = "",
              public pregunta14 : string = "",
              public pregunta15 : string = "",
              public pregunta16 : string = "",
              public pregunta17 : string = "",
              public pregunta18 : string = "",
              public pregunta19 : string = "",
              public pregunta20 : string = "",
              public img1 : string = "",
              public img2 : string = "",
              public img3 : string = ""
              )
  {

  }
}

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css'],
  providers: [CsvService],
})
export class EncuestaComponent implements OnInit {

  pregunta : Array<string> = new Array<string>(20);

  pizza : boolean = false;
  empanada : boolean = false;
  combo : boolean = false;

  calidad : number = 0;

  star : string = "☆";

  cargandoEncuesta : boolean = null;
  mensajeEnviar : string = "Enviar";
  encuestaCompleta : boolean = null;

  public uploader1:FileUploader = new FileUploader({url: this.ws.url + "subir/encuesta/tmp"});
  public uploader2:FileUploader = new FileUploader({url: this.ws.url + "subir/encuesta/tmp"});
  public uploader3:FileUploader = new FileUploader({url: this.ws.url + "subir/encuesta/tmp"});

  public hasBaseDropZoneOver:boolean = false;
  public hasAnotherDropZoneOver:boolean = false;
  img1 : string = null;
  img2 : string = null;
  img3 : string = null;

  subiendo : boolean = null;

  @ViewChild('myInput1')
  myInputVariable1: any;

  @ViewChild('myInput2')
  myInputVariable2: any;

  @ViewChild('myInput3')
  myInputVariable3: any;

  constructor(public csv : CsvService, public ws : WsService,
              private router: Router)
  {
    for (var index = 0; index < 20; index++)
    {
      this.pregunta[index] = "";
    }

    console.log(this.pregunta);
  }

  ngOnInit() 
  {
    this.uploader1.onBeforeUploadItem = (item) =>
    {
      console.info("item",item);
      item.withCredentials=false;
    }
    this.uploader1.onSuccessItem = (item, response) =>
    {
      var data = JSON.parse(response);

      this.subiendo = null;

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
      this.subiendo = null;
      this.uploader1.queue.pop();
      alert("Error en imagen opcional 1, vuelva a intentar");
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

      this.subiendo = null;

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
      this.subiendo = null;
      this.uploader2.queue.pop();
      alert("Error en imagen opcional 2, vuelva a intentar");
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

      this.subiendo = null;

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
      this.subiendo = null;
      this.myInputVariable3.nativeElement.value = "";
      this.uploader3.queue.pop();
      alert("Error en imagen opcional 3, vuelva a intentar");
      console.log("Error");
    }
  }

  Subir(queImagen : number)
  {
    this.subiendo = true;

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

  MarcarCalidad(calidad)
  {
    this.calidad = calidad;
  }

  CambiarEstrella(opcion)
  {
    if (opcion == 1)
      this.star = "☆";
    else
      this.star = "★";
  }

  LimpiarEncuesta()
  {
    this.pregunta = new Array<string>(20);
    this.star = "☆";
    this.pizza = false;
    this.empanada = false;
    this.combo = false;
    this.calidad = 0;
    this.img1 = null;
    this.img2 = null;
    this.img3 = null;
    this.myInputVariable1.nativeElement.value = "";
    this.myInputVariable2.nativeElement.value = "";
    this.myInputVariable3.nativeElement.value = "";
  }

  CancelarEncuesta()
  {
    if (confirm("¿Desea cancelar la encuesta?"))
      this.Volver();
  }

  Volver()
  {
    this.router.navigateByUrl("pedidos");
  }

  GenerarEncuesta()
  {
    var pregunta6 = "";
    if (this.pizza)
      pregunta6 = pregunta6 + "Pizza";
    if (this.empanada)
      pregunta6 = pregunta6 + "-Empanada";
    if (this.combo)
      pregunta6 = pregunta6 + "-Combo";

    this.pregunta[5] = pregunta6;
    this.pregunta[6] = this.calidad > 0? this.calidad.toString() : "";

    try {
      this.pregunta[18] = this.pregunta[18].toString();
    }
    catch (error)
    {
      this.pregunta[18] = "";
    }

    var preguntas = this.pregunta;

    if (!this.ValidarEncuesta(preguntas))
    {
      alert("Complete todos los campos correctamente!!!");
      return;
    }
    else if (!confirm("Desea enviar la encuesta? "))
      return;

    var miEncuesta : Encuesta = new Encuesta();

    miEncuesta.pregunta1 = preguntas[0];
    miEncuesta.pregunta2 = preguntas[1];
    miEncuesta.pregunta3 = preguntas[2];
    miEncuesta.pregunta4 = preguntas[3];
    miEncuesta.pregunta5 = preguntas[4];
    miEncuesta.pregunta6 = preguntas[5];
    miEncuesta.pregunta7 = preguntas[6];
    miEncuesta.pregunta8 = preguntas[7];
    miEncuesta.pregunta9 = preguntas[8];
    miEncuesta.pregunta10 = preguntas[9];
    miEncuesta.pregunta11 = preguntas[10];
    miEncuesta.pregunta12 = preguntas[11];
    miEncuesta.pregunta13 = preguntas[12];
    miEncuesta.pregunta14 = preguntas[13];
    miEncuesta.pregunta15 = preguntas[14];
    miEncuesta.pregunta16 = preguntas[15];
    miEncuesta.pregunta17 = preguntas[16];
    miEncuesta.pregunta18 = preguntas[17];
    miEncuesta.pregunta19 = preguntas[18];
    miEncuesta.pregunta20 = preguntas[19];

    if (this.img1 != null)
      miEncuesta.img1 = this.img1;
    if (this.img2 != null)
      miEncuesta.img2 = this.img2;
    if (this.img3 != null)
      miEncuesta.img3 = this.img3;

    this.cargandoEncuesta = true;
    this.mensajeEnviar = "Enviando..."

    this.ws.GuardarEncuesta(miEncuesta).then((data) => {
      this.cargandoEncuesta = null;
      this.mensajeEnviar = "Enviar";
      this.encuestaCompleta = true;
      console.log(data);
    })
    .catch((error) => { this.cargandoEncuesta = null; this.mensajeEnviar = "Enviar"; console.log(error); });
  }

  ValidarEncuesta(preguntas : Array<string>)
  {
    if (Number(preguntas[18]) < 0)
      return false;

    for (var index = 0; index < preguntas.length; index++)
      if (preguntas[index] == "")
        return false;
    return true;
  }

  GenerarArchivo()
  {
    // console.log("Imprimo");

    //this.csv.download([encuesta], "Encuesta");

    // let doc = new jsPDF();

    // // Add a title to your PDF
    // doc.setFontSize(30); 
    // doc.text(12, 10, "Your Title");

    // Create your table here (The dynamic table needs to be converted to canvas).
    //let element = <HTMLScriptElement>document.getElementById("imprimir")[0];
    // let element = document.body;
    // html2canvas(element)
    // .then((canvas: any) => {
    //     doc.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 0, 50, doc.internal.pageSize.width, element.offsetHeight / 5 );
    //     doc.save(`Report-${Date.now()}.pdf`);
    // })
    // html2canvas(document.body).then(function(canvas) {
    //     document.body.appendChild(canvas);
    // });

    // const elementToPrint = document.getElementById('imprimir'); //The html element to become a pdf
    // const pdf = new jsPDF();
    // pdf.addHTML(elementToPrint, () => {
    //     pdf.save('web.pdf');
    // });
  }
 
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
 
  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }

  MostrarConsola(mensaje)
  {
    console.log(mensaje);
  }

}
