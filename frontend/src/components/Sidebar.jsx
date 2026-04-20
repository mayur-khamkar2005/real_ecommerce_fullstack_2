const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 pr-6 border-r border-border hidden md:block">
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Categories</h3>
        <ul className="space-y-2 text-sm text-textMain">
          <li>
            <button className="hover:text-secondary transition-colors">Electronics</button>
          </li>
          <li>
            <button className="hover:text-secondary transition-colors">Fashion</button>
          </li>
          <li>
            <button className="hover:text-secondary transition-colors">Gaming</button>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3">Price Range</h3>
        <ul className="space-y-2 text-sm text-textMain">
          <li><button className="hover:text-secondary transition-colors">Under $50</button></li>
          <li><button className="hover:text-secondary transition-colors">$50 to $100</button></li>
          <li><button className="hover:text-secondary transition-colors">$100 to $200</button></li>
          <li><button className="hover:text-secondary transition-colors">Over $200</button></li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
