import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/Cart/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ICartItem, ICartResponse } from '../../core/models/iproduct.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckoutService } from '../../core/services/Checkout/checkout.service';
import { AuthService } from '../../core/services/authoService/auth.service';
import { IAddress } from '../../core/models/iaddress.interface';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-check-out',
  styleUrl: './check-out.component.css',
  templateUrl: './check-out.component.html',
})
export class CheckOutComponent implements OnInit {

  private readonly CartBase = inject(CartService)
  private readonly Cookibase = inject(CookieService)
  private readonly CheckoutBase = inject(CheckoutService)
  private readonly AuthBase = inject(AuthService)
  private readonly router = inject(Router)


  sumtotal = signal<number | null>(0)
  isOnCash = signal<boolean>(true)
  CardId = signal<string>('')
  ProductsList = signal<ICartItem[]>([])
  cartResponse = signal<ICartResponse>({} as ICartResponse)
  savedAddresses = signal<IAddress[]>([])
  selectedAddress = signal<IAddress | null>(null)
  isAddressPickerOpen = signal(false)
  isLoadingAddresses = signal(false)
  addressError = signal('')
  isAuthonticated = this.Cookibase.get('token') ? true : false
  private fb = inject(FormBuilder);

  CheckoutForm = this.fb.group({
    city: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    details: ['', Validators.required]
  });



  ngOnInit(): void {

    this.TestFunction()
  }



  TestFunction() {
    if (this.isAuthonticated) {
      this.CartBase.getUserCart().subscribe({
        next: (res) => {
          this.cartResponse.set(res)
          this.ProductsList.set(res.data.products)
          this.sumtotal.set(res.data.totalCartPrice)
          this.CardId.set(res.cartId)



          console.log(this.ProductsList());

        }, error: (err) => {
          console.log(err);
        }
      })
    }
  }


  toggleSavedAddressPicker(): void {
    this.addressError.set('');
    const shouldOpenPicker = !this.isAddressPickerOpen();
    this.isAddressPickerOpen.set(shouldOpenPicker);

    if (shouldOpenPicker) {
      this.loadSavedAddresses();
    }
  }

  selectSavedAddress(address: IAddress): void {
    this.selectedAddress.set(address);
    this.CheckoutForm.patchValue({
      city: address.city,
      phone: address.phone,
      details: address.details,
    });
    this.CheckoutForm.disable();
    this.CheckoutForm.markAsPristine();
    this.CheckoutForm.markAsUntouched();
    this.isAddressPickerOpen.set(false);
    this.addressError.set('');
  }

  clearSelectedAddress(): void {
    this.selectedAddress.set(null);
    this.CheckoutForm.enable();
    this.CheckoutForm.reset({ city: '', phone: '', details: '' });
    this.isAddressPickerOpen.set(false);
    this.addressError.set('');
  }

  private loadSavedAddresses(): void {
    if (!this.isAuthonticated) {
      this.addressError.set('Sign in to load your saved addresses.');
      return;
    }

    this.isLoadingAddresses.set(true);
    this.savedAddresses.set([]);
    this.AuthBase.getUserAddresses().subscribe({
      next: (response: { data?: IAddress[] }) => {
        this.isLoadingAddresses.set(false);

        if (!Array.isArray(response?.data)) {
          this.addressError.set('Unable to load your saved addresses.');
          return;
        }

        this.savedAddresses.set(response.data);
      },
      error: (error: unknown) => {
        this.isLoadingAddresses.set(false);
        this.addressError.set(this.getAddressErrorMessage(error));
      },
    });
  }

  private getAddressErrorMessage(error: unknown): string {
    const message = (error as { error?: { message?: unknown } } | null)?.error?.message;
    return typeof message === 'string' && message.trim()
      ? message
      : 'Unable to load your saved addresses. Please try again.';
  }


  submitForm() {
    if (this.CheckoutForm.invalid) {
      this.CheckoutForm.markAllAsTouched();
      return;
    }

    const raw = this.CheckoutForm.getRawValue();
    const payload = {
      shippingAddress: {
        details: raw.details?.trim() ?? '',
        phone: raw.phone?.trim() ?? '',
        city: raw.city?.trim() ?? '',
      },
    };

    if (this.isOnCash()) {
      this.CheckoutBase.MakeCashOrder(this.CardId(), payload).subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigateByUrl('/order');
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      this.CheckoutBase.MakeStripeOrder(this.CardId(), payload).subscribe({
        next: (res) => {
          console.log(res);
          if (res?.session?.url) {
            window.open(res.session.url, '_blank');
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  Checktatus(states: string) {
    if (states == 'Cash') {
      this.isOnCash.set(true)
    } else {
      this.isOnCash.set(false)
    }
  }


}
