// The room has four fixed positions. An item declares which one it belongs to, so a
// shelf can list each slot's row from just the items that fit there.
export const slots = ['wall', 'floorLeft', 'floorRight', 'center'];

// Priced against the food shop (apple 10, meat 25, cake 50) at one coin per minute, so a
// single piece is a few completed blocks of saving. The emoji lives only here: themes
// override it with art, they never duplicate it.
export const furniture = [
  { id: 'banner',    slot: 'wall',       name: 'Banner',    price: 30, fallback: '🚩' },
  { id: 'painting',  slot: 'wall',       name: 'Painting',  price: 45, fallback: '🖼️' },
  { id: 'trophy',    slot: 'wall',       name: 'Trophy',    price: 70, fallback: '🏆' },
  { id: 'bed',       slot: 'floorLeft',  name: 'Bed',       price: 40, fallback: '🛏️' },
  { id: 'nest',      slot: 'floorLeft',  name: 'Nest',      price: 60, fallback: '🪹' },
  { id: 'cushion',   slot: 'floorLeft',  name: 'Cushion',   price: 30, fallback: '🛋️' },
  { id: 'lamp',      slot: 'floorRight', name: 'Lamp',      price: 25, fallback: '🪔' },
  { id: 'chest',     slot: 'floorRight', name: 'Chest',     price: 35, fallback: '🧰' },
  { id: 'shelf',     slot: 'floorRight', name: 'Bookshelf', price: 55, fallback: '📚' },
  { id: 'imp',       slot: 'center',     name: 'Imp',       price: 80, fallback: '👺', pet: true },
  { id: 'bird',      slot: 'center',     name: 'Bird',      price: 65, fallback: '🐦', pet: true },
  { id: 'hatchling', slot: 'center',     name: 'Hatchling', price: 90, fallback: '🐣', pet: true },
];
