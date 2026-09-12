import { useEffect, useState } from 'react';
import { ShoppingBag, Check, Coins } from 'lucide-react';
import { api } from '../services/api';

export default function Shop({ gold, onPurchase }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function loadItems() {
    api.getShopItems().then(setItems).catch((err) => setError(err.message));
  }

  useEffect(loadItems, []);

  async function handlePurchase(id) {
    setBusyId(id);
    setError('');
    try {
      await api.purchaseItem(id);
      loadItems();
      onPurchase?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleEquip(id) {
    setBusyId(id);
    try {
      await api.equipItem(id);
      loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <ShoppingBag size={18} /> Cartographer's Cache
        </h2>
        <span className="flex items-center gap-1 text-sm text-glimmer">
          <Coins size={16} /> {gold} Glimmer
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-panel/60 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-400">{item.description}</p>
              <p className="mt-1 text-xs capitalize text-slate-500">{item.type} · {item.price} Glimmer</p>
            </div>
            {item.owned ? (
              <button
                onClick={() => handleEquip(item.id)}
                disabled={busyId === item.id || item.equipped}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  item.equipped
                    ? 'bg-arcane/30 text-arcane'
                    : 'border border-white/10 text-slate-300 hover:border-arcane hover:text-arcane'
                }`}
              >
                <Check size={14} /> {item.equipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(item.id)}
                disabled={busyId === item.id || gold < item.price}
                className="rounded-lg bg-glimmer px-3 py-1.5 text-xs font-semibold text-void hover:opacity-90 disabled:opacity-40"
              >
                Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
