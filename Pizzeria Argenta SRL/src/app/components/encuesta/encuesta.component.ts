import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
})
export class EncuestaComponent implements OnInit {

  pregunta : Array<string> = new Array<string>(20);

  pizza : boolean = false;
  empanada : boolean = false;
  combo : boolean = false;

  calidad : number = 0;

  star : string = "☆";

  constructor() { }

  ngOnInit() {
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

}
