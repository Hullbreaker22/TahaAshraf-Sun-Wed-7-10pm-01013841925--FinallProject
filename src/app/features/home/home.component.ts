import { Component } from '@angular/core';
import { HomeFirstComponent } from './components/home-first/home-first.component';
import { HomeSecondComponent } from './components/home-second/home-second.component';
import { HomeThirdComponent } from './components/home-third/home-third.component';
import { HomeForthComponent } from './components/home-forth/home-forth.component';
import { HomeFifthComponent } from './components/home-fifth/home-fifth.component';

@Component({
  imports: [HomeFirstComponent, HomeSecondComponent, HomeThirdComponent, HomeForthComponent, HomeFifthComponent],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
