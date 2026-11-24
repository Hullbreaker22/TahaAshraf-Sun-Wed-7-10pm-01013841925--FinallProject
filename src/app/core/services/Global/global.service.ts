import { computed, inject, PLATFORM_ID, signal, Service } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ICartItem, IProduct } from '../../models/iproduct.interface';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../Cart/cart.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ProductService } from '../productservice/product.service';
import { WishlistService } from '../Wishlist/wishlist.service';

@Service()

export class GlobalService {
  savedtoken = signal<string | null>(null);
  savedCart = signal<ICartItem[]>([]);
  localCart = signal<ICartItem[]>([]);
  readonly wishlistProductIds = signal<string[]>([]);

  private readonly CookieBase = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly CartBase = inject(CartService)
  private readonly toster = inject(ToastrService)
  private readonly ProductBase = inject(ProductService)
  private readonly WishlistBase = inject(WishlistService)

  readonly totalItems = computed(() =>
    this.savedtoken() ? this.savedCart().length : this.localCart().length
  );
  readonly totalWishlistItems = computed(() => this.wishlistProductIds().length);

  readonly subtotal = computed(() =>
    this.savedCart().reduce((total, item) => total + item.price * item.count, 0)
  );

  Login(): void {
    let specialToken = this.CookieBase.get('token');
    if (specialToken) {
      this.savedtoken.set(specialToken);
    } else {
      this.savedtoken.set(null);
    }
  }

getSavedCarts(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedCart = localStorage.getItem('cart');
        const items = savedCart ? JSON.parse(savedCart) as Array<ICartItem | IProduct> : [];

        this.localCart.set(items.map(item => {
          const product = 'product' in item ? item.product : item;
          const quantity = Number('count' in item ? item.count : product.cartQuantity) || 1;
          const count = Math.max(1, quantity);

          return {
            _id: product._id,
            count,
            product: {
              ...product,
              cartQuantity: count,
            },
            price: product.price,
          };
        }));
      } catch (error) {
        console.error('Unable to load the saved cart from local storage.', error);
        this.localCart.set([]);
      }
    }
  }

  saveCart(cart: ICartItem[]): void {
    this.savedCart.set(cart);
  }

  saveLocalCart(cart: ICartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    this.localCart.set(cart);
  }

  getSpecificProduct(productId: string): Observable<IProduct> {
    return this.ProductBase.getSpecificProduct(productId);
  }

  getAllProducts(): Observable<IProduct[]> {
    return this.ProductBase.getAllProducts().pipe(map(response => response.data));
  }

  isInCart(productId: string): boolean {
    const cartItems = this.CookieBase.get('token') ? this.savedCart() : this.localCart();
    return cartItems.some(item => item.product._id === productId || item._id === productId);
  }

  addToCart(product: IProduct): Observable<void> {
    if (!this.CookieBase.get('token')) {
      this.getSavedCarts();
      const currentCart = this.localCart();
      const existingItem = currentCart.find(item => item._id === product._id);
      const updatedCart = existingItem
        ? currentCart.map(item => item._id === product._id
          ? {
              ...item,
              count: item.count + 1,
              product: {
                ...item.product,
                cartQuantity: item.count + 1,
              },
            }
          : item)
        : [
            ...currentCart,
            {
              _id: product._id,
              count: 1,
              product: { ...product, cartQuantity: 1 },
              price: product.price,
            },
          ];

      this.saveLocalCart(updatedCart);
      this.toster.success('Added to cart successfully!', '', { toastClass: 'ngx-toastr success-primary' });
      return of(undefined);
    }

    return this.CartBase.addtoCart(product._id).pipe(
      tap(() => {
        this.toster.success('Added to cart successfully!');
        this.getuserCart();
      }),
      map(() => undefined),
      catchError(error => {
        console.error('Unable to add product to cart.', error);
        this.toster.error('Unable to add product to cart.');
        return throwError(() => error);
      })
    );
  }

  addToWishlist(product: IProduct): Observable<void> {
    if (!this.CookieBase.get('token')) {
      const savedIds = this.readLocalWishlist();
      if (savedIds.includes(product._id)) {
        return of(undefined);
      }

      const updatedIds = [...savedIds, product._id];
      if (!this.persistLocalWishlist(updatedIds)) {
        return throwError(() => new Error('Unable to save wishlist item locally.'));
      }

      this.wishlistProductIds.set(updatedIds);
      this.toster.success('Added to wishlist successfully!');
      return of(undefined);
    }

    if (this.isWishlisted(product._id)) {
      return of(undefined);
    }

    return this.WishlistBase.addtowishList(product._id).pipe(
      tap(() => {
        this.wishlistProductIds.update(ids => [...ids, product._id]);
        this.toster.success('Added to wishlist successfully!');
      }),
      map(() => undefined),
      catchError(error => {
        console.error('Unable to add product to wishlist.', error);
        this.toster.error('Unable to add product to wishlist.');
        return throwError(() => error);
      })
    );
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistProductIds().includes(productId);
  }

  removeLocalWishlistItem(productId: string): boolean {
    const updatedIds = this.readLocalWishlist().filter(id => id !== productId);
    if (!this.persistLocalWishlist(updatedIds)) {
      return false;
    }

    this.wishlistProductIds.set(updatedIds);
    return true;
  }

  loadWishlist(): void {
    if (!this.CookieBase.get('token')) {
      this.wishlistProductIds.set(this.readLocalWishlist());
      return;
    }

    this.WishlistBase.getUserWishList().subscribe({
      next: response => {
        if (!Array.isArray(response.data)) {
          console.error('Unable to load wishlist: the API returned an invalid product list.');
          return;
        }

        const remoteIds = response.data.map((product: IProduct) => product._id);
        this.wishlistProductIds.set([...new Set([...remoteIds, ...this.readLocalWishlist()])]);
      },
      error: error => console.error('Unable to load wishlist status.', error),
    });
  }

  syncLocalWishlist(): Observable<void> {
    const savedIds = this.readLocalWishlist();
    this.wishlistProductIds.set(savedIds);
    if (!savedIds.length) {
      return of(undefined);
    }

    if (!this.CookieBase.get('token')) {
      return throwError(() => new Error('A signed-in user is required to sync the wishlist.'));
    }

    const remoteIds = new Set<string>();
    const failedIds = new Set<string>();

    return this.WishlistBase.getUserWishList().pipe(
      switchMap(response => {
        if (!Array.isArray(response.data)) {
          throw new Error('The wishlist API returned an invalid product list.');
        }

        response.data.forEach((product: IProduct) => remoteIds.add(product._id));
        const idsToAdd = savedIds.filter(productId => !remoteIds.has(productId));
        if (!idsToAdd.length) {
          return of(undefined);
        }

        return forkJoin(idsToAdd.map(productId =>
          this.WishlistBase.addtowishList(productId).pipe(
            tap(() => remoteIds.add(productId)),
            catchError(error => {
              console.error(`Unable to sync wishlist product ${productId}.`, error);
              failedIds.add(productId);
              return of(null);
            })
          )
        )).pipe(map(() => undefined));
      }),
      tap(() => {
        const remainingIds = savedIds.filter(productId => failedIds.has(productId));
        this.persistLocalWishlist(remainingIds);
        this.wishlistProductIds.set([...new Set([...remoteIds, ...remainingIds])]);

        if (failedIds.size) {
          this.toster.error(`${failedIds.size} wishlist item(s) could not be synced. Please try again.`);
        } else {
          this.toster.success('Wishlist synced successfully!');
        }
      }),
      map(() => undefined),
      catchError(error => {
        console.error('Unable to sync the local wishlist.', error);
        this.toster.error('Unable to sync your wishlist. Your saved items are still on this device.');
        return throwError(() => error);
      })
    );
  }

  private readLocalWishlist(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (!savedWishlist) {
        return [];
      }

      const items: unknown = JSON.parse(savedWishlist);
      if (!Array.isArray(items)) {
        throw new Error('Saved wishlist must be an array.');
      }

      return [...new Set(items
        .map(item => typeof item === 'string' ? item : item && typeof item === 'object' && '_id' in item ? item._id : null)
        .filter((productId): productId is string => typeof productId === 'string' && productId.length > 0))];
    } catch (error) {
      console.error('Unable to read the saved wishlist from local storage.', error);
      return [];
    }
  }

  private persistLocalWishlist(productIds: string[]): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    try {
      if (productIds.length) {
        localStorage.setItem('wishlist', JSON.stringify(productIds));
      } else {
        localStorage.removeItem('wishlist');
      }
      return true;
    } catch (error) {
      console.error('Unable to save the wishlist to local storage.', error);
      this.toster.error('Unable to save your wishlist on this device.');
      return false;
    }
  }

 getuserCart(): void {
    this.CartBase.getUserCart().subscribe({
      next:(res)=> {
        this.savedCart.set(res.data.products.map(item => ({
          ...item,
          product: {
            ...item.product,
            cartQuantity: Math.max(1, Number(item.count) || Number(item.product.cartQuantity) || 1),
          },
        })));
      },error:(err)=>{
        console.error('Unable to load the user cart.', err);
      }
    })
 }


 RemoveItem(productId:string){
  this.CartBase.RemoveItemfromCart(productId).subscribe({next:(res)=>{
    console.log(res);
    this.toster.info('Product Deleted successfully!')
    this.getuserCart()
  },error:(err)=>{
    console.log(err);
    
  }})
 }

 async deleteCartItem(item: ICartItem, isAuthenticated: boolean): Promise<void> {
  const result = await Swal.fire({
    title: 'Remove item from cart?',
    text: `Are you sure you want to remove "${item.product.title}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Remove',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  });

  if (!result.isConfirmed) {
    return;
  }

  if (isAuthenticated) {
    this.RemoveItem(item.product.id);
    return;
  }

  this.saveLocalCart(this.localCart().filter(cartItem => cartItem._id !== item._id));
 }
 


 UpdateItem(ProducId:string , Count:number){
  this.CartBase.UpdateCount(ProducId, Count).subscribe({
    next:(res)=>{
      
    },error:(err)=>{
      console.log(err);
      
    }
  })
 }


}