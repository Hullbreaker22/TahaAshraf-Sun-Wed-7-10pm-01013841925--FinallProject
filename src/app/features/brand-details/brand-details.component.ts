import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GlobalService } from '../../core/services/Global/global.service';
import { finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { IBrand } from '../../core/models/ibrand.interface';
import { IProduct } from '../../core/models/iproduct.interface';
import { BrandService } from '../../core/services/Brands/brand.service';
import { ProductService } from '../../core/services/productservice/product.service';

@Component({
  imports: [RouterLink],
  selector: 'app-brand-details',
  styleUrl: './brand-details.component.css',
  templateUrl: './brand-details.component.html',
})
export class BrandDetailsComponent implements OnInit {
  private readonly root = inject(ActivatedRoute)
  private readonly BrandBase = inject(BrandService)
  private readonly ProductBase = inject(ProductService)
  private readonly GlobalBase = inject(GlobalService)
  private readonly spinner = inject(NgxSpinnerService)

  Brandid = signal<string>('')
  SavedBrand = signal<IBrand>({} as IBrand)
  ProductsList = signal<IProduct[]>([])
  loadingProductId = signal<string | null>(null)
  addingWishlistProductId = signal<string | null>(null)
  isLoadingProducts = signal<boolean>(true)
  readonly ratingStars = [1, 2, 3, 4, 5]

  ngOnInit(): void {
    this.GlobalBase.getSavedCarts()
    this.GlobalBase.loadWishlist()
    this.root.paramMap.subscribe(param => {
      const id = param.get('id') ?? ''
      this.Brandid.set(id)
      this.getChosenBrand()
      this.getProducts()
    })
  }

  getChosenBrand(): void {
    this.spinner.show()
    this.BrandBase.GetSpecificBrand(this.Brandid()).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe({
      next: res => this.SavedBrand.set(res.data),
      error: err => console.error('Unable to load brand details.', err),
    })
  }

  getProducts(): void {
    this.isLoadingProducts.set(true)
    this.spinner.show()
    this.ProductBase.BrandFilter(this.Brandid()).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe({
      next: res => {
        this.ProductsList.set(res.data)
        this.isLoadingProducts.set(false)
      },
      error: err => {
        this.isLoadingProducts.set(false)
        console.error('Unable to load brand products.', err)
      },
    })
  }

  isWishlisted(productId: string): boolean {
    return this.GlobalBase.isWishlisted(productId)
  }

  isInCart(productId: string): boolean {
    return this.GlobalBase.isInCart(productId)
  }

  addToCart(product: IProduct): void {
    if (this.loadingProductId() || this.isInCart(product._id) || product.quantity < 1) {
      return
    }

    this.loadingProductId.set(product._id)
    this.GlobalBase.addToCart(product).pipe(
      finalize(() => this.loadingProductId.set(null))
    ).subscribe({
      error: error => console.error('Unable to add brand product to cart.', error),
    })
  }

  addToWishlist(product: IProduct): void {
    if (this.addingWishlistProductId() || this.isWishlisted(product._id)) {
      return
    }

    this.addingWishlistProductId.set(product._id)
    this.GlobalBase.addToWishlist(product).pipe(
      finalize(() => this.addingWishlistProductId.set(null))
    ).subscribe({
      error: error => console.error('Unable to add brand product to wishlist.', error),
    })
  }
}
