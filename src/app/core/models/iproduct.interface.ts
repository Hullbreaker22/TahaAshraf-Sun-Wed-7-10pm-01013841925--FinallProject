export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface IProduct {
  sold?: number;
  images?: string[];
  subcategory: Subcategory[];
  ratingsQuantity?: number;
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  category: Category;
  brand: Brand;
  ratingsAverage: number;
  createdAt?: string;
  updatedAt?: string;
  id: string;
  cartQuantity?: number;
}

export interface ICartItem {
  count: number;
  _id: string;
  product: IProduct;
  price: number;
}

export interface ICartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: {
    _id: string;
    cartOwner: string;
    products: ICartItem[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    totalCartPrice: number;
  };




}





export interface IOrderShippingAddress {
  details: string;
  phone: string;
  city: string | null;
}

export interface IOrderUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface IOrderProduct extends Omit<IProduct, 'quantity'> {
  quantity?: number;
  subcategory: Subcategory[];
  category: Category;
  brand: Brand;
}

export interface IOrderCartItem {
  count: number;
  _id: string;
  product: IOrderProduct;
  price: number;
}

export interface IOrder {
  _id: string;
  id: number;
  shippingAddress: IOrderShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'card' | string;
  isPaid: boolean;
  isDelivered: boolean;
  user: IOrderUser;
  cartItems: IOrderCartItem[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}