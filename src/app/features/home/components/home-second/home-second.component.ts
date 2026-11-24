import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CategoryService } from '../../../../core/services/categoriesSrcv/category.service';
import { ICat } from '../../../../core/models/icat.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-second',
  styleUrl: './home-second.component.css',
  templateUrl: './home-second.component.html',
})
export class HomeSecondComponent implements OnInit   {

  private readonly Catbase = inject(CategoryService)
  CategoryList:WritableSignal<ICat[]> = signal([]) 

  ngOnInit(): void {
    this.getAllcategories()
  }


  getAllcategories(){
        this.Catbase.getallCategories().subscribe({
      next:(res)=>{
        this.CategoryList.set(res.data)        
      },error:(err)=>{
        console.log(err);
        
      }
    })
  }
  
}
