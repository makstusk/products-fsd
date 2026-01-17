import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  useGetCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '@entities/product/api/productsApi'
import { ProductCard } from '@entities/product/ui/ProductCard'
import { CreatedProductCard } from '@entities/product/ui/CreatedProductCard'
import { useAppDispatch, useAppSelector } from '@app/store/hooks'
import {
  selectCreatedFilter,
  selectCreatedProducts,
} from '@entities/product/model/selectors'
import {
  setCreatedFilter,
  type CreatedFilter,
} from '@entities/product/model/createdProductsSlice'

type Tab = 'api' | 'created'

const DEFAULT_LIMIT = 8 as const
const ALLOWED_LIMITS = new Set([8, 16, 20])
const SEARCH_DEBOUNCE_MS = 400

function parseLimit(v: string | null): number {
  const n = Number(v)
  if (!Number.isInteger(n)) return DEFAULT_LIMIT
  if (!ALLOWED_LIMITS.has(n)) return DEFAULT_LIMIT
  return n
}

function parseSkip(v: string | null): number {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 0) return 0
  return n
}

export function ProductsPage() {
  const [sp, setSp] = useSearchParams()

  const tab = (sp.get('tab') as Tab) || 'api'
  const limit = parseLimit(sp.get('limit'))
  const skip = parseSkip(sp.get('skip'))

  // Category filter: "all" or category slug
  const category = sp.get('category') || 'all'

  // Search query param
  const qParam = sp.get('q') || ''
  const [searchInput, setSearchInput] = useState(qParam)

  // Keep input synced if user navigates back/forward and q changes
  useEffect(() => {
    setSearchInput(qParam)
  }, [qParam])

  const [debouncedQ, setDebouncedQ] = useState(qParam)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  const trimmedQ = useMemo(() => debouncedQ.trim(), [debouncedQ])

  const isSearchMode = tab === 'api' && trimmedQ.length > 0
  const isCategoryMode = tab === 'api' && !isSearchMode && category !== 'all'

  
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery(undefined, { skip: tab !== 'api' || isSearchMode })

  const common = useGetProductsQuery(
    { limit, skip },
    { skip: tab !== 'api' || isSearchMode || isCategoryMode },
  )

  const byCategory = useGetProductsByCategoryQuery(
    { category, limit, skip },
    { skip: tab !== 'api' || isSearchMode || !isCategoryMode },
  )

  const searched = useSearchProductsQuery(
    { q: trimmedQ, limit, skip },
    { skip: tab !== 'api' || !isSearchMode },
  )

  const data = isSearchMode ? searched.data : isCategoryMode ? byCategory.data : common.data
  const isLoading = isSearchMode ? searched.isLoading : isCategoryMode ? byCategory.isLoading : common.isLoading
  const isError = isSearchMode ? searched.isError : isCategoryMode ? byCategory.isError : common.isError
  const error = isSearchMode ? searched.error : isCategoryMode ? byCategory.error : common.error

  const created = useAppSelector(selectCreatedProducts)
  const createdFilter = useAppSelector(selectCreatedFilter)
  const dispatch = useAppDispatch()

  const filteredCreated = created.filter((p) => {
    if (createdFilter === 'all') return true
    if (createdFilter === 'published') return p.published
    return !p.published
  })

  const setTab = (next: Tab) => {
    const nextSp = new URLSearchParams(sp)
    nextSp.set('tab', next)

    if (next === 'api') {
      nextSp.set('limit', String(limit || DEFAULT_LIMIT))
      nextSp.set('skip', String(skip || 0))
      if (!nextSp.get('category')) nextSp.set('category', 'all')
      // q оставляем как есть (пользователь мог искать)
    }

    setSp(nextSp, { replace: true })
  }

  const setLimit = (nextLimit: number) => {
    const safeLimit = ALLOWED_LIMITS.has(nextLimit) ? nextLimit : DEFAULT_LIMIT
    const nextSp = new URLSearchParams(sp)
    nextSp.set('limit', String(safeLimit))
    nextSp.set('skip', '0')
    nextSp.set('tab', 'api')
    if (!nextSp.get('category')) nextSp.set('category', 'all')
    setSp(nextSp, { replace: true })
  }

  const setCategory = (nextCategory: string) => {
    const nextSp = new URLSearchParams(sp)
    nextSp.set('tab', 'api')
    nextSp.set('category', nextCategory)
    nextSp.set('skip', '0')
    nextSp.set('limit', String(limit || DEFAULT_LIMIT))
    // при выборе категории сбрасываем поиск
    nextSp.delete('q')
    setSearchInput('')
    setSp(nextSp, { replace: true })
  }

  const setSearchQ = (nextQ: string) => {
    setSearchInput(nextQ)

    const nextSp = new URLSearchParams(sp)
    nextSp.set('tab', 'api')
    nextSp.set('limit', String(limit || DEFAULT_LIMIT))
    nextSp.set('skip', '0')

    if (nextQ.trim().length === 0) {
      nextSp.delete('q')
    } else {
      nextSp.set('q', nextQ)
      nextSp.set('category', 'all')
    }

    setSp(nextSp, { replace: true })
  }

  const clearSearch = () => setSearchQ('')

  const nextPage = () => {
    const nextSp = new URLSearchParams(sp)
    nextSp.set('skip', String(skip + limit))
    nextSp.set('tab', 'api')
    nextSp.set('limit', String(limit || DEFAULT_LIMIT))
    if (!nextSp.get('category')) nextSp.set('category', 'all')
    setSp(nextSp, { replace: true })
  }

  const prevPage = () => {
    const nextSp = new URLSearchParams(sp)
    nextSp.set('skip', String(Math.max(0, skip - limit)))
    nextSp.set('tab', 'api')
    nextSp.set('limit', String(limit || DEFAULT_LIMIT))
    if (!nextSp.get('category')) nextSp.set('category', 'all')
    setSp(nextSp, { replace: true })
  }

  const setFilter = (f: CreatedFilter) => dispatch(setCreatedFilter(f))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>/products</h1>
        <Link to="/products/create">Create</Link>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button disabled={tab === 'api'} onClick={() => setTab('api')}>
          API Products
        </button>
        <button disabled={tab === 'created'} onClick={() => setTab('created')}>
          Created Products
        </button>
      </div>

      {tab === 'api' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search (no submit button) */}
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ opacity: 0.7 }}>Search:</span>
              <input
                value={searchInput}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Type to search..."
                style={{ width: 220 }}
              />
              <button type="button" onClick={clearSearch} disabled={searchInput.length === 0}>
                Clear
              </button>
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ opacity: 0.7 }}>Category:</span>
              <select
                value={isSearchMode ? 'all' : category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isCategoriesLoading || isSearchMode}
              >
                <option value="all">All</option>
                {(categories ?? []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <span style={{ opacity: 0.7 }}>Limit:</span>
            <button onClick={() => setLimit(8)} disabled={limit === 8}>8</button>
            <button onClick={() => setLimit(16)} disabled={limit === 16}>16</button>
            <button onClick={() => setLimit(20)} disabled={limit === 20}>20</button>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={prevPage} disabled={skip === 0}>Prev</button>
              <button onClick={nextPage}>Next</button>
            </div>
          </div>

          {isLoading && <p style={{ marginTop: 12 }}>Loading...</p>}
          {isError && (
            <p style={{ marginTop: 12 }}>
              Error loading products: {String((error as any)?.status ?? '')}
            </p>
          )}

          {data && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              {data.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'created' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ opacity: 0.7 }}>Filter:</span>
            <button onClick={() => setFilter('all')} disabled={createdFilter === 'all'}>All</button>
            <button onClick={() => setFilter('published')} disabled={createdFilter === 'published'}>Published</button>
            <button onClick={() => setFilter('unpublished')} disabled={createdFilter === 'unpublished'}>Unpublished</button>
          </div>

          {filteredCreated.length === 0 ? (
            <p style={{ marginTop: 12, opacity: 0.8 }}>No created products yet.</p>
          ) : (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              {filteredCreated.map((p) => (
                <CreatedProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
