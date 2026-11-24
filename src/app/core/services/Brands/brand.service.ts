import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class BrandService {

    private readonly httpclient = inject(HttpClient)

    GetAllBrands(): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/brands?limit=40`)
    }


    GetSpecificBrand(brandId: string): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/brands/${brandId}`)
    }

}
