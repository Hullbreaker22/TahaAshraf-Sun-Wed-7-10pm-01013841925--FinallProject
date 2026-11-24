import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../core/services/categoriesSrcv/category.service';
import { ICat } from '../../core/models/icat.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-all-cat',
  styleUrl: './all-cat.component.css',
  templateUrl: './all-cat.component.html',
})
export class AllCatComponent implements OnInit {

  private readonly CatBase = inject(CategoryService)
  AllCategories = signal<ICat[]>([])


  ngOnInit(): void {
    this.getallcategoris()
  }

  getallcategoris() {
    this.CatBase.getallCategories().subscribe({
      next: (res) => {
        this.AllCategories.set(res.data)
        
      }, error: (err) => {
        console.log(err
        );

      }
    })
  }


  getSpecific(cateoryId: string) {
    this.CatBase.getSpecificCat(cateoryId).subscribe({
      next: (res) => {
        console.log(res);
      }, error: (err) => {
        console.log(err);
      }
    })
  }
}
