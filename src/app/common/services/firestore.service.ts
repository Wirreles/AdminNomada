import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
  WithFieldValue,
  UpdateData,
  getDocs,
  addDoc,
  CollectionReference,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/users.models';



// Convertidor genérico para Firestore
const converter = <T>() => ({
  toFirestore: (data: WithFieldValue<T>) => data,
  fromFirestore: (snapshot: any) => snapshot.data() as T
});

const docWithConverter = <T>(firestore: Firestore, path: string) =>
  doc(firestore, path).withConverter(converter<T>());

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);

  constructor(private storage: AngularFireStorage, private afAuth: AngularFireAuth) { }

  getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  getDocument<T>(enlace: string): Promise<DocumentData> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return getDoc(document);
  }

  getDocumentChanges<T>(enlace: string): Observable<T> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return docData(document) as Observable<T>;
  }

  getCollectionChanges<T>(path: string): Observable<T[]> {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection, { idField: 'id' }) as Observable<T[]>;
  }

  createDocument<T>(data: T, enlace: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return setDoc(document, data);
  }

  async createDocumentWithAutoId<T>(data: T, enlace: string): Promise<void> {
    const itemCollection = collection(this.firestore, enlace);
    const newDocRef = doc(itemCollection).withConverter(converter<T>());
    await setDoc(newDocRef, data);
  }

  async updateDocument<T>(data: UpdateData<T>, enlace: string, idDoc: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, `${enlace}/${idDoc}`);
    return updateDoc(document, data);
  }

  deleteDocumentID(enlace: string, idDoc: string): Promise<void> {
    const document = doc(this.firestore, `${enlace}/${idDoc}`);
    return deleteDoc(document);
  }

  deleteDocFromRef(ref: DocumentReference): Promise<void> {
    return deleteDoc(ref);
  }

  createIdDoc(): string {
    return uuidv4();
  }

  async getAuthUser() {
    return { uid: '05OTLvPNICH5Gs9ZsW0k' };
  }


getStockItems(): Observable<any[]> {
  const stockCollection = collection(this.firestore, 'stock');
  return collectionData(stockCollection, { idField: 'id' }) as Observable<any[]>;
}

async createStockItem(item: any): Promise<string> {
  const productId = this.createIdDoc();  // Generate a unique ID for the product
  const productDoc = doc(this.firestore, `stock/${productId}`);  // Reference to the product document
  await setDoc(productDoc, { ...item, id: productId });  // Save the product data with the generated ID
  return productId;  // Return the ID of the created product
}

async updateStockItemImage(itemId: string, imageUrl: string): Promise<void> {
  const itemDocRef = doc(this.firestore, `stock/${itemId}`);
  await updateDoc(itemDocRef, { imageUrl });
}

async deleteStockItem(itemId: string): Promise<void> {
  const itemDocRef = doc(this.firestore, `stock/${itemId}`);
  await deleteDoc(itemDocRef);
}

async updateStockItem(itemId: string, itemData: any): Promise<void> {
  const itemDocRef = doc(this.firestore, `stock/${itemId}`);
  await updateDoc(itemDocRef, { ...itemData });
}

// Crear una nueva categoría
async createCategoria(categoriaData: any): Promise<string> {
  const categoriaId = this.createIdDoc(); // Genera un ID único
  const categoriaDoc = doc(this.firestore, `categoriasProductos/${categoriaId}`);

  // Agregar el campo id al objeto de datos de la categoría
  categoriaData.id = categoriaId;

  // Guardar el documento con el ID incluido
  await setDoc(categoriaDoc, categoriaData);

  return categoriaId; // Retorna el ID de la categoría creada
}


// Obtener todas las categorías
getCategorias(): Observable<any[]> {
  const categoriasCollection = collection(this.firestore, 'categoriasProductos');
  return collectionData(categoriasCollection, { idField: 'id' }) as Observable<any[]>;
}

// Obtener todos los usuarios
getUsuarios(): Observable<User[]> {
  const usuariosCollection = collection(this.firestore, 'usuarios');
  return collectionData(usuariosCollection, { idField: 'id' }) as Observable<User[]>;
}


async getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const usersRef = collection(this.firestore, 'usuarios') as CollectionReference<User>;
    const userQuery = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

