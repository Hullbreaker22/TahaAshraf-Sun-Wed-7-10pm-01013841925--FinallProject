import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { IProduct } from '../../core/models/iproduct.interface';
import { GlobalService } from '../../core/services/Global/global.service';
import { ProductService } from '../../core/services/productservice/product.service';
import { AuthService } from '../../core/services/authoService/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-shop',
  styleUrl: './shop.component.css',
  templateUrl: './shop.component.html',
})
export class ShopComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productService = inject(ProductService);
  private readonly globalService = inject(GlobalService);

  readonly products = signal<IProduct[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly loadingProductId = signal<string | null>(null);
  readonly addingWishlistProductId = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal<number | null>(null);
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() ?? 0 }, (_, index) => index + 1)
  );
  readonly ratingStars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.globalService.getSavedCarts();
    this.globalService.loadWishlist();
    this.loadProducts();
  }

  isWishlisted(productId: string): boolean {
    return this.globalService.isWishlisted(productId);
  }

  isInCart(productId: string): boolean {
    return this.globalService.isInCart(productId);
  }

  setPage(page: number): void {
    const lastPage = this.totalPages();
    if (lastPage === null || page < 1 || page > lastPage || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.loadProducts(page);
  }

  private loadProducts(page = this.currentPage()): void {
    this.productService.getAllProducts(page).pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        this.products.set(response.data);
        this.totalPages.set(response.metadata.numberOfPages);
      },
      error: error => {
        console.error('Unable to load shop products.', error);
        this.errorMessage.set('Products could not be loaded. Please try again.');
      },
    });
  }

  addToCart(product: IProduct): void {
    if (this.loadingProductId() || this.isInCart(product._id) || product.quantity < 1) {
      return;
    }

    this.loadingProductId.set(product._id);
    this.globalService.addToCart(product).pipe(
      finalize(() => this.loadingProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: error => console.error('Unable to add shop product to cart.', error),
    });
  }

  addToWishlist(product: IProduct): void {
    if (this.addingWishlistProductId() || this.isWishlisted(product._id)) {
      return;
    }

    this.addingWishlistProductId.set(product._id);
    this.globalService.addToWishlist(product).pipe(
      finalize(() => this.addingWishlistProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: error => console.error('Unable to add shop product to wishlist.', error),
    });
  }




}
