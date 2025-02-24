import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonButtons, IonButton, IonIcon,
   IonGrid, IonRow, IonCol, IonCardHeader, IonCardTitle
} from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { IoniconsModule } from '../../common/modules/ionicons.module';
import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
    IonButtons, IonCard, IonGrid, IonRow, IonCol, IonCardHeader,
    IonCardTitle, FormsModule, IoniconsModule, CommonModule, HttpClientModule,
  ],
})
export class HomePage implements OnInit {
  clima: any = null; // Almacenar los datos del clima
  errorMensaje: string = ''; // Mensaje de error
  cargando: boolean = false;

  showStock: boolean = false;
  showOrdenes: boolean = false;
  showCupon: boolean = false;

  currentUser: any = null; // Almacenar el usuario actual

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // Añadido para refrescar la vista
    private location: Location
  ) {}

  ngOnInit() {
    this.obtenerClima();
    this.cargarUsuario(); // Cargar usuario desde localStorage
    this.evaluarCondiciones(); // Evaluar condiciones de los botones
  }

  // Función para obtener el usuario desde localStorage
  cargarUsuario() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser); // Parsear el JSON para obtener el objeto
    }
  }

    // Función para ir a la última ruta
    goBack() {
      this.location.back(); // Navega hacia atrás en el historial
    }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  navigateToExternal(url: string) {
    window.open(url, '_blank'); // '_blank' abre la URL en una nueva pestaña. Cambia a '_self' si quieres que sea en la misma pestaña.
  }


  obtenerClima() {
    navigator.geolocation.getCurrentPosition(
      (position) => this.obtenerClimaPorCoordenadas(position)
    );
  }

  obtenerClimaPorCoordenadas(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = '91bfc66c11a449d5b69185401241306'; // Reemplaza con tu clave de WeatherAPI

    this.http.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`)
      .subscribe(
        (data: any) => {
          this.clima = data; // Almacenar los datos del clima
          this.errorMensaje = ''; // Limpiar el mensaje de error
        },
        (error) => {
          console.error("Error al obtener el clima:", error);
          this.errorMensaje = 'No se pudo obtener el clima. Inténtalo más tarde.';
          this.clima = null; // Limpiar los datos del clima en caso de error
        }
      );
  }

 // Función para evaluar las condiciones de los botones
 evaluarCondiciones() {
  // Mostrar secciones solo si el usuario es "admin"
  if (this.currentUser?.tipo_usuario === 'admin') {
    this.showCupon = true;
    this.showStock = true;
    this.showOrdenes = true;
  }

  // Refrescar la vista
  this.cdr.detectChanges();
}
}
