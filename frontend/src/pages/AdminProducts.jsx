import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Electronics', stock: '' });
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data.products);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please select an image');
    
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('image', image);

    try {
      await api.post('/products', data);
      toast.success('Product created');
      setFormData({ name: '', description: '', price: '', category: 'Electronics', stock: '' });
      setImage(null);
      e.target.reset();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const data = new FormData();
      data.append('name', editFormData.name);
      data.append('description', editFormData.description);
      data.append('price', editFormData.price);
      data.append('category', editFormData.category);
      data.append('stock', editFormData.stock);
      await api.put(`/products/${editingProduct._id}`, data);
      toast.success('Product updated');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Add New Product</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Name</label>
              <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea required className="input-field h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Price ($)</label>
                <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Stock</label>
                <input required type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Category</label>
              <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Gaming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Image</label>
              <input required type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="w-full text-sm" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Product Catalog ({products.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-textMuted uppercase bg-backgroundElevated border-b border-border">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = getImageUrl(product.image);
                  return (
                  <tr key={product._id} className="border-b border-border hover:bg-backgroundElevated">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/1a1a1a/737373?text=—'; }}
                        className="w-10 h-10 object-contain border border-border bg-backgroundElevated" 
                      />
                      <span className="font-medium line-clamp-1 text-textMain">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-textMain">${Number(product.price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-textMuted">{product.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => handleEdit(product)} className="text-secondary hover:underline mr-3 text-xs uppercase tracking-wider">Edit</button>
                      <button type="button" onClick={() => handleDelete(product._id)} className="text-red-400 hover:underline text-xs uppercase tracking-wider">Delete</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-surface p-6 max-w-md w-full border border-border text-textMain">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 border-b border-border pb-2">Edit product</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input required type="text" className="input-field" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea required className="input-field h-24" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Price ($)</label>
                  <input required type="number" step="0.01" className="input-field" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Stock</label>
                  <input required type="number" className="input-field" value={editFormData.stock} onChange={e => setEditFormData({...editFormData, stock: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Category</label>
                <input required type="text" className="input-field" value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isUpdating} className="btn-primary flex-1">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
