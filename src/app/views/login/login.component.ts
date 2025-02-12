import {
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToolbar,
  IonIcon,
  IonTitle,
  IonHeader,  AlertController,
} from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonTitle,
    IonIcon,
    IonToolbar,
    IoniconsModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButton
  ],
})
export class LoginComponent implements OnInit{

  email: string;
  password: string;
  showPassword: boolean = false;

  currentUser: any  = null;


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router,
    private alertController: AlertController,
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser); // Parsear el JSON para obtener el objeto
    }
  }

  async login() {
    try {
      const userCredential = await this.authService.login(this.email, this.password);
      const user = await this.firestoreService.getUserByEmail(this.email);
      this.redirectUser(user);
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Password o Email incorrectos',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async loginWithGoogle() {
    try {
      // Llama a la función `signInWithGoogle()` en `authService`
      const userCredential = await this.authService.signInWithGoogle();
      const user = await this.firestoreService.getUserByEmail(userCredential.user.email);

      // Redirige al usuario a la página correcta
      this.redirectUser(user);

      // Muestra una alerta de éxito
      await this.showAlert('Éxito', 'Inicio de sesión con Google exitoso');
    } catch (error) {
      // Maneja el error mostrando una alerta
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Credenciales incorrectas',
        buttons: ['OK']
      });
      await alert.present();
    }
  }


  redirectUser(user: any) {
    if (user) {
      switch (user.tipo_usuario) {
        case 'admin':
          this.router.navigate(['/home']);
          break;
        default:
          this.showAlert('Error', 'Tipo de usuario desconocido');
      }
    } else {
      this.showAlert('Error', 'Usuario no encontrado');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

}