async getUserById(id: string): Promise<User | undefined> {
  try {
    const usersRef = collection(this.firestore, 'usuarios') as CollectionReference<User>;
    const userQuery = query(usersRef, where('id', '==', id));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData;
    } else {
      console.warn('No user found in Firestore with ID:', id);
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

// Function to update the user by their ID
async updateUser(userId: string, updatedData: Partial<User>): Promise<void> {
  const userDoc = doc(this.firestore, `usuarios/${userId}`);
  await updateDoc(userDoc, updatedData);
}

async getUsersByType(tipoUsuario: string): Promise<User[]> {
  try {
    const usersRef = collection(this.firestore, 'usuarios') as CollectionReference<User>;
    const userQuery = query(usersRef, where('tipo_usuario', '==', tipoUsuario));
    const querySnapshot = await getDocs(userQuery);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    if (users.length === 0) {
      console.warn('No users found with tipo_usuario:', tipoUsuario);
    }

    return users;
  } catch (error) {
    console.error('Error fetching users by tipo_usuario:', error);
    throw error;
  }
}

// Eliminar un usuario
async deleteUser(userId: string): Promise<void> {
  const userDocRef = doc(this.firestore, `usuarios/${userId}`);
  await deleteDoc(userDocRef);
}


// Función para obtener las órdenes de compra de un usuario por su ID
 async getOrdersByUserId(userId: string): Promise<any[]> {
  try {
    const ordersRef = collection(this.firestore, 'ordenesCompra') as CollectionReference<any>;
    const ordersQuery = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(ordersQuery);

    if (!querySnapshot.empty) {
      const orders = querySnapshot.docs.map(doc => doc.data());
      return orders;
    } else {
      console.warn('No orders found in Firestore for user with ID:', userId);
    }

    return [];
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
}



// Función para obtener la orden de compra por su orderId
async getOrderByOrderId(orderId: string): Promise<any> {
  try {
    const orderRef = doc(this.firestore, 'ordenesCompra', orderId);
    const orderDoc = await getDoc(orderRef);

    if (orderDoc.exists()) {
      return orderDoc.data(); // Retornar los datos de la orden
    } else {
      console.warn('No se encontró ninguna orden con el orderId:', orderId);
    }

    return null;
  } catch (error) {
    console.error('Error al obtener la orden por orderId:', error);
    throw error;
  }
}

// Función para actualizar la orden con la URL del QR
async updateOrderWithQr(orderId: string, qrUrl: string): Promise<void> {
  try {
    const orderRef = doc(this.firestore, 'ordenesCompra', orderId);
    await updateDoc(orderRef, { qr: qrUrl }); // Actualizar la propiedad 'qr' con la URL
  } catch (error) {
    console.error('Error al actualizar la orden con la URL del QR:', error);
    throw error;
  }
}

  // Function to upload an image to Firebase Storage
async uploadImage(file: File, folderPath: string): Promise<string> {
  const storageRef = this.storage.ref(`${folderPath}/${file.name}`); // Cambia a this.storage.ref
  const uploadTask = await storageRef.put(file); // Usa el método 'put' para subir el archivo
  const downloadURL = await storageRef.getDownloadURL().toPromise(); // Obtén el URL de descarga
  return downloadURL;
}

getPurchaseOrders(): Observable<any[]> {
  const allOrders = collection(this.firestore, 'ordenesCompra')
  return collectionData(allOrders,{idField:'id'}) as Observable<any[]>;
}


async getUserByTelf(telf: number) {
  const usersRef = collection(this.firestore, 'usuarios');
  const q = query(usersRef, where('telefono', '==', telf));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } else {
    return null;
  }
}

async getOrdersByGuestEmail(email: string) {
  const ordersRef = collection(this.firestore, 'ordenesCompra');
  const q = query(ordersRef, where('userId', '==', email));

  const querySnapshot = await getDocs(q);
  const orders: any[] = [];

  querySnapshot.forEach(doc => {
    orders.push({ id: doc.id, ...doc.data() });
  });

  return orders;
}

  // Obtener todos los cupones
  getCupons(): Observable<any[]> {
    const cuponCollection = collection(this.firestore, 'cupon');
    return collectionData(cuponCollection, { idField: 'id' }) as Observable<any[]>;
  }

  // Crear un nuevo cupón
  async createCupon(cupon: any): Promise<string> {
    const cuponId = this.createIdDoc(); // Generar un ID único para el cupón
    const cuponDoc = doc(this.firestore, `cupon/${cuponId}`); // Referencia al documento del cupón
    await setDoc(cuponDoc, { ...cupon, id: cuponId }); // Guardar el cupón con el ID generado
    return cuponId; // Retornar el ID del cupón creado
  }

  // Actualizar un cupón
  async updateCupon(cuponId: string, cuponData: any): Promise<void> {
    const cuponDocRef = doc(this.firestore, `cupon/${cuponId}`);
    await updateDoc(cuponDocRef, { ...cuponData }); // Actualizar los datos del cupón
  }

  // Eliminar un cupón
  async deleteCupon(cuponId: string): Promise<void> {
    const cuponDocRef = doc(this.firestore, `cupon/${cuponId}`);
    await deleteDoc(cuponDocRef); // Eliminar el cupón
  }




}


