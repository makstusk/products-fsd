import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

export function ProductCard({ product }: { product: Product }) {
  const imgSrc = product.thumbnail || product.images?.[0] || ''

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        display: 'grid',
        gap: 10,
      }}
    >
      <div
        style={{
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f5f5f5',
          border: '1px solid #eee',
          padding: 8,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title}
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 180,       
              objectFit: 'contain',  
              display: 'block',
            }}
          />
        ) : (
          <span style={{ opacity: 0.6 }}>No image</span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <strong style={{ lineHeight: 1.2 }}>{product.title}</strong>
        <span>{product.price}$</span>
      </div>

      {product.description && (
        <p style={{ margin: 0, opacity: 0.8 }}>{product.description}</p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to={`/products/${product.id}`}>Details</Link>
        <Link to={`/products/${product.id}/edit`}>Edit</Link>
      </div>
    </div>
  )
}