// src/pages/EditProductPage/EditProductPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from '@entities/product/api/productsApi'
import { useAppDispatch, useAppSelector } from '@app/store/hooks'
import { selectCreatedProducts } from '@entities/product/model/selectors'
import {
  deleteCreatedProduct,
  updateCreatedProduct,
} from '@entities/product/model/createdProductsSlice'
import { isNumericId } from '@shared/lib/isNumericId'
import type { CreatedProduct } from '@entities/product/types/product'

type FormState = {
  title: string
  description: string
  price: number
  published: boolean
  imageUrl: string
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [src])

const showImage = Boolean(src) && !broken

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        padding: 12,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
            maxHeight: 520,      
            objectFit: 'contain', 
            display: 'block',
          }}
        />
      ) : (
        <span style={{ opacity: 0.65 }}>No image preview</span>
      )}
    </div>
  )
}

export function EditProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const isApi = isNumericId(id)
  const apiId = isApi ? Number(id) : 0

  const created = useAppSelector(selectCreatedProducts)
  const createdItem = created.find((p) => p.id === id)

  const dispatch = useAppDispatch()

  const [updateApi, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteApi, { isLoading: isDeletingApi }] = useDeleteProductMutation()

  const {
    data: apiProduct,
    isLoading: apiLoading,
    isError: apiError,
  } = useGetProductByIdQuery(apiId, { skip: !isApi })

  const initial: FormState | null = useMemo(() => {
    if (isApi) {
      if (!apiProduct) return null
      return {
        title: apiProduct.title ?? '',
        description: apiProduct.description ?? '',
        price: apiProduct.price ?? 0,
        published: true, 
        imageUrl: '', 
      }
    }

    if (!createdItem) return null
    return {
      title: createdItem.title,
      description: createdItem.description,
      price: createdItem.price,
      published: createdItem.published,
      imageUrl: createdItem.imageUrl ?? '',
    }
  }, [isApi, apiProduct, createdItem])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [published, setPublished] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initial) return
    if (initializedRef.current) return

    setTitle(initial.title)
    setDescription(initial.description)
    setPrice(initial.price)
    setPublished(initial.published)
    setImageUrl(initial.imageUrl)

    initializedRef.current = true
  }, [initial])

  const canSubmit = useMemo(
    () => title.trim().length >= 2 && price >= 0,
    [title, price],
  )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    if (isApi) {
      await updateApi({
        id: apiId,
        body: {
          title: title.trim(),
          description: description.trim(),
          price,
        },
      }).unwrap()

      navigate(`/products/${apiId}`, { replace: true })
      return
    }

    if (!createdItem) return

    const updated: CreatedProduct = {
      ...createdItem,
      title: title.trim(),
      description: description.trim(),
      price,
      published,
      imageUrl: imageUrl.trim() || undefined,
    }

    dispatch(updateCreatedProduct(updated))
    navigate(`/products/${updated.id}`, { replace: true })
  }

  const onDelete = async () => {
    const ok = window.confirm(
      isApi
        ? 'Удалить этот API-продукт? (на сервере это симуляция, но UI обновится)'
        : 'Удалить этот созданный продукт?',
    )
    if (!ok) return

    if (isApi) {
      await deleteApi(apiId).unwrap()
      navigate('/products?tab=api', { replace: true })
      return
    }

    if (!createdItem) return
    dispatch(deleteCreatedProduct(createdItem.id))
    navigate('/products?tab=created', { replace: true })
  }

  if (!id) return <p>Missing id</p>

  if (isApi) {
    if (apiLoading) return <p>Loading...</p>
    if (apiError || !apiProduct) return <p>API product not found.</p>
  } else {
    if (!createdItem) return <p>Created product not found.</p>
  }

  const isDeleting = isApi ? isDeletingApi : false
  const disableActions = isUpdating || isDeleting

  const apiImgSrc = apiProduct?.thumbnail || apiProduct?.images?.[0] || ''
  const createdImgSrc = imageUrl.trim()

  const previewSrc = isApi ? apiImgSrc : createdImgSrc

  return (
    <div>
      <h1>Edit product</h1>

      <div style={{ marginTop: 12, marginBottom: 12, maxWidth: 520 }}>
        <ImagePreview src={previewSrc} alt={title || (isApi ? 'API product' : 'Created product')} />
        {!isApi && (
          <p style={{ margin: '8px 0 0', opacity: 0.7, fontSize: 12 }}>
            Превью обновляется по введённому Image URL. Если ссылка битая — будет заглушка.
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          <div>Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          <div>Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </label>

        <label>
          <div>Price</div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
          />
        </label>

        {!isApi && (
          <>
            <label>
              <div>Image URL</div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span>Published</span>
            </label>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" disabled={!canSubmit || disableActions}>
            Save
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={disableActions}
            style={{ border: '1px solid #d33' }}
          >
            Delete
          </button>

          <button type="button" onClick={() => navigate(-1)} disabled={disableActions}>
            Cancel
          </button>

          <Link to="/products">Back to products</Link>
        </div>

        {isApi && (
          <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>
          </p>
        )}
      </form>
    </div>
  )
}
