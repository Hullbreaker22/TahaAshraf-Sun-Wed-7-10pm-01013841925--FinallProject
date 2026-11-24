import { DOCUMENT } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { GlobalService } from '../../core/services/Global/global.service';
import { CategoryService } from '../../core/services/categoriesSrcv/category.service';
import { ICat } from '../../core/models/icat.interface';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/authoService/auth.service';
import { IUser } from '../../core/models/iuser.interface';

@Component({
  imports: [RouterLink , ReactiveFormsModule],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {


  private readonly CookieBase = inject(CookieService)
  private readonly router = inject(Router)
  private readonly Globalbase = inject(GlobalService)
  private readonly CatBase = inject(CategoryService)
    private readonly authoBase = inject(AuthService)
  private readonly document = inject(DOCUMENT);
  private originalBodyOverflow = '';
  private originalDocumentOverflow = '';
  private scrollLockActive = false;

  CatList = signal<ICat[]>([])
  User = signal<IUser>({} as IUser)
  readonly userMenuOpen = signal(false);
  readonly mobileMenuOpen = signal(false);

  savedtoken = this.Globalbase.savedtoken
  readonly totalCartItems = this.Globalbase.totalItems;
  readonly totalWishlistItems = this.Globalbase.totalWishlistItems;
  searchForm = new FormGroup({
    search: new FormControl('')
  });
  mobileSearchForm = new FormGroup({
    search: new FormControl('')
  });



  ngOnInit(): void {
    this.getToken();
    this.GetAllCategories()

    if (this.savedtoken()) {
      this.Globalbase.getuserCart();
    } else {
      this.Globalbase.getSavedCarts();
    }
    this.Globalbase.loadWishlist();

    if (this.savedtoken()) {
      this.getuser();
    }
  }
  

  GetAllCategories(){
    this.CatBase.getallCategories().subscribe({
      next:(res)=>{
        this.CatList.set(res.data)

      },error:(err)=>{

      }
    })
  }



  getToken(){
    let specialToken = this.CookieBase.get('token');
    if(specialToken){
        this.savedtoken.set(specialToken)
    }else{
      this.savedtoken.set(null)
    }

  }

  logout(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.CookieBase.delete('token'); 
    this.savedtoken.set(null)
    this.getToken();
    this.Globalbase.getSavedCarts();
    this.Globalbase.loadWishlist();
    this.router.navigateByUrl('/login');
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.closeMobileMenu();
    this.userMenuOpen.update(isOpen => !isOpen);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
  }

  toggleMobileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.closeUserMenu();

    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
      return;
    }

    this.lockPageScroll();
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.unlockPageScroll();
  }

  ngOnDestroy(): void {
    this.unlockPageScroll();
  }

  private lockPageScroll(): void {
    if (this.scrollLockActive) {
      return;
    }

    this.originalBodyOverflow = this.document.body.style.overflow;
    this.originalDocumentOverflow = this.document.documentElement.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.document.documentElement.style.overflow = 'hidden';
    this.scrollLockActive = true;
  }

  private unlockPageScroll(): void {
    if (!this.scrollLockActive) {
      return;
    }

    this.document.body.style.overflow = this.originalBodyOverflow;
    this.document.documentElement.style.overflow = this.originalDocumentOverflow;
    this.scrollLockActive = false;
  }


submitform() {

  const searchTerm = (this.searchForm.get('search')?.value ?? '').trim();
  this.searchForm.reset({ search: '' });
  this.router.navigate(['/search'], {
    queryParams: { q: searchTerm || null }
  });
}

  submitMobileSearch(): void {
    const searchTerm = (this.mobileSearchForm.get('search')?.value ?? '').trim();
    this.mobileSearchForm.reset({ search: '' });
    this.closeMobileMenu();
    this.router.navigate(['/search'], {
      queryParams: { q: searchTerm || null }
    });
  }

  getuser(){
    this.authoBase.VerifyUser().subscribe({
      next:(res)=>{        
        this.User.set(res.decoded)
        
      },error:(err)=>{
        console.log(err);
        
      }
    })
  }

}
