import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class CategoriesService {
    private readonly httpclient = inject(HttpClient)



    getAllcategories(): Observable<any> {
        return this.httpclient.get(`${environment.baseUrl}/api/v1/categories`)
    }
}
