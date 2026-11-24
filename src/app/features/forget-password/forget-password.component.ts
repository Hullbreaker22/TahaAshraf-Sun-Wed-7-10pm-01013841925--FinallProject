import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswrdService } from '../../core/services/Password Service/passwrd.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-forget-password',
  styleUrl: './forget-password.component.css',
  templateUrl: './forget-password.component.html',
})
export class ForgetPasswordComponent {

  step = signal<number>(1)
  EmailAddres = signal<string>('')
  SuccesssMessage = signal<string>('')
  ErrorMessage = signal<string>('')
  loading = signal<boolean>(false)

  private readonly toster = inject(ToastrService)
  private readonly fb = inject(FormBuilder)
  private readonly PassBase = inject(PasswrdService)
  private readonly router = inject(Router)

  EmailForm:FormGroup = this.fb.group({
    email:['',[Validators.required, Validators.email]]
  })


  CodeForm:FormGroup = this.fb.group({
    resetCode:['',[Validators.required]]
  })

  restForm:FormGroup = this.fb.group({
    newPassword:['',[Validators.required]]
  })


SentRestCode() {
    this.loading.set(true)
    this.PassBase.sendVerificationCode(this.EmailForm.value).pipe(finalize(()=>{
      this.loading.set(false)
    })).subscribe({
      next: (res) => {
        this.EmailAddres.set(this.EmailForm.value)
        this.SuccesssMessage.set(res.message);          
        this.toster.success(this.SuccesssMessage());     
        this.step.set(2);
      },
      error: (err) => {
        this.ErrorMessage.set(err.error.message || err.message);
        this.toster.error(err.error.message || err.message);
      }
    });
  }


  VerifyCode(){
    this.loading.set(true)
    this.PassBase.VerifyrestCode(this.CodeForm.value).pipe(finalize(()=>{
      this.loading.set(false)
    })).subscribe({
      next:(res)=>{
        console.log(res);
        
        this.SuccesssMessage.set('Verified Code Successfully!');          
        this.toster.success(this.SuccesssMessage());  
        this.step.set(3);        
      },error:(err)=>{

        this.ErrorMessage.set(err.error.message || err.message);
        this.toster.error(err.error.message || err.message);
        
      }
    })
  }

ResetPassword(){
  
    let Data = {
      'email': this.EmailForm.get('email')?.value , 
      'newPassword': this.restForm.get('newPassword')?.value 
    }

      this.loading.set(true)
    this.PassBase.ResetPasswrod(Data).pipe(finalize(()=>{
      this.loading.set(false)
    })).subscribe({
      next: (res) => {
        this.SuccesssMessage.set('Reset Password Successfully!!');   
        this.toster.success(this.SuccesssMessage());
        this.router.navigateByUrl('/home')
      },
      error: (err) => {
        this.ErrorMessage.set(err.error.message || err.message);
        this.toster.error(err.error.message || err.message);
      }
    })
  }




}
