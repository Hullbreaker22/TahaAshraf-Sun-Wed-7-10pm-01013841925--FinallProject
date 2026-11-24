import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Homelist } from '../../core/models/homelist.interface';
import { CategoryService } from '../../core/services/categoriesSrcv/category.service';
import { ICat } from '../../core/models/icat.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  styleUrl: './footer.component.css',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {

  private readonly CatBase = inject(CategoryService)
  catList = signal<ICat[]>([])



  ngOnInit(): void {
    this.getAllCategories()
  }
  readonly benefitsList: Homelist[] = [
    {
      icon: 'fa-solid fa-truck-fast',
      bgcolor: '#DCFCE7',
      content: 'Free Shipping',
      comment: 'On orders over 500 EGP',
      iconColor: '#16A34A',
    },
    {
      icon: 'fa-solid fa-rotate-left',
      bgcolor: '#DCFCE7',
      content: 'Easy Returns',
      comment: '14-day return policy',
      iconColor: '#16A34A',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      bgcolor: '#DCFCE7',
      content: 'Secure Payment',
      comment: '100% secure checkout',
      iconColor: '#16A34A',
    },
    {
      icon: 'fa-solid fa-headset',
      bgcolor: '#DCFCE7',
      content: '24/7 Support',
      comment: 'Contact us anytime',
      iconColor: '#16A34A',
    },
  ];



  getAllCategories(){
    this.CatBase.getallCategories().subscribe({
      next:(res)=>{
        this.catList.set(res.data)
      },error:(err)=>{
        
      }
    })
  }
}
