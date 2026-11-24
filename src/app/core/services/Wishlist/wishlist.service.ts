import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class WishlistService {

    private readonly httpclient = inject(HttpClient)


    getUserWishList():Observable<any>{
        return this.httpclient.get(`${environment.baseUrl}/api/v1/wishlist`)
    }


    RemovefromWishlist(productId:string):Observable<any>{
        return this.httpclient.delete(`${environment.baseUrl}/api/v1/wishlist/${productId}`)
    }

    addtowishList(productId:string):Observable<any>{
        return this.httpclient.post(`${environment.baseUrl}/api/v1/wishlist`,{productId : productId})
    }
}
