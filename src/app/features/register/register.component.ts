import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/authoService/auth.service';
import Swal from 'sweetalert2';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

interface PasswordStrength {
  label: string;
  percentage: number;
  color: string;
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const rePassword = control.get('rePassword')?.value;

  return rePassword && password !== rePassword ? { passwordMismatch: true } : null;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.component.css',
  templateUrl: './register.component.html',
})

export class RegisterComponent {
  private readonly authService = inject(AuthService);

  readonly isSubmitting:WritableSignal<boolean> = signal(false);
  readonly errorMessage:WritableSignal<string> = signal('');
  readonly successMessage:WritableSignal<string> = signal('');
  readonly router = inject(Router)
  registerForm = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,}){0,3}$/),
        ],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
        ],
      }),
      rePassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
        ],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      terms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatchValidator },
  );

  private readonly passwordValue = toSignal(
    this.registerForm.controls.password.valueChanges,
    { initialValue: this.registerForm.controls.password.value },
  );
  readonly passwordStrength = computed(() =>
    this.measurePasswordStrength(this.passwordValue()),
  );

  measurePasswordStrength(password: string): PasswordStrength {
    const checks = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 8,
    ];
    const score = checks.filter(Boolean).length;

    if (score <= 1) {
      return { label: 'Weak', percentage: score * 20, color: '#ef4444' };
    }
    if (score <= 3) {
      return { label: 'Fair', percentage: score * 20, color: score === 2 ? '#f97316' : '#eab308' };
    }
    if (score === 4) {
      return { label: 'Good', percentage: 80, color: '#84cc16' };
    }

    return { label: 'Strong', percentage: 100, color: '#22c55e' };
  }

  showAlert() {
  Swal.fire({
    title: 'Account Created!',
    text: 'Your account has been created successfully.',
    icon: 'success',
    iconColor: '#10B981', 
    showConfirmButton: true,
    confirmButtonText: 'Continue to Dashboard',
    confirmButtonColor: '#4F46E5', 
    timer: 4000, 
    timerProgressBar: true, 
    buttonsStyling: true,
    customClass: {
      popup: 'rounded-4 shadow-lg', 
      confirmButton: 'px-4 py-2 rounded-3 fs-6'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster' 
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster' 
    }
  });
}



  Registeruser(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password, rePassword, phone } = this.registerForm.getRawValue();

    this.authService.Register({ name, email, password, rePassword, phone }).subscribe({
      next: () => {  
        this.isSubmitting.set(false);
        this.showAlert()
        this.router.navigateByUrl('/login')
      },
      error: (err) => {
        console.log(err);       
        this.isSubmitting.set(false);
        this.errorMessage.set('Registration failed. Please try again.');
      },
    });
  }

}
