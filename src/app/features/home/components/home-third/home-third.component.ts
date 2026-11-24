import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ithird } from '../../../../core/models/ithird.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-home-third',
  styleUrl: './home-third.component.css',
  templateUrl: './home-third.component.html',
})
export class HomeThirdComponent {
  thirdList: Ithird[] = [
    {
      badgeIcon: '🔥',
      badge: 'Deal of the Day',
      title: 'Fresh Organic Fruits',
      description: 'Get up to 40% off on selected organic fruits',
      discount: '40% OFF',
      code: 'ORGANIC40',
      actionLabel: 'Shop Now',
      backgroundClass:
        'bg-linear-to-r from-[#00b074] via-[#009e62] to-[#008650]',
      buttonTextColor: '#00965e',
    },
    {
      badgeIcon: '✨',
      badge: 'New Arrivals',
      title: 'Exotic Vegetables',
      description: 'Discover our latest collection of premium vegetables',
      discount: '25% OFF',
      code: 'FRESH25',
      actionLabel: 'Explore Now',
      backgroundClass:
        'bg-linear-to-r from-[#ff7a30] via-[#ff5840] to-[#ff385c]',
      buttonTextColor: '#ff5733',
    },
  ];
}
