export type Product = {
  id: number
  title: string
  description: string
  price: number
  discountPercentage?: number
  rating?: number
  stock?: number
  brand?: string
  category?: string
  thumbnail?: string
  images?: string[]
  reviews?: Review[]
}

export type Review = {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export type ProductsListResponse = {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export type CreatedProduct = {
  id: string 
  title: string
  description: string
  price: number
  published: boolean
  createdAt: string 
  imageUrl?: string
}

