import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem,
   IonList, IonMenu, IonMenuButton, IonRow,
   IonSpinner, IonTitle, IonToolbar, MenuController } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { User } from 'src/app/common/models/users.models';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order-admin.component.html',
  styleUrls: ['./order-admin.component.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonHeader, IonContent, IonTitle, IonToolbar,
     IonGrid, IonRow, IonCol, IonSpinner,IonButtons, IonMenu, IonMenuButton,
     IonButton, IonIcon, IonList, IonItem,
  ]
})
export class OrderAdminComponent implements OnInit {
  selectedUser: User | null = null;
  isUserModalOpen = false;
  orders: any[] = [];
  cargando: boolean = false;
  filteredOrders: any[] = [];
  searchEmail: string = '';
  searchTelf: number = 0;
  currentUserEmail: string = '';
  currentUserPhone: number = 0;
  isOrderModalOpen: boolean = false;
  selectedOrder: any = null;

    //  showStock: boolean = false;
  showOrdenes: boolean = false;
  showCupones: boolean = false;

  currentUser: any = null; // Almacenar el usuario actual
  showStock: boolean;

  constructor(private firestoreService: FirestoreService,
    private router: Router,
    private authService: AuthService,
    private menuController: MenuController,
    private cdr: ChangeDetectorRef, // Añadido para refrescar la vista
  ) { }

  ngOnInit() {
    this.loadPurchaseOrders();
    this.cargarUsuario()
    this.evaluarCondiciones();
  }

  loadPurchaseOrders() {
    this.firestoreService.getPurchaseOrders().subscribe((res: any[]) => {
      this.orders = res;
      console.log("Órdenes cargadas:", this.orders);
    });
  }

  onSearchChange() {
    console.log('Detectado cambio en el campo de búsqueda');
    this.filterOrders();
  }

  async filterOrders() {
    console.log('Iniciando filtro con:', this.searchEmail, this.searchTelf);

    if (this.searchEmail || this.searchTelf) {
      this.cargando = true;

      try {
        let user: { id: string } | null = null;

        // Buscar usuario por DNI si se ingresó un DNI
        if (this.searchTelf) {
          user = await this.firestoreService.getUserByTelf(this.searchTelf);
        }

        // Buscar usuario por Email si no se ingresó un DNI
        if (!user && this.searchEmail) {
          user = await this.firestoreService.getUserByEmail(this.searchEmail);
        }

        console.log('Usuario encontrado:', user);

        if (user) {
          // Filtrar las órdenes por userId del usuario registrado
          this.filteredOrders = this.orders.filter(order => order.userId === user?.id);
        } else if (this.searchEmail) {
          // Si no se encuentra el usuario, buscar las órdenes de usuarios invitados por email
          this.filteredOrders = await this.firestoreService.getOrdersByGuestEmail(this.searchEmail);
        } else {
          console.warn('No se encontró el usuario con el email o dni proporcionado');
          this.filteredOrders = [];  // No mostrar órdenes si no se encontró el usuario
        }

        console.log("Órdenes filtradas:", this.filteredOrders);

        if (this.filteredOrders.length === 0) {
          console.log("No se encontraron órdenes para el usuario o email proporcionado");
        }
      } catch (error) {
        console.error('Error durante la búsqueda de usuario o el filtrado de órdenes:', error);
        this.filteredOrders = [];
      }

      this.cargando = false;
    } else {
      this.filteredOrders = this.orders;  // Si no hay búsqueda, mostrar todas las órdenes
    }

    console.log("Órdenes después del filtrado:", this.filteredOrders);
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

  // Helper para validar si el userId es un email
  isEmail(userId: string): boolean {
    // Simple regex para validar si el userId parece ser un email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(userId);
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
            // this.showCupones = true;
          }

          // Refrescar la vista
          this.cdr.detectChanges();
        }

        async viewUser(userId: string) {
          try {
              const user = await this.firestoreService.getUserById(userId);
              console.log(user);
              if (user) {
                  this.selectedUser = user;
                  console.log('selectedUser:', this.selectedUser); // Verificar que se asignó correctamente
                  this.isUserModalOpen = true;
              } else {
                  console.warn('No se encontró el usuario con el ID proporcionado');
              }
          } catch (error) {
              console.error('Error al obtener el usuario:', error);
          }
      }



      closeUserModal() {
          this.isUserModalOpen = false;
          this.selectedUser = null;
      }

      // Función para obtener y mostrar los detalles de la orden
async viewOrder(orderId: string) {
  try {
    const order = await this.firestoreService.getOrderByOrderId(orderId);
    console.log(order);
    if (order) {
      this.selectedOrder = order;
      console.log('selectedOrder:', this.selectedOrder); // Verificar que se asignó correctamente
      this.isOrderModalOpen = true;
    } else {
      console.warn('No se encontró la orden con el ID proporcionado');
    }
  } catch (error) {
    console.error('Error al obtener la orden:', error);
  }
}

navigateToExternal(url: string) {
  window.open(url, '_blank'); // '_blank' abre la URL en una nueva pestaña. Cambia a '_self' si quieres que sea en la misma pestaña.
}

// Función para cerrar el modal de la orden
closeOrderModal() {
  this.isOrderModalOpen = false;
  this.selectedOrder = null;
}

contactarPorWhatsApp(numero: string): void {
  if (!numero) {
    console.warn("Número de teléfono no disponible");
    return;
  }

  const mensaje = "Hola, nos conectamos con vos de parte de Nomada Muebles para coordinar el pedido!.";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank"); // Abre WhatsApp en una nueva pestaña
}


}
