import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class AuthService {

    httpclient = inject(HttpClient)




    Register(data: any): Observable<any> {
        return this.httpclient.post(`${environment.baseUrl}/api/v1/auth/signup`, data)
    }

    login(data: any): Observable<any> {
        return this.httpclient.post(`${environment.baseUrl}/api/v1/auth/signin`, data)
    }


    VerifyUser(): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/auth/verifyToken`)
    }

    UpdateUserData(data: any): Observable<any> {
        return this.httpclient.put(`${environment.baseUrl}/api/v1/users/updateMe/`, data)
    }

    UpdateLoggedUserPassword(data: any) {
        return this.httpclient.put(`${environment.baseUrl}/api/v1/users/changeMyPassword`, data)
    }


    AddAddress(data: any): Observable<any> {
        return this.httpclient.post(`${environment.baseUrl}/api/v1/addresses`, data)
    }


    getUserAddresses(): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/addresses`)
    }


    RemoveAddress(addId: string): Observable<any> {
        return this.httpclient.delete(`${environment.baseUrl}/api/v1/addresses/${addId}`, {
            params: { addid: addId }
        });
    }

    getSpecificAddress(addId: string): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/addresses/${addId}`)
    }


    getUserOrders(UserId: string): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/orders/user/${UserId}`, { params: { UserId: UserId } })
    }


}
