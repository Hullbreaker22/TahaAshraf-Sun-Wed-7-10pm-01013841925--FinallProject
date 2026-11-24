import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/authoService/auth.service';
import { IUser } from '../../core/models/iuser.interface';
import { IAddress } from '../../core/models/iaddress.interface';
import { RouterLink } from '@angular/router';

type ProfileUser = IUser & {
  email?: string;
  phone?: string;
};

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const rePassword = control.get('rePassword')?.value;

  return rePassword && password !== rePassword ? { passwordMismatch: true } : null;
}

@Component({
  imports: [ReactiveFormsModule ,  RouterLink],
  selector: 'app-my-profile',
  styleUrl: './my-profile.component.css',
  templateUrl: './my-profile.component.html',
})
export class MyProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cookieService = inject(CookieService);
  private readonly toaster = inject(ToastrService);

  readonly user = signal<ProfileUser | null>(null);
  readonly profileSubmitting = signal(false);
  readonly passwordSubmitting = signal(false);
  readonly profileError = signal('');
  readonly passwordError = signal('');
  readonly activeSection = signal<'settings' | 'addresses'>('settings');
  readonly addresses = signal<IAddress[]>([]);
  readonly addressesLoading = signal(false);
  readonly addressesError = signal('');
  readonly isAddressModalOpen = signal(false);
  readonly addressSubmitting = signal(false);
  readonly deletingAddressId = signal<string | null>(null);
  readonly addressError = signal('');

  readonly profileForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      rePassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    },
    { validators: passwordsMatchValidator },
  );

  readonly addressForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    details: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    if (!this.cookieService.get('token')) {
      this.profileError.set('Please sign in to view your account information.');
      return;
    }

    this.loadUser();
    this.getAddresses()
  }

  showSection(section: 'settings' | 'addresses'): void {
    this.activeSection.set(section);
  }

  openAddressModal(): void {
    this.addressError.set('');
    this.addressForm.reset();
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal(): void {
    if (!this.addressSubmitting()) {
      this.isAddressModalOpen.set(false);
    }
  }

  addAddress(): void {
    this.addressError.set('');

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.addressSubmitting.set(true);
    this.authService.AddAddress(this.addressForm.getRawValue()).subscribe({
      next: () => {
        this.addressSubmitting.set(false);
        this.isAddressModalOpen.set(false);
        this.addressForm.reset();
        this.toaster.success('Address added successfully.');
        this.getAddresses();
      },
      error: (error: unknown) => {
        this.addressSubmitting.set(false);
        this.addressError.set(
          this.getErrorMessage(error, 'Unable to add this address. Please try again.'),
        );
      },
    });
  }

  removeAddress(addressId: string): void {
    this.addressesError.set('');
    this.deletingAddressId.set(addressId);

    this.authService.RemoveAddress(addressId).subscribe({
      next: () => {
        this.deletingAddressId.set(null);
        this.addresses.update(addresses => addresses.filter(address => address._id !== addressId));
        this.toaster.success('Address removed successfully.');
      },
      error: (error: unknown) => {
        this.deletingAddressId.set(null);
        this.addressesError.set(
          this.getErrorMessage(error, 'Unable to remove this address. Please try again.'),
        );
      },
    });
  }

  updateUserData(): void {
    this.profileError.set('');

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSubmitting.set(true);
    this.authService.UpdateUserData(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.profileSubmitting.set(false);
        const updatedProfile = this.profileForm.getRawValue();
        const currentUser = this.user();

        if (currentUser) {
          this.user.set({ ...currentUser, ...updatedProfile });
        }

        this.toaster.success('Your profile has been updated.');
      },
      error: (error: unknown) => {
        this.profileSubmitting.set(false);
        this.profileError.set(
          this.getErrorMessage(error, 'Unable to update your profile. Please try again.'),
        );
      },
    });
  }

  updatePassword(): void {
    this.passwordError.set('');

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSubmitting.set(true);
    this.authService.UpdateLoggedUserPassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordSubmitting.set(false);
        this.passwordForm.reset();
        this.toaster.success('Your password has been updated.');
      },
      error: (error: unknown) => {
        this.passwordSubmitting.set(false);
        this.passwordError.set(
          this.getErrorMessage(error, 'Unable to update your password. Please try again.'),
        );
      },
    });
  }

  private loadUser(): void {
    this.authService.VerifyUser().subscribe({
      next: (response: { decoded?: ProfileUser }) => {
        const verifiedUser = response.decoded;

        if (!verifiedUser || typeof verifiedUser.name !== 'string' || typeof verifiedUser.role !== 'string') {
          this.profileError.set('Unable to load your account information.');
          return;
        }

        this.user.set(verifiedUser);
        this.profileForm.patchValue({
          name: verifiedUser.name,
          email: verifiedUser.email ?? '',
          phone: verifiedUser.phone ?? '',
        });
      },
      error: (error: unknown) => {
        this.profileError.set(
          this.getErrorMessage(error, 'Unable to load your account information. Please sign in again.'),
        );
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } } | null)?.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }


  getAddresses(): void {
    this.addressesLoading.set(true);
    this.addressesError.set('');

    this.authService.getUserAddresses().subscribe({
      next: (response: { data?: IAddress[] }) => {
        this.addressesLoading.set(false);

        if (!Array.isArray(response?.data)) {
          this.addressesError.set('The address list could not be loaded.');
          return;
        }

        this.addresses.set(response.data);
      },
      error: (error: unknown) => {
        this.addressesLoading.set(false);
        this.addressesError.set(
          this.getErrorMessage(error, 'Unable to load your addresses. Please try again.'),
        );
      },
    });
  }
}
