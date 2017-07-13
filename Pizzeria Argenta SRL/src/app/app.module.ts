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
import { ComunicacionService }  from './services/comunicacion/comunicacion';
import { AutService } from './services/auth/aut.service';
import { VerificarJWTService } from './services/verificar-jwt/verificar-jwt.service';
import { VerificarJWT2Service } from './services/verificar-jwt2/verificar-jwt2.service';
import { JwtModule } from './jwt/jwt.module';
import { ProductosComponent } from './components/productos/productos.component';
import { LocalesComponent } from './components/locales/locales.component';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { GooglePlaceModule } from "angular2-google-place";
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { FileUploadModule } from 'ng2-file-upload';
import { PanelComponent } from './components/panel/panel.component';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AgregarUsuarioComponent } from './components/agregar-usuario/agregar-usuario.component';
import { ListaLocalesComponent } from './components/lista-locales/lista-locales.component';
import { AgregarLocalComponent } from './components/agregar-local/agregar-local.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';

import { RecaptchaModule } from 'ng-recaptcha';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'locales', component: LocalesComponent },
  { path: 'pedidos', component: PedidosComponent, canActivate: [VerificarJWTService], },
  { path: 'encuesta', component: EncuestaComponent, canActivate: [VerificarJWTService], },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [VerificarJWT2Service], },
  { path: 'lista-locales', component: ListaLocalesComponent, canActivate: [VerificarJWT2Service], },
  { path: 'estadisticas', component: EstadisticasComponent, canActivate: [VerificarJWT2Service], },
  { path: 'panel', component: PanelComponent, canActivate: [VerificarJWTService], },
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
    EncuestaComponent,
    PanelComponent,
    UsuariosComponent,
    AgregarUsuarioComponent,
    ListaLocalesComponent,
    AgregarLocalComponent,
    EstadisticasComponent
  ],
  imports: [
    RecaptchaModule.forRoot(),
    ChartsModule,
    Ng2SmartTableModule,
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
    ComunicacionService,
    WsService,
    AutService,
    VerificarJWTService,
    VerificarJWT2Service,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
