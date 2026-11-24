import { Routes } from '@angular/router';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { loginGuard } from './core/guards/Login/login-guard';
import { loggedGuard } from './core/guards/Logged/logged-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), title: 'Home | FreshCart' },
    { path: 'brands', loadComponent: () => import('./features/brands/brands.component').then(m => m.BrandsComponent), title: 'Brands | FreshCart' },
    { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent), title: 'Cart | FreshCart' },
    { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent), title: 'orders | FreshCart' },
    { path: 'shop', loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent), title: 'Shop | FreshCart' },
    { path: 'details/:id', loadComponent: () => import('./features/product-details/product-details.component').then(m => m.ProductDetailsComponent), title: 'Product-Details | FreshCart' },
    { path: 'wishlist', loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent), title: 'wishlist | FreshCart' },
    { path: 'checkout', loadComponent: () => import('./features/check-out/check-out.component').then(m => m.CheckOutComponent), title: 'Check-out | FreshCart' , canActivate: [loginGuard] },
    { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent), title: 'Categories | FreshCart' },
    { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent), title: 'Login | FreshCart' , canActivate:[loggedGuard] },
    { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent), title: 'Register | FreshCart', canActivate:[loggedGuard] },
    { path: 'AllCategories', loadComponent: () => import('./features/all-cat/all-cat.component').then(m => m.AllCatComponent), title: 'AllCategories | FreshCart' },
    { path: 'payment', loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent), title: 'Payment | FreshCart' },
    {path: 'privacy-policy',loadComponent: () =>import('./features/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),title: 'Privacy Policy | FreshCart',},
    {path: 'terms-of-service',loadComponent: () =>import('./features/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent),title: 'Terms of Service | FreshCart',},
    {path: 'cookie-policy',loadComponent: () =>import('./features/cookie-policy/cookie-policy.component').then((m) => m.CookiePolicyComponent),title: 'Cookie Policy | FreshCart'},
    { path: 'Support', loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent), title: 'Support | FreshCart' },
    { path: 'order', loadComponent: () => import('./features/cash-order/cash-order.component').then(m => m.CashOrderComponent), title: 'Orders | FreshCart' },
    { path: 'search', loadComponent: () => import('./features/search-page/search-page.component').then(m => m.SearchPageComponent), title: 'Search | FreshCart' },
    { path: 'myProfile', loadComponent: () => import('./features/my-profile/my-profile.component').then(m => m.MyProfileComponent), title: 'Profile | FreshCart' },
    { path: 'categoryDetails/:id', loadComponent: () => import('./features/category-details/category-details.component').then(m => m.CategoryDetailsComponent), title: 'Category Details | FreshCart' },
    { path: 'brandDetails/:id', loadComponent: () => import('./features/brand-details/brand-details.component').then(m => m.BrandDetailsComponent), title: 'Brand Details | FreshCart' },
    { path: 'allorders', loadComponent: () => import('./features/allorders/allorders.component').then(m => m.AllordersComponent), title: 'Orders | FreshCart' },
    { path: 'changerPassword', loadComponent: () => import('./features/change-password/change-password.component').then(m => m.ChangePasswordComponent), title: 'Chage-Password | FreshCart' },
    { path: 'forgetPassword', loadComponent: () => import('./features/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent), title: 'Forget-Password | FreshCart' },
    { path: '**', component: NotFoundComponent, title: 'Error-404 | FreshCart' }
];
