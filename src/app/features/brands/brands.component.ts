import { Component, inject, OnInit, signal } from '@angular/core';
import { BrandService } from '../../core/services/Brands/brand.service';
import { IBrand } from '../../core/models/ibrand.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-brands',
  styleUrl: './brands.component.css',
  templateUrl: './brands.component.html',
})
export class BrandsComponent implements OnInit {

  private readonly BrandBase = inject(BrandService)
  BrandsList = signal<IBrand[]>([])



  ngOnInit(): void {
    this.getBrands()
  }

  getBrands() {
    this.BrandBase.GetAllBrands().subscribe({
      next: (res) => {
        this.BrandsList.set(res.data)
      }, error: (err) => {

      }
    })
  }
}
