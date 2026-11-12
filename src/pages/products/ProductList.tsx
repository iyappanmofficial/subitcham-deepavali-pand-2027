import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Product, Supplier } from '@/types';
import { formatINR } from '@/lib/utils';
import { Package, Truck, Plus, AlertCircle, X, CheckCircle } from 'lucide-react';

export const ProductList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers'>('products');
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [suppliers, setSuppliers] = useState<Supplier[]>(db.getSuppliers());

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // New Product Form state
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Rice');
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodPrice, setProdPrice] = useState(60);
  const [prodQty, setProdQty] = useState(100);

  // New Supplier Form state
  const [suppName, setSuppName] = useState('');
  const [suppContact, setSuppContact] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppAddress, setSuppAddress] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    db.addProduct({
      name: prodName.trim(),
      category: prodCategory,
      unit: prodUnit,
      purchase_price: Number(prodPrice),
      available_quantity: Number(prodQty),
      reorder_level: 20,
      is_active: true,
    });
    setProducts(db.getProducts());
    setIsAddProductOpen(false);
    setProdName('');
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    db.addSupplier({
      name: suppName.trim(),
      contact_person: suppContact.trim(),
      phone: suppPhone.trim(),
      email: suppEmail.trim(),
      address: suppAddress.trim(),
    });
    setSuppliers(db.getSuppliers());
    setIsAddSupplierOpen(false);
    setSuppName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Products, Inventory & Wholesale Suppliers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage wholesale inventory procurement for Deepavali grocery package fulfillment
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'products' ? (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Grocery Product</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Wholesale Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'products'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'suppliers'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Suppliers Directory ({suppliers.length})</span>
        </button>
      </div>

      {/* Tab 1: Products Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Wholesale Cost</th>
                  <th className="py-3 px-4 text-right">In Stock</th>
                  <th className="py-3 px-4 text-right">Reorder Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{p.unit}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{formatINR(p.purchase_price)} / {p.unit}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {p.available_quantity} {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{p.reorder_level} {p.unit}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        p.available_quantity > p.reorder_level
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.available_quantity > p.reorder_level ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="font-heading font-bold text-base text-slate-900">{s.name}</div>
              <div className="text-slate-600">Contact: <strong className="text-slate-800">{s.contact_person || 'N/A'}</strong></div>
              <div className="text-slate-600">Phone: <strong className="text-slate-800">{s.phone}</strong></div>
              {s.email && <div className="text-slate-500">{s.email}</div>}
              {s.address && <div className="text-slate-500 text-[11px] pt-1 border-t">{s.address}</div>}
              {s.notes && <div className="text-amber-800 bg-amber-50 p-2 rounded text-[11px]">{s.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base">Add New Grocery Product</h3>
              <button onClick={() => setIsAddProductOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Premium Basmati Rice"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Rice">Rice</option>
                    <option value="Oil">Oil</option>
                    <option value="Sugar">Sugar</option>
                    <option value="Dal">Dal / Pulses</option>
                    <option value="Spices">Spices</option>
                    <option value="Grocery">Grocery / Sweets</option>
                    <option value="Household">Household</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Unit</label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="L">Litre</option>
                    <option value="pkt">Packet</option>
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={prodQty}
                    onChange={(e) => setProdQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-navy text-white font-bold rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base">Add Wholesale Supplier</h3>
              <button onClick={() => setIsAddSupplierOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Supplier / Mill Name</label>
                <input
                  type="text"
                  value={suppName}
                  onChange={(e) => setSuppName(e.target.value)}
                  placeholder="e.g. Cauvery Rice Wholesalers"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={suppContact}
                    onChange={(e) => setSuppContact(e.target.value)}
                    placeholder="e.g. S. Murugan"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={suppPhone}
                    onChange={(e) => setSuppPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Address / Market Yard</label>
                <textarea
                  rows={2}
                  value={suppAddress}
                  onChange={(e) => setSuppAddress(e.target.value)}
                  placeholder="e.g. Kothawalchavadi, Chennai"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-navy text-white font-bold rounded-lg"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

