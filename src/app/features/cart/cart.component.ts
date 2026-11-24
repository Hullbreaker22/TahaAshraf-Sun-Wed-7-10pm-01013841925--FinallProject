import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICartItem } from '../../core/models/iproduct.interface';
import { GlobalService } from '../../core/services/Global/global.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {


  private readonly GlobalBase = inject(GlobalService);

  readonly savedCart = this.GlobalBase.savedCart;
  readonly localCart = this.GlobalBase.localCart;
  readonly CookieBase = inject(CookieService);
  readonly isAuthenticated = !!this.CookieBase.get('token');
  readonly totalItems = computed(() => this.isAuthenticated
    ? this.savedCart().length
    : this.localCart().length);
  readonly subtotal = computed(() => this.isAuthenticated
    ? this.savedCart().reduce((total, item) => total + item.price * (item.count || 1), 0)
    : this.localCart().reduce((total, item) => total + item.price * (item.count || 1), 0));

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.GlobalBase.getuserCart()
    } else {
      this.GlobalBase.getSavedCarts();
    }
  }

changeQuantity(item: ICartItem, change: number): void {
    const currentQty = item.count || item.product.cartQuantity || 1;
    const newQty = Math.max(1, currentQty + change); 

    this.GlobalBase.UpdateItem(item.product.id, newQty);
    const updatedCart = this.savedCart().map(cartItem => {
      if (cartItem._id === item._id) {
        return {
          ...cartItem,
          count: newQty,
          product: {
            ...cartItem.product,
            cartQuantity: newQty
          }
        };
      }
      return cartItem;
    });

    this.GlobalBase.saveCart(updatedCart);
  }

  changeProductQuantity(item: ICartItem, change: number): void {
    const updatedCart = this.localCart().map(cartItem => cartItem._id === item._id
      ? {
          ...cartItem,
          count: Math.max(1, (cartItem.count || 1) + change),
          product: {
            ...cartItem.product,
            cartQuantity: Math.max(1, (cartItem.count || 1) + change),
          },
        }
      : cartItem);

    this.GlobalBase.saveLocalCart(updatedCart);
  }

  deleteCartItem(item: ICartItem): Promise<void> {
    return this.GlobalBase.deleteCartItem(item, this.isAuthenticated);
  }

  clearCart(): void {
    if (this.isAuthenticated) {
      this.GlobalBase.saveCart([]);
    } else {
      this.GlobalBase.saveLocalCart([]);
    }
  }
}
