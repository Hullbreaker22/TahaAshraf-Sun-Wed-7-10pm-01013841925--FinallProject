import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GlobalService } from '../../core/services/Global/global.service';
import { finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ICat } from '../../core/models/icat.interface';
import { IProduct } from '../../core/models/iproduct.interface';
import { CategoryService } from '../../core/services/categoriesSrcv/category.service';
import { ProductService } from '../../core/services/productservice/product.service';

@Component({
  imports: [RouterLink],
  selector: 'app-category-details',
  styleUrl: './category-details.component.css',
  templateUrl: './category-details.component.html',
})
export class CategoryDetailsComponent implements OnInit {

  private readonly root = inject(ActivatedRoute)
  private readonly Catbase = inject(CategoryService)
  private readonly ProducBase = inject(ProductService)
  private readonly GlobalBase = inject(GlobalService)
  private readonly spinner = inject(NgxSpinnerService)

  Categoryid = signal<string>('')
  SavedCat = signal<ICat>({} as ICat)
  ProductsList = signal<IProduct[]>([])
  loadingProductId = signal<string | null>(null)
  addingWishlistProductId = signal<string | null>(null)
  isLoadingProducts = signal<boolean>(true)
  readonly ratingStars = [1, 2, 3, 4, 5]

  ngOnInit(): void {
   this.GlobalBase.getSavedCarts()
   this.GlobalBase.loadWishlist()
   let x = this.root.paramMap.subscribe((param)=>{
    const id = param.get('id') ?? '';
    this.Categoryid.set(id)  
    this.GetChocenCat()  
    this.getProducts()
   })

  }


  GetChocenCat(){
    this.spinner.show()
    this.Catbase.getSpecificCat(this.Categoryid()).pipe(finalize(()=>{
      this.spinner.hide()
    })).subscribe({
      next:(res)=>{
        this.SavedCat.set(res.data)
        
      },error:(err)=>{
        console.log(err);
        
      }
    })
  }


  getProducts(){
    this.isLoadingProducts.set(true)
    this.spinner.show()
    this.ProducBase.CategoryFilter(this.Categoryid()).pipe(finalize(()=>{
      this.spinner.hide()
    })).subscribe({
      next:(res)=>{
        this.ProductsList.set(res.data)

        this.isLoadingProducts.set(false)
      },error:(err)=>{
        this.isLoadingProducts.set(false)
        console.log(err);
        
      }
    }
    )
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
      error: error => console.error('Unable to add category product to cart.', error),
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
      error: error => console.error('Unable to add category product to wishlist.', error),
    })
  }
  
}
