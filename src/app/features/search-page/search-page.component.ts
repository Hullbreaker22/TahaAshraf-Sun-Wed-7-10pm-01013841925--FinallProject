import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { IBrand } from '../../core/models/ibrand.interface';
import { ICat } from '../../core/models/icat.interface';
import { IProduct } from '../../core/models/iproduct.interface';
import { BrandService } from '../../core/services/Brands/brand.service';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { GlobalService } from '../../core/services/Global/global.service';
import { ProductService } from '../../core/services/productservice/product.service';

type SortOrder = 'relevance' | 'price-asc' | 'price-desc' | 'rating';
type ViewMode = 'grid' | 'list';

@Component({
  imports: [RouterLink],
  selector: 'app-search-page',
  styleUrl: './search-page.component.css',
  templateUrl: './search-page.component.html',
})
export class SearchPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productService = inject(ProductService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly brandService = inject(BrandService);
  private readonly globalService = inject(GlobalService);

  readonly products = signal<IProduct[]>([]);
  readonly BrandList = signal<IBrand[]>([]);
  readonly CatList = signal<ICat[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly selectedCategoryIds = signal<string[]>([]);
  readonly selectedBrandIds = signal<string[]>([]);
  readonly sortOrder = signal<SortOrder>('relevance');
  readonly viewMode = signal<ViewMode>('grid');
  readonly loadingProductId = signal<string | null>(null);
  readonly addingWishlistProductId = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal<number | null>(null);
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() ?? 0 }, (_, index) => index + 1)
  );
  readonly ratingStars = [1, 2, 3, 4, 5];

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const selectedCategories = this.selectedCategoryIds();
    const selectedBrands = this.selectedBrandIds();
    const min = this.minPrice();
    const max = this.maxPrice();

    const filtered = this.products().filter(product => {
      const productPrice = this.getProductPrice(product);
      const matchesTerm = !term
        || product.title.toLocaleLowerCase().includes(term)
        || product.category.name.toLocaleLowerCase().includes(term)
        || product.brand.name.toLocaleLowerCase().includes(term);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(product.category._id);
      const matchesBrand = !selectedBrands.length || selectedBrands.includes(product.brand._id);

      return matchesTerm
        && matchesCategory
        && matchesBrand
        && (min === null || productPrice >= min)
        && (max === null || productPrice <= max);
    });

    switch (this.sortOrder()) {
      case 'price-asc':
        return filtered.sort((a, b) => this.getProductPrice(a) - this.getProductPrice(b));
      case 'price-desc':
        return filtered.sort((a, b) => this.getProductPrice(b) - this.getProductPrice(a));
      case 'rating':
        return filtered.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
      default:
        return filtered;
    }
  });

  ngOnInit(): void {
    this.globalService.getSavedCarts();
    this.globalService.loadWishlist();
    this.loadProducts();
    this.loadCategoriesAndBrands();
  }

  isWishlisted(productId: string): boolean {
    return this.globalService.isWishlisted(productId);
  }

  isInCart(productId: string): boolean {
    return this.globalService.isInCart(productId);
  }

  setSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setMinPrice(event: Event): void {
    this.minPrice.set(this.parsePrice((event.target as HTMLInputElement).value));
  }

  setMaxPrice(event: Event): void {
    this.maxPrice.set(this.parsePrice((event.target as HTMLInputElement).value));
  }

  setSortOrder(event: Event): void {
    this.sortOrder.set((event.target as HTMLSelectElement).value as SortOrder);
  }

  setCategorySelected(categoryId: string, event: Event): void {
    this.selectedCategoryIds.update(ids => this.updateSelection(ids, categoryId, (event.target as HTMLInputElement).checked));
  }

  setBrandSelected(brandId: string, event: Event): void {
    this.selectedBrandIds.update(ids => this.updateSelection(ids, brandId, (event.target as HTMLInputElement).checked));
  }

  setMaxPricePreset(maxPrice: number): void {
    this.minPrice.set(null);
    this.maxPrice.set(maxPrice);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.selectedCategoryIds.set([]);
    this.selectedBrandIds.set([]);
    this.sortOrder.set('relevance');
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
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

  addToCart(product: IProduct): void {
    if (this.loadingProductId() || this.isInCart(product._id) || product.quantity < 1) {
      return;
    }

    this.loadingProductId.set(product._id);
    this.globalService.addToCart(product).pipe(
      finalize(() => this.loadingProductId.set(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: error => console.error('Unable to add search product to cart.', error),
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
      error: error => console.error('Unable to add search product to wishlist.', error),
    });
  }

  getProductPrice(product: IProduct): number {
    return product.priceAfterDiscount && product.priceAfterDiscount < product.price
      ? product.priceAfterDiscount
      : product.price;
  }

  getDiscountPercent(product: IProduct): number {
    const discountedPrice = this.getProductPrice(product);
    return discountedPrice < product.price
      ? Math.round((1 - discountedPrice / product.price) * 100)
      : 0;
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
        console.error('Unable to load search products.', error);
        this.errorMessage.set('Products could not be loaded. Please try again.');
      },
    });
  }

  private loadCategoriesAndBrands(): void {
    this.categoriesService.getAllcategories().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => this.CatList.set(response.data),
      error: error => console.error('Unable to load search categories.', error),
    });

    this.brandService.GetAllBrands().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => this.BrandList.set(response.data),
      error: error => console.error('Unable to load search brands.', error),
    });
  }

  private parsePrice(value: string): number | null {
    if (!value.trim()) {
      return null;
    }

    const price = Number(value);
    return Number.isFinite(price) && price >= 0 ? price : null;
  }

  private updateSelection(ids: string[], id: string, selected: boolean): string[] {
    if (selected) {
      return ids.includes(id) ? ids : [...ids, id];
    }
    return ids.filter(selectedId => selectedId !== id);
  }
}
