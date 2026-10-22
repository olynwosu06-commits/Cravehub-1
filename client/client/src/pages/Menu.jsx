import React, { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';
import CategoryPills from '../components/CategoryPills';
// import { menuItems } from '../data/MenuData';
import { useSearchParams } from 'react-router-dom';
import MenuSkeleton from '../components/MenuSkeleton';
import { useMenu } from '../context/MenuContext';
import api from '../api/api';
import '../styles/Menu.css';

function Menu({
  selectedCategory,
  selectedGroup,
  onSelectCategory,
  onSelectGroup,
  onQuickView,
  searchQuery,
  setSearchQuery,   
}) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // You can change this to 9 or 15 depending on your grid  const [minPrice, setMinPrice] = useState('');
  const [minPrice, setMinPrice] = useState(''); // 👈 ADD THIS
  const [maxPrice, setMaxPrice] = useState('');

  const [sortOption, setSortOption] = useState('Featured');

  const [viewMode, setViewMode] = useState('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, isFetching, fetchError } = useMenu();

  const [setGroups] = useState([]);
  const [categories, setCategories] = useState([]);

  // filter/pagnition
    // Reset the visible count back to 12 when the user changes a filter or searches
  // Reset to page 1 when the user changes a filter or searches
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroup, selectedCategory, searchQuery, sortOption, minPrice, maxPrice]);

  useEffect(() => {
    // Fetch dynamic groups & categories
    api.get('/api/admin/groups').then(res => {
      setGroups([{ name: 'All', icon: 'bx-grid-alt' }, ...res.data.groups]);
      setCategories(res.data.categories);
    }).catch(err => console.log(err));
  }, []);


  useEffect(() => {
  const q = searchParams.get('q');
  if (q && q !== searchQuery) {
    setSearchQuery(q);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Whenever the App's searchQuery changes, mirror it back to the URL
useEffect(() => {
  if (searchQuery) {
    setSearchParams({ q: searchQuery }, { replace: true });
  } else {
    setSearchParams({}, { replace: true });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchQuery]);

  const groups = [
    {
      name: 'All',
      icon: 'bx-grid-alt'
    },
    {
      name: 'Food',
      icon: 'bx-restaurant'
    },
    {
      name: 'Snacks',
      icon: 'bx-cookie'
    },
    {
      name: 'Drinks',
      icon: 'bx-drink'
    },
    {
      name: 'Cakes',
      icon: 'bx-cake'
    },
    {
      name: 'Combos',
      icon: 'bx-package'
    }
  ];

  /* GROUP FILTER */
  let filteredItems =
    selectedGroup === 'All'
      ? items
      : items.filter(
          (item) => item.group === selectedGroup
        );

  /* CATEGORY FILTER */
  if (selectedCategory !== 'All') {
    filteredItems = filteredItems.filter(
      (item) => item.category === selectedCategory
    );
  }

  /* PRICE FILTER */
  if (minPrice !== '') {
    filteredItems = filteredItems.filter(
      (item) => item.price >= Number(minPrice)
    );
  }

  if (maxPrice !== '') {
    filteredItems = filteredItems.filter(
      (item) => item.price <= Number(maxPrice)
    );
  }

  /* SORT */
  if (sortOption === 'Price: Low to High') {
    filteredItems = [...filteredItems].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sortOption === 'Price: High to Low') {
    filteredItems = [...filteredItems].sort(
      (a, b) => b.price - a.price
    );
  }

  if (sortOption === 'Rating') {
    filteredItems = [...filteredItems].sort(
      (a, b) => b.rating - a.rating
    );
  }

  /* SEARCH FILTER */
if (searchQuery && searchQuery.trim() !== '') {
  const q = searchQuery.toLowerCase().trim();
  filteredItems = filteredItems.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  );
}

  // Only show the sliced portion of the filtered items
  // const displayedItems = filteredItems.slice(0, visibleCount);
    // Calculate pagination math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="menu-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="menu-sidebar">

        <div className="sidebar-box">

          <h3 className="sidebar-title">
            CATEGORY
          </h3>

          <div className="sidebar-groups">

            {groups.map((group) => (

              <button
                key={group.name}
                className={`sidebar-group ${
                  selectedGroup === group.name
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  onSelectGroup(group.name)
                }
              >

                <span className="sidebar-group-left">

                  <i className={`bx ${group.icon}`}></i>

                  {group.name === 'All'
                    ? 'All Products'
                    : group.name}

                </span>

                <span className="item-count">
                  {group.name === 'All'
                    ? items.length
                    : items.filter(
                        (item) =>
                          item.group === group.name
                      ).length}
                </span>

              </button>

            ))}

          </div>

        </div>


        {/* PRICE FILTER */}

        <div className="sidebar-box price-box">

          <h3 className="sidebar-title">
            PRICE RANGE
          </h3>

          <div className="price-inputs">

            <input
              type="number"
              placeholder="Min N"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value)
              }
            />

            <span>—</span>

            <input
              type="number"
              placeholder="Max N"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value)
              }
            />

          </div>

          <button
            className="apply-price"
            onClick={() => {
              setMinPrice(minPrice);
              setMaxPrice(maxPrice);
            }}
          >
            Apply Price Filter
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="menu-content">

        {/* HEADER */}

        <div className="menu-header">

          <div>

            <h1 className="menu-title">
              Our Menu
            </h1>

            <p className="menu-count">
              {searchQuery ? (
                <>
                  Showing results for "{searchQuery}" ({filteredItems.length}{' '}
                  {filteredItems.length === 1 ? 'product' : 'products'})
                  {' — '}
                  <button
                    className="menu-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <>Showing all {filteredItems.length} products</>
              )}
            </p>  

          </div>


          {/* SORT + VIEW */}

          <div className="menu-controls">

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
              className="sort-select"
            >
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>

            <button
              className={`view-button ${
                viewMode === 'grid' ? 'active' : ''
              }`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <i className="bx bx-grid-alt"></i>
            </button>

            <button
              className={`view-button ${
                viewMode === 'list' ? 'active' : ''
              }`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <i className="bx bx-list-ul"></i>
            </button>

          </div>

        </div>


        {/* FILTER PILLS */}

        <CategoryPills
          onSelectCategory={onSelectCategory}
          onSelectGroup={onSelectGroup}
          selectedGroup={selectedGroup}
          selectedCategory={selectedCategory}
          categories={categories} 
          groups={groups} 
          items={items}
        />


        {/* FOOD CARDS */}
        {isFetching ? (
          <MenuSkeleton count={6} />
        ) : fetchError ? (
          <div className="empty-menu">
            <i className="bx bx-error-circle"></i>
            <h2>Couldn't load the menu</h2>
            <p>{fetchError}</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className={`menu-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {currentItems.map((item) => (
              <FoodCard key={item._id || item.id} {...item} onQuickView={onQuickView} />
            ))}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pagination-container">
              {/* Previous Button */}
              <button 
                className="page-arrow" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="bx bx-chevron-left"></i>
              </button>

              {/* Page Numbers */}
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button 
                className="page-arrow" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <i className="bx bx-chevron-right"></i>
              </button>
            </div>
          
          )}
          </div>
        ) : (
          <div className="empty-menu">
            <i className="bx bx-restaurant"></i>
            <h2>No products found</h2>
            <p>Try changing your category or price filter.</p>
          </div>
        )}

      </main>

    </div>
  );
}

export default Menu;