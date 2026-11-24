import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { register } from 'swiper/element/bundle';
import { FooterComponent } from './layout/footer/footer.component';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NgxSpinnerComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  host: {
    ngSkipHydration: 'true',
  },
  templateUrl: './app.html',
})
export class App implements OnInit {
  ngOnInit(): void {
    register();
  }
  protected readonly title = signal('E-commerce');
  
}
