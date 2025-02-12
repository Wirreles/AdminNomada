import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IoniconsModule } from './common/modules/ionicons.module';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [HttpClientModule,IonApp, IonRouterOutlet, IoniconsModule],
})
export class AppComponent {
  constructor() {}
}

// 777
