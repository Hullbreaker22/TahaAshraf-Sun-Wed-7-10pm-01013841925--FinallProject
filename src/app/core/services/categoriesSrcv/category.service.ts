import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Service()
export class CategoryService {
    httpclient = inject(HttpClient)

    getallCategories(): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/categories`)
    }


    getSpecificCat(CatId: string): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/categories/${CatId}`)
    }

}
