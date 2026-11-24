import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent {
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}