import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { HomeComponent } from './components/home/home.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { LoginComponent } from './components/login/login.component';
import { WsService }  from './services/ws/ws.service';
import { AutService } from './services/auth/aut.service';
import { VerificarJWTService } from './services/verificar-jwt/verificar-jwt.service';
import { JwtModule } from './jwt/jwt.module';
import { ProductosComponent } from './components/productos/productos.component';
import { LocalesComponent } from './components/locales/locales.component';

import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { GooglePlaceModule } from "angular2-google-place";
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { FileUploadModule } from 'ng2-file-upload';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'locales', component: LocalesComponent },
  { path: 'pedidos', component: PedidosComponent, canActivate: [VerificarJWTService], },
  { path: 'encuesta', component: EncuestaComponent, canActivate: [VerificarJWTService], },
  { path: 'login', component: LoginComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: HomeComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    HomeComponent,
    PedidosComponent,
    LoginComponent,
    ProductosComponent,
    LocalesComponent,
    EncuestaComponent
  ],
  imports: [
    FileUploadModule,
    GooglePlaceModule,
    MultiselectDropdownModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    JwtModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    WsService,
    AutService,
    VerificarJWTService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
