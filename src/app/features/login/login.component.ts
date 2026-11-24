import { ToastrService } from 'ngx-toastr';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/authoService/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { GlobalService } from '../../core/services/Global/global.service';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../../core/services/Cart/cart.service';
import { ICartItem } from '../../core/models/iproduct.interface';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly baseCookie = inject(CookieService)
  private readonly GlobalBase = inject(GlobalService)
  private readonly platformid = inject(PLATFORM_ID)
  private readonly CartBase = inject(CartService)  
  readonly toaster = inject(ToastrService)
  readonly isSubmitting = signal(false);
  
  savedCartsList = signal<ICartItem[] | null>([])


  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),


    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });


  Loginuser(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next:(res) => {
        this.baseCookie.set('token', res.token, 7);
        this.GlobalBase.Login()
        this.GlobalBase.getuserCart();
         Swal.fire({
          title: 'Login Successful!',
          text: 'Welcome back to FreshCart.',
          icon: 'success',
          iconColor: '#10B981',
          confirmButtonText: 'Continue',
          confirmButtonColor: '#16A34A',
          timer: 2500,
          timerProgressBar: true,
        });
        if(isPlatformBrowser(this.platformid)){
          let x = localStorage.getItem('cart')
          let y = JSON.parse(x!)
          if(y){
            this.savedCartsList.set(y)
            this.savedCartsList()?.forEach((item)=>{
              this.CartBase.addtoCart(item._id).subscribe({
                next:(res)=>{
                  console.log(res);
                  this.GlobalBase.getuserCart();

                },error:(err)=>{
                  console.log(err);                  
                }
              })                
            })
            this.toaster.success('Cart Added Successfully!','',{toastClass:'ngx-toastr success-accent'})
            localStorage.removeItem('cart')
          }
        }

        this.GlobalBase.syncLocalWishlist().subscribe({
          error: error => {
            console.error('Unable to sync the saved wishlist after login.', error);
            this.GlobalBase.loadWishlist();
            this.isSubmitting.set(false);
            this.router.navigateByUrl('/home');
          },
          complete: () => {
            this.GlobalBase.loadWishlist();
            this.isSubmitting.set(false);
            this.router.navigateByUrl('/home');
          },
        });
      },

      error:  () => {
        this.isSubmitting.set(false);
         Swal.fire({
          title: 'Login Failed',
          text: 'Please check your email and password, then try again.',
          icon: 'error',
          confirmButtonColor: '#16A34A',
        });
      },
    });
  }
}
