import { IProduct } from './../../../../core/models/iproduct.interface';
import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ProductService } from '../../../../core/services/productservice/product.service';
import { GlobalService } from '../../../../core/services/Global/global.service';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { Metadata } from '../../../../core/models/metadata.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-home-forth',
  styleUrl: './home-forth.component.css',
  templateUrl: './home-forth.component.html',
})
export class HomeForthComponent implements OnInit {

  private readonly ProductBase = inject(ProductService);
  private readonly GlobaBase = inject(GlobalService)


  loadingProductId = signal<string | null>(null);
  addingWishlistProductId = signal<string | null>(null);
  currentPage = signal<number>(1)
  totalPages = signal<number | null>(null)
  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() ?? 0 }, (_, index) => index + 1)
  );
  metadata = signal<Metadata | null>(null)
  loading = signal<boolean>(false)

  ProductsList: WritableSignal<IProduct[]> = signal([]);
  readonly ratingStars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.GlobaBase.getSavedCarts();
    this.GlobaBase.loadWishlist();
    this.getallProducts();
  }

  isWishlisted(productId: string): boolean {
    return this.GlobaBase.isWishlisted(productId);
  }

  isInCart(productId: string): boolean {
    return this.GlobaBase.isInCart(productId);
  }

  getallProducts() {
    this.ProductBase.getAllProducts(this.currentPage()).subscribe({
      next: (res: any) => {
        this.ProductsList.set(res.data);
        this.totalPages.set(res.metadata.numberOfPages)
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  setPage(page: number): void {
    const lastPage = this.totalPages();
    if (lastPage === null || page < 1 || page > lastPage || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.getallProducts();
  }

  addToCart(product: IProduct): void {
    if (this.loadingProductId() || this.isInCart(product._id)) {
      return;
    }

    this.loadingProductId.set(product._id);
    this.GlobaBase.addToCart(product).pipe(
      finalize(() => this.loadingProductId.set(null))
    ).subscribe({
      error: error => console.error('Unable to add product to cart.', error),
    });
  }

  addToWishlist(product: IProduct): void {
    if (this.addingWishlistProductId()) {
      return;
    }

    this.addingWishlistProductId.set(product._id);
    this.GlobaBase.addToWishlist(product).pipe(
      finalize(() => this.addingWishlistProductId.set(null))
    ).subscribe({
      error: error => console.error('Unable to add product to wishlist.', error),
    });
  }

}