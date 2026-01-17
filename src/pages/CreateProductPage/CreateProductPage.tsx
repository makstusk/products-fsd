import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@app/store/hooks'
import { addCreatedProduct } from '@entities/product/model/createdProductsSlice'
import type { CreatedProduct } from '@entities/product/types/product'

function genId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return String(Date.now())
}
 
export function CreateProductPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [published, setPublished] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const canSubmit = useMemo(
    () => title.trim().length >= 2 && price >= 0,
    [title, price],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const product: CreatedProduct = {
      id: genId(),
      title: title.trim(),
      description: description.trim(),
      price,
      published,
      createdAt: new Date().toISOString(),
      imageUrl: imageUrl.trim() || undefined,
    }

    dispatch(addCreatedProduct(product))
    navigate('/products?tab=created', { replace: true })
  }

  return (
    <div>
      <h1>Create product</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          <div>Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          <div>Description</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
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

        <label>
          <div>Image URL</div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
            Вставь ссылку на изображение. Если пусто — будет placeholder.
          </div>
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>Published</span>
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={!canSubmit}>Create</button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
