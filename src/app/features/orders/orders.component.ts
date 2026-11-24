import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/authoService/auth.service';
import { IOrder } from '../../core/models/iproduct.interface';
import { IUser } from '../../core/models/iuser.interface';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-orders',
  styleUrl: './orders.component.css',
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly user = signal<IUser | null>(null);
  readonly orders = signal<IOrder[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly expandedOrderId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserOrders();
  }

  toggleOrder(orderId: string): void {
    this.expandedOrderId.update(currentId => currentId === orderId ? null : orderId);
  }

  getOrderStatus(order: IOrder): string {
    if (order.isDelivered) {
      return 'Delivered';
    }

    return order.isPaid ? 'Processing' : 'Pending';
  }

  getSubtotal(order: IOrder): number {
    return order.cartItems.reduce((total, item) => total + item.price * item.count, 0);
  }

  loadUserOrders(): void {

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.VerifyUser().subscribe({
      next: (res) => {
        const verifiedUser = res.decoded;
        this.loadOrders(verifiedUser?.id!)
        this.getSpecifiAddress()
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load your orders. Please sign in and try again.'),
        );
      },
    });
  }

  loadOrders(userId: string): void {
    this.authService.getUserOrders(userId).subscribe({
      next: (res) => {
        this.orders.set(res);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Unable to load your orders. Please try again.'),
        );
        console.log(error);

      },
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    const message = (error as { error?: { message?: unknown } } | null)?.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }


  getSpecifiAddress() {
    this.authService.getSpecificAddress("6b02f4174e00fe0013ede342").subscribe({
      next: (res) => {

      }, error: (err) => {
        console.log(err);

      }
    })
  }
}
