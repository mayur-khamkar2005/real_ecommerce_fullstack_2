import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products', {
          params: { keyword, category, sort, page, limit: 8 }
        });
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort, page]);

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set('sort', e.target.value);
    else newParams.delete('sort');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      {/* Mobile Filter Row (Horizontal Scroll) */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 border-b border-border whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.delete('category'); p.set('page', '1'); setSearchParams(p);
          }}
          className={`px-4 py-1.5 border text-xs uppercase tracking-wider shrink-0 ${!category ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border bg-surface text-textMuted hover:border-secondary'}`}
        >
          All Categories
        </button>
        {['Electronics', 'Fashion', 'Gaming', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Accessories', 'Footwear', 'Gadgets'].map(cat => (
          <button 
            key={cat}
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.set('category', cat); p.set('page', '1'); setSearchParams(p);
            }}
            className={`px-4 py-1.5 border text-xs uppercase tracking-wider shrink-0 ${category === cat ? 'border-secondary bg-secondary text-white font-semibold' : 'border-border bg-surface text-textMuted hover:border-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r border-border md:pr-6 hidden md:block">
        <div className="mb-6">
          <h3 className="font-semibold text-xs uppercase tracking-widest text-textMuted mb-3 border-b border-border pb-2">Categories</h3>
          <ul className="space-y-2 text-sm text-textMain">
            {['Electronics', 'Fashion', 'Gaming', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Accessories', 'Footwear', 'Gadgets'].map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('category', cat);
                    p.set('page', '1');
                    setSearchParams(p);
                  }}
                  className={`hover:text-secondary transition-colors text-left w-full ${category === cat ? 'font-bold text-secondary' : ''}`}
                >
                  {cat}
                </button>
              </li>
            ))}
            {category && (
               <li>
                 <button 
                   onClick={() => {
                     const p = new URLSearchParams(searchParams);
                     p.delete('category');
                     p.set('page', '1');
                     setSearchParams(p);
                   }}
                   className="text-red-400 hover:underline mt-2 inline-block text-xs uppercase tracking-wider"
                 >
                   Clear Filter
                 </button>
               </li>
            )}
          </ul>
        </div>
      </aside>
      
      <div className="flex-1">
        <div className="mb-4 flex justify-between items-center border-b border-border pb-2">
          <h2 className="text-lg font-bold">
            Results {keyword && `for "${keyword}"`} {category && `in ${category}`}
          </h2>
          <select 
            value={sort} 
            onChange={handleSortChange}
            className="border border-border bg-surface px-3 py-1.5 text-sm outline-none cursor-pointer hover:border-secondary focus:border-secondary text-textMain"
          >
            <option value="">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-textMuted font-bold">
            No products found matching your criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-bold border border-border bg-surface">
                  {pagination.page} / {pagination.pages}
                </div>
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Store;
