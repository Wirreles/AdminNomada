import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { IonButtons, ModalController, LoadingController ,IonHeader, IonItem,IonLabel,
  IonInput, IonSelect, IonSelectOption, IonButton, IonList, IonSpinner, IonIcon, IonToolbar,
  IonMenuButton, IonTitle, IonCard, IonContent, IonRow, IonGrid, IonCol, IonCardHeader,
   IonCardTitle, IonCardContent, IonMenu, MenuController  } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Producto } from 'src/app/common/models/producto.models';
import { AuthService } from 'src/app/common/services/auth.service';
@Component({
  selector: 'app-control-stock',
  templateUrl: './control-stock.component.html',
  styleUrls: ['./control-stock.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader,
     IonItem,IonLabel,IonInput, IonSelect,IonSelectOption, IonButton,IonList,
    IonButtons, IonSpinner, IonIcon,IonToolbar,IonMenuButton,IonTitle,IonCard,IonContent,
    IonRow,IonGrid,IonCol,IonCardHeader,IonCardTitle,IonCardContent, IonMenu]
})
export class ControlStockComponent implements OnInit {
  stockItems$: Observable<Producto[]> = new Observable<Producto[]>();

  nuevoItem: Producto = {
    id: '',
    tipo_isla: '',
    nombre: '',
    imagen: '',
    descrip_corta: '',
    descripcion: '',
    precio: 0,
    codigo: '',
    caracteristicas: [],
    activo: true,
  };

  selectedFile: File | null = null;
  showForm: boolean = false;
  showCategoryForm: boolean = false;
  cargando: boolean = false;
  isEditMode: boolean = false;
  currentItemId: string | null = null;
  nuevaCaracteristica: string = '';

  filtros = {
    precio: '',
    tipo_isla: ''
  };

  showStock: boolean = false;
  showOrdenes: boolean = false;
  showElementos: boolean = false;

  currentUser: any = null;

  constructor(
    private firestoreService: FirestoreService,
    private modalController: ModalController,
    private storage: AngularFireStorage,
    private loadingController: LoadingController,
    private router: Router,
    private authService: AuthService,
    private menuController: MenuController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerStockItems();
    this.cargarUsuario();
    this.evaluarCondiciones();
  }

  obtenerStockItems() {
    this.stockItems$ = this.firestoreService.getStockItems() as Observable<Producto[]>;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async crearOEditarItem() {
    if (this.nuevoItem.nombre && this.nuevoItem.precio > 0) {
      const loading = await this.loadingController.create({ message: 'Guardando producto...' });
      await loading.present();

      if (this.isEditMode && this.currentItemId) {
        // Actualización del producto existente
        await this.firestoreService.updateStockItem(this.currentItemId, this.nuevoItem);
      } else {
        // Creación de un nuevo producto
        const itemId: string = await this.firestoreService.createStockItem(this.nuevoItem);
        this.currentItemId = itemId;
      }

      // Subir imagen si se selecciona
      if (this.selectedFile) {
        const filePath = `stock_images/${Date.now()}_${this.selectedFile.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedFile);
        uploadTask.snapshotChanges().pipe(
          finalize(async () => {
            const downloadURL = await fileRef.getDownloadURL().toPromise();
            await this.firestoreService.updateStockItemImage(this.currentItemId, downloadURL);
            this.nuevoItem.imagen = downloadURL;
            this.resetForm();
            await loading.dismiss();
          })
        ).subscribe();
      } else {
        this.resetForm();
        await loading.dismiss();
      }
    }
  }

  async eliminarItem(itemId: string) {
    await this.firestoreService.deleteStockItem(itemId);
  }

  editarItem(item: Producto) {
    this.isEditMode = true;
    this.currentItemId = item.id;
    this.nuevoItem = { ...item };
    this.showForm = true;
  }

  resetForm() {
    this.nuevoItem = {
      id: '',
      tipo_isla: '',
      nombre: '',
      imagen: '',
      descrip_corta: '',
      descripcion: '',
      precio: 0,
      codigo: '',
      caracteristicas: [],
      activo: false
    };
    this.selectedFile = null;
    this.isEditMode = false;
    this.currentItemId = null;
    this.showForm = false;
  }

  updateActivo(item: Producto) {
    this.firestoreService.updateStockItem(item.id, { activo: item.activo })
      .then(() => console.log('Estado del producto actualizado correctamente'))
      .catch(error => console.error('Error actualizando el estado del producto: ', error));
  }

  aplicarFiltros() {
    this.stockItems$ = this.firestoreService.getStockItems().pipe(
      map((items: Producto[]) => {
        let filtrados = items;

        if (this.filtros.tipo_isla) {
          filtrados = filtrados.filter(item => item.tipo_isla === this.filtros.tipo_isla);
        }

        if (this.filtros.precio === 'asc') {
          filtrados.sort((a, b) => a.precio - b.precio);
        } else if (this.filtros.precio === 'desc') {
          filtrados.sort((a, b) => b.precio - a.precio);
        }

        return filtrados;
      })
    );
  }

  limpiarFiltros() {
    this.filtros = { precio: '', tipo_isla: '' };
    this.aplicarFiltros();
  }

  agregarCaracteristica() {
    if (this.nuevaCaracteristica.trim()) {
      this.nuevoItem.caracteristicas.push(this.nuevaCaracteristica.trim());
      this.nuevaCaracteristica = ''; // Limpiar input
    }
  }

  eliminarCaracteristica(index: number) {
    this.nuevoItem.caracteristicas.splice(index, 1);
  }


  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  async openMenu() {
    const isMenuEnabled = await this.menuController.isEnabled('adminMenu');
    if (isMenuEnabled) {
      this.menuController.open('adminMenu');
    } else {
      console.error('El menú no está habilitado');
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

          // Función para obtener el usuario desde localStorage
cargarUsuario() {
  const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser); // Parsear el JSON para obtener el objeto
    }
}

      // Función para evaluar las condiciones de los botones
      evaluarCondiciones() {
        // Mostrar secciones solo si el usuario es "admin"
        if (this.currentUser?.tipo_usuario === 'admin') {
          this.showStock = true;
          this.showOrdenes = true;
          this.showElementos = true;
        }
        // Refrescar la vista
        this.cdr.detectChanges();
      }

      navigateToExternal(url: string) {
        window.open(url, '_blank'); // '_blank' abre la URL en una nueva pestaña. Cambia a '_self' si quieres que sea en la misma pestaña.
      }


}
