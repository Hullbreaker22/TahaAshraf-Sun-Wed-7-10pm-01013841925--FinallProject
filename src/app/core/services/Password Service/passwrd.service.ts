import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class PasswrdService {

    private readonly httpclient = inject(HttpClient)

    sendVerificationCode(Email:any):Observable<any>{
        return this.httpclient.post(`${environment.baseUrl}/api/v1/auth/forgotPasswords`,Email)
    }


    VerifyrestCode(Code:any):Observable<any>{
        return this.httpclient.post(`${environment.baseUrl}/api/v1/auth/verifyResetCode`,Code)
    }


    ResetPasswrod(Data:any):Observable<any>{
        return this.httpclient.put(`${environment.baseUrl}/api/v1/auth/resetPassword`,Data)
    }
    
}
