import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonMenu, IonMenuButton, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { Observable } from 'rxjs';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';

@Component({
  selector: 'app-cupon',
  templateUrl: './cupon.component.html',
  styleUrls: ['./cupon.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonTitle,
    IonIcon,
    IonMenu,
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    IonSpinner,
  ],
})
export class CuponComponent implements OnInit {
  cupons$: Observable<any[]>; // Observable para la lista de cupones
  cuponForm: FormGroup; // Formulario para crear/editar cupones
  editingCupon: any = null; // Almacena el cupón en edición
  loading: boolean = false; // Indica si una operación está en curso

  constructor(
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.cupons$ = this.firestoreService.getCupons();
    this.cuponForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      valor: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });
  }

  ngOnInit() {}

  // Crear o actualizar cupón
  async saveCupon() {
    if (this.cuponForm.invalid) {
      alert('Formulario no válido. Verifique los datos.');
      return;
    }

    const cuponData = this.cuponForm.value;
    this.loading = true;

    try {
      if (this.editingCupon) {
        await this.firestoreService.updateCupon(this.editingCupon.id, cuponData);
        this.editingCupon = null;
        alert('Cupón actualizado con éxito.');
      } else {
        await this.firestoreService.createCupon(cuponData);
        alert('Cupón creado con éxito.');
      }
      this.cuponForm.reset();
    } catch (error) {
      console.error('Error al guardar el cupón:', error);
      alert('Hubo un error al guardar el cupón.');
    } finally {
      this.loading = false;
    }
  }

  // Cargar datos del cupón para editar
  editCupon(cupon: any) {
    this.editingCupon = cupon;
    this.cuponForm.patchValue(cupon);
  }

  // Cancelar edición
  cancelEdit() {
    this.editingCupon = null;
    this.cuponForm.reset();
  }

  // Eliminar un cupón
  async deleteCupon(cuponId: string) {
    if (confirm('¿Está seguro de que desea eliminar este cupón?')) {
      this.loading = true;
      try {
        await this.firestoreService.deleteCupon(cuponId);
        alert('Cupón eliminado con éxito.');
      } catch (error) {
        console.error('Error al eliminar el cupón:', error);
        alert('Hubo un error al eliminar el cupón.');
      } finally {
        this.loading = false;
      }
    }
  }

  navigateToExternal(url: string) {
    window.open(url, '_blank'); // '_blank' abre la URL en una nueva pestaña. Cambia a '_self' si quieres que sea en la misma pestaña.
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
