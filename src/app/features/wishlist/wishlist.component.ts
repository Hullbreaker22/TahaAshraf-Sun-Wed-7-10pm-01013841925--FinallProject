import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { finalize, forkJoin } from 'rxjs';
import { ICartItem, IProduct } from '../../core/models/iproduct.interface';
import { GlobalService } from '../../core/services/Global/global.service';
import { ProductService } from '../../core/services/productservice/product.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-wishlist',
  styleUrl: './wishlist.component.css',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly wishlistService = inject(WishlistService);
  private readonly globalService = inject(GlobalService);
  private readonly productService = inject(ProductService);
  private readonly cookieService = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isAuthenticated = !!this.cookieService.get('token');
  readonly products = signal<IProduct[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly addingProductId = signal<string | null>(null);
  readonly removingProductId = signal<string | null>(null);

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.globalService.getuserCart();
      this.wishlistService.getUserWishList().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: response => {
          this.products.set(response.data);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Unable to load the wishlist.', error);
          this.errorMessage.set('Your wishlist could not be loaded. Please try again.');
          this.isLoading.set(false);
        },
      });
      return;
    }

    this.globalService.getSavedCarts();
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    try {
      const savedWishlist = localStorage.getItem('wishlist');
      const productIds = savedWishlist ? JSON.parse(savedWishlist) as string[] : [];
      if (!productIds.length) {
        this.isLoading.set(false);
        return;
      }

      forkJoin(productIds.map(productId => this.productService.getSpecificProduct(productId))).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: products => {
          this.products.set(products);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Unable to load the local wishlist.', error);
          this.errorMessage.set('Your wishlist could not be loaded. Please try again.');
          this.isLoading.set(false);
        },
      });
    } catch (error) {
      console.error('Unable to read the local wishlist.', error);
      this.errorMessage.set('Your wishlist could not be loaded. Please try again.');
      this.isLoading.set(false);
    }
  }

  isInCart(productId: string): boolean {
    const cartItems = this.isAuthenticated
      ? this.globalService.savedCart()
      : this.globalService.localCart();

    return cartItems.some((item: ICartItem) =>
      item.product._id === productId || item._id === productId
    );
  }

  addToCart(product: IProduct): void {
    if (this.addingProductId() || this.isInCart(product._id) || product.quantity < 1) {
      return;
    }

    this.addingProductId.set(product._id);
    this.globalService.addToCart(product).pipe(
      finalize(() => this.addingProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: error => {
        console.error('Unable to add wishlist product to cart.', error);
        this.errorMessage.set(`Unable to add "${product.title}" to your cart.`);
      },
    });
  }

  removeFromWishlist(product: IProduct): void {
    if (this.removingProductId()) {
      return;
    }

    if (!this.isAuthenticated) {
      if (!this.globalService.removeLocalWishlistItem(product._id)) {
        this.errorMessage.set(`Unable to remove "${product.title}" from your wishlist.`);
        return;
      }

      this.products.update(products => products.filter(item => item._id !== product._id));
      this.errorMessage.set(null);
      return;
    }

    this.removingProductId.set(product._id);
    this.wishlistService.RemovefromWishlist(product._id).pipe(
      finalize(() => this.removingProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.products.update(products => products.filter(item => item._id !== product._id));
        this.globalService.wishlistProductIds.update(ids => ids.filter(id => id !== product._id));
        this.errorMessage.set(null);
      },
      error:(err)  => {
        console.error('Unable to remove product from wishlist.', err);
        this.errorMessage.set(`Unable to remove "${product.title}" from your wishlist.`);
      },
    });
  }
}
