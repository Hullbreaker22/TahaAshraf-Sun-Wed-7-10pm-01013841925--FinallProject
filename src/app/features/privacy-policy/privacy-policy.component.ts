import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {
  scrollTo(id: string): void {``
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}