// src/pages/ProductDetailsPage/ProductDetailsPage.tsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetProductByIdQuery } from '@entities/product/api/productsApi'
import { useAppSelector } from '@app/store/hooks'
import { selectCreatedProducts } from '@entities/product/model/selectors'
import { isNumericId } from '@shared/lib/isNumericId'
import type { Review } from '@entities/product/types/product'

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [src])

  const showImage = Boolean(src) && !broken

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        padding: 12,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setBroken(true)}
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 560,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <span style={{ opacity: 0.65 }}>No image</span>
      )}
    </div>
  )
}

function ReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 8 }}>Reviews</h2>

      {reviews.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No reviews.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {reviews.map((r, idx) => (
            <div
              key={`${r.reviewerEmail}-${r.date}-${idx}`}
              style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <strong>{r.reviewerName}</strong>
                <span style={{ opacity: 0.8 }}>Rating: {r.rating}/5</span>
              </div>

              <p style={{ marginTop: 8, marginBottom: 8 }}>{r.comment}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, opacity: 0.7 }}>
                <span>{new Date(r.date).toLocaleString()}</span>
                <span>{r.reviewerEmail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductDetailsPage() {
  const { id = '' } = useParams()

  const created = useAppSelector(selectCreatedProducts)
  const createdItem = created.find((p) => p.id === id)

  const isApi = isNumericId(id)
  const apiId = isApi ? Number(id) : 0

  const { data, isLoading, isError } = useGetProductByIdQuery(apiId, { skip: !isApi })

  if (!id) return <p>Missing id</p>

  if (!isApi) {
    if (!createdItem) return <p>Created product not found.</p>

    return (
      <div>
        <h1>{createdItem.title}</h1>

        <ProductImage src={createdItem.imageUrl || ''} alt={createdItem.title} />

        <p>{createdItem.description}</p>
        <p>
          <strong>Price:</strong> {createdItem.price}$
        </p>
        <p>
          <strong>Status:</strong> {createdItem.published ? 'published' : 'unpublished'}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to={`/products/${createdItem.id}/edit`}>Edit</Link>
          <Link to="/products?tab=created">Back</Link>
        </div>

        <div style={{ marginTop: 16, opacity: 0.8 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Reviews</h2>
          <p>Reviews are available only for API products.</p>
        </div>
      </div>
    )
  }

  if (isLoading) return <p>Loading...</p>
  if (isError || !data) return <p>API product not found.</p>

  const imgSrc = data.thumbnail || data.images?.[0] || ''

  return (
    <div>
      <h1>{data.title}</h1>

      <ProductImage src={imgSrc} alt={data.title} />

      <p>{data.description}</p>
      <p>
        <strong>Price:</strong> {data.price}$
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to={`/products/${data.id}/edit`}>Edit</Link>
        <Link to="/products?tab=api">Back</Link>
      </div>

      <ReviewsList reviews={data.reviews ?? []} />
    </div>
  )
}
