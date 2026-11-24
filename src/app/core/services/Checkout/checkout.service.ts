import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class CheckoutService {

    private readonly httpclient = inject(HttpClient)


    
    MakeCashOrder(CartId:string ,data:any):Observable<any>{
        return this.httpclient.post(`${environment.baseUrl}/api/v1/orders/${CartId}`,data)
    }
        


    MakeStripeOrder(CartId:string ,data:any):Observable<any>{
        return this.httpclient.post(`${environment.baseUrl}/api/v1/orders/checkout-session/${CartId}?url=http://localhost:4200`,data)
    }


}
