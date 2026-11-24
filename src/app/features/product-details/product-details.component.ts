import { DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { IProduct } from '../../core/models/iproduct.interface';
import { GlobalService } from '../../core/services/Global/global.service';

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-product-details',
  styleUrl: './product-details.component.css',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly globalService = inject(GlobalService);

  readonly product = signal<IProduct | null>(null);
  readonly selectedImage = signal<string | null>(null);
  readonly relatedProducts = signal<IProduct[]>([]);
  readonly loadingProductId = signal<string | null>(null);
  readonly addingWishlistProductId = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly ratingStars = [1, 2, 3, 4, 5];
  readonly productImages = computed(() => {
    const product = this.product();
    return product
      ? product.images?.length ? product.images : [product.imageCover]
      : [];
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const productId = params.get('id');
      if (!productId) {
        this.product.set(null);
        this.relatedProducts.set([]);
        this.selectedImage.set(null);
        this.isLoading.set(false);
        return;
      }

      this.product.set(null);
      this.relatedProducts.set([]);
      this.selectedImage.set(null);
      this.isLoading.set(true);
      this.globalService.getSpecificProduct(productId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: product => {
          if (this.route.snapshot.paramMap.get('id') !== productId) {   
            return;
          }

          this.product.set(product);
          this.selectedImage.set(product.images?.[0] ?? product.imageCover);
          this.isLoading.set(false);
          this.loadRelatedProducts(product._id);
        },
        error: error => {
          if (this.route.snapshot.paramMap.get('id') !== productId) {
            return;
          }

          console.error('Unable to load product details.', error);
          this.product.set(null);
          this.isLoading.set(false);
        },
      });
    });
  }

  selectImage(image: string): void {
    this.selectedImage.set(image);
  }

  isWishlisted(productId: string): boolean {
    return this.globalService.isWishlisted(productId);
  }

  isInCart(productId: string): boolean {
    return this.globalService.isInCart(productId);
  }

  addToCart(product: IProduct, buyNow = false): void {
    if (this.loadingProductId() || (!buyNow && this.isInCart(product._id))) {
      return;
    }

    this.loadingProductId.set(product._id);
    this.globalService.addToCart(product).pipe(
      finalize(() => this.loadingProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        if (buyNow) {
          this.router.navigateByUrl('/checkout');
        }
      },
      error: error => console.error('Unable to add product to cart.', error),
    });
  }

  addToWishlist(product: IProduct): void {
    if (this.addingWishlistProductId()) {
      return;
    }

    this.addingWishlistProductId.set(product._id);
    this.globalService.addToWishlist(product).pipe(
      finalize(() => this.addingWishlistProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: error => console.error('Unable to add product to wishlist.', error),
    });
  }

  private loadRelatedProducts(productId: string): void {
    this.globalService.getAllProducts().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: products => {
        if (this.route.snapshot.paramMap.get('id') !== productId) {
          return;
        }

        const candidates = products.filter(product => product._id !== productId);
        for (let index = candidates.length - 1; index > 0; index--) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
        }

        this.relatedProducts.set(candidates.slice(0, 5));
      },
      error: error => {
        console.error('Unable to load related products.', error);
        this.relatedProducts.set([]);
      },
    });
  }
}
