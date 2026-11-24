import { register } from 'swiper/element/bundle';
import { afterNextRender, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Homelist } from '../../../../core/models/homelist.interface';

interface HeroSwiperElement extends HTMLElement {
  swiper?: {
    slideNext(): void;
    slidePrev(): void;
  };
}

@Component({
  imports: [RouterLink],
  selector: 'app-home-first',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './home-first.component.css',
  templateUrl: './home-first.component.html',
})
export class HomeFirstComponent  {
  @ViewChild('heroSwiper') private heroSwiper?: ElementRef<HeroSwiperElement>;


    constructor() {
        afterNextRender(() => {
          register();
        });
      }

  theList: Homelist[] = [
    {
      icon: 'fa-solid fa-truck',
      iconColor: '#2B7FFF',
      content: 'Free Shipping',
      comment: 'On orders over 500 EGP',
      bgcolor: '#EFF6FF',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      iconColor: '#00BC7D',
      content: 'Secure Payment',
      comment: '100% secure transactions',
      bgcolor: '#ECFDF5',
    },
    {
      icon: 'fa-solid fa-rotate-left',
      iconColor: '#FF6900',
      content: 'Easy Returns',
      comment: '14-day return policy',
      bgcolor: '#FFF7ED',
    },
    {
      icon: 'fa-solid fa-headset',
      iconColor: '#AD46FF',
      content: '24/7 Support',
      comment: 'Dedicated support team',
      bgcolor: '#FAF5FF',
    },
  ];


  slides = [
    {
      title: 'Fresh Products Delivered to your Door',
      description: 'Get 20% off your first order',
      image: 'assets/images/Swipper.png',
    },
    {
      title: 'Your Daily Groceries, Made Easy',
      description: 'Fresh picks and great deals, delivered to you',
      image: 'assets/images/Swipper.png',
    },
    {
      title: 'Fast Delivery, Fresh Every Time',
      description: 'Everything you need, right at your door',
      image: 'assets/images/Swipper.png',
    },
  ];

  previousSlide(): void {
    this.heroSwiper?.nativeElement.swiper?.slidePrev();
  }

  nextSlide(): void {
    this.heroSwiper?.nativeElement.swiper?.slideNext();
  }
}
