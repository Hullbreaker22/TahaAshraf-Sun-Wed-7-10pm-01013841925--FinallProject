import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { IProduct } from '../../models/iproduct.interface';
import { Metadata } from '../../models/metadata.interface';

interface ProductsResponse {
    data: IProduct[];
    metadata: Metadata;
}

interface ProductResponse {
    data: IProduct;
}

@Service()
export class ProductService {

    httpclient = inject(HttpClient)

    getAllProducts(Page: number = 1): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?limit=20&page=${Page}`);
    }


    getSpecificProduct(productId: string): Observable<IProduct> {
        return this.httpclient.get<ProductResponse>(`${environment.baseUrl}/api/v1/products/${productId}`).pipe(
            map(response => response.data)
        );
    }


    BrandFilter(BrandId: string): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?brand=${BrandId}`);
    }



    CategoryFilter(categoryId: string): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?category[in]=${categoryId}`);
    }


    MaxPrice(PriceNum: number): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?price[lte]=${PriceNum}`);
    }


    MinPrice(PriceNum: number): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?price[gte]=${PriceNum}`);
    }

    HighToLow(): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?sort=-price`);
    }

    LowToHigh(): Observable<ProductsResponse> {
        return this.httpclient.get<ProductsResponse>(`${environment.baseUrl}/api/v1/products?sort=+price`);
    }



}
