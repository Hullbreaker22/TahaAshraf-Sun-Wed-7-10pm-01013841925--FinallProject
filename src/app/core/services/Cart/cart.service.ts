import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ICartResponse } from '../../models/iproduct.interface';

@Service()
export class CartService {

    httpclient = inject(HttpClient)


    addtoCart(productId: string): Observable<any> {
    return this.httpclient.post(`${environment.baseUrl}/api/v1/cart`, { productId: productId });
    }



    getUserCart():Observable<ICartResponse>{
        return this.httpclient.get<ICartResponse>(`${environment.baseUrl}/api/v1/cart`)
    }


    RemoveItemfromCart(productId:any):Observable<any>{
        return this.httpclient.delete(`${environment.baseUrl}/api/v1/cart/${productId}`)
    }


UpdateCount(Productid: string, count: number): Observable<any> {
    return this.httpclient.put(`${environment.baseUrl}/api/v1/cart/${Productid}`, { count: count });
}

}
