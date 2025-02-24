import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User } from '../models/users.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();


  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    // GoogleAuth.initialize();
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();
   this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      this.afAuth.authState.pipe(
        switchMap(user => {
          if (user) {
            return this.firestore.collection<User>('usuarios').doc(user.uid).valueChanges();
          } else {
            return new Observable<User | null>(observer => observer.next(null));
          }
        })
      ).subscribe(userData => {
        this.userSubject.next(userData);
        if (userData) {
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          localStorage.removeItem('currentUser');
        }
      });
    });
  }

    // Método para obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('usuarios').valueChanges();
  }

  async login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return credential;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // async loginWithGoogle(): Promise<firebase.auth.UserCredential> {
  //   const provider = new firebase.auth.GoogleAuthProvider();
  //   const credential = await this.afAuth.signInWithPopup(provider);
  //   await this.updateUserData(credential.user);
  //   return credential;
  // }


  // async signInWithGoogle() {
  //   const googleUser = await GoogleAuth.signIn();
  //   const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
  //   return this.afAuth.signInWithCredential(credential);
  // }

// async signInWithGoogle() {
//   try {

//     await GoogleAuth.initialize({
//       clientId: '292123662270-5e3165d2plr6dofhe5bifpulu56e3392.apps.googleusercontent.com',
//       scopes: ['profile', 'email'],
//     });

//     const googleUser = await GoogleAuth.signIn();
//     if (!googleUser || !googleUser.authentication || !googleUser.authentication.idToken) {
//       throw new Error('No se obtuvo el token de autenticación');
//     }

//     const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
//     const userCredential = await this.afAuth.signInWithCredential(credential);

//     await this.updateUserData(userCredential.user);
//     return userCredential;
//   } catch (error) {
//     console.error('Error al iniciar sesión con Google:', error);
//     throw error;
//   }
// }

async signInWithGoogle() {
  try {
    console.log('Inicializando GoogleAuth...');
    // Asegúrate de que el clientId esté en el archivo google-services.json y concuerde con el de Firebase
    await GoogleAuth.initialize({
      clientId: '775859610688-ttbj6hmihbfuid1ahvskg4fd0tu4epen.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });
    console.log('GoogleAuth inicializado correctamente.');

    console.log('Intentando iniciar sesión con Google...');
    const googleUser = await GoogleAuth.signIn();
    console.log('Respuesta de Google sign-in:', googleUser);

    // Verifica si se obtuvo un usuario y la autenticación
    if (!googleUser || !googleUser.authentication) {
      throw new Error('No se obtuvo la autenticación completa del usuario de Google.');
    }

    // Usar idToken o accessToken según lo que devuelva GoogleAuth
    const token = googleUser.authentication.idToken || googleUser.authentication.accessToken;
    if (!token) {
      throw new Error('No se obtuvo un token de autenticación válido de Google.');
    }

    console.log('Creando credencial de Firebase con el token de Google...');
    const credential = firebase.auth.GoogleAuthProvider.credential(token);

    console.log('Iniciando sesión en Firebase con la credencial...');
    const userCredential = await this.afAuth.signInWithCredential(credential);
    console.log('Respuesta de Firebase sign-in:', userCredential);

    console.log('Actualizando los datos del usuario en Firestore...');
    await this.updateUserData(userCredential.user);

    console.log('Usuario inició sesión correctamente con Google:', userCredential);
    return userCredential;
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
}

  private async updateUserData(user: firebase.User | null): Promise<void> {
    if (user) {
      const userRef = this.firestore.collection('usuarios').doc(user.uid);
      const userDoc = await userRef.get().toPromise();

      if (!userDoc.exists) {
        const data: Omit<User, 'password'> = {
          id: user.uid,
          nombre: user.displayName || 'Sin Nombre',
          email: user.email || '',
        };

        try {
          await userRef.set(data);
        } catch (error) {
          console.error('Error setting new user data:', error);
        }
      }
    }
  }

  async register(email: string, password: string, nombre: string, apellido: string, dni:number): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;
      if (uid) {
        await this.firestore.collection('usuarios').doc(uid).set({
          id: uid,
          nombre: nombre,
          dni: dni,
          email: email,
          tipo_usuario: 'cliente',
          apellido: apellido,
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        this.userSubject.next(parsedUser);
    }

    return this.user$;
}



}
