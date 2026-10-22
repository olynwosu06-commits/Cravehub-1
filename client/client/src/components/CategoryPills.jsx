import React from 'react';
import './CategoryPills.css';

function CategoryPills({
  onSelectCategory,
  onSelectGroup,
  selectedGroup,
  selectedCategory,
  categories = [],
  groups = [],
  items = [] // 👈 We need the menu items to double-check categories
}) {

  // 1. Find the active group's ID
  const activeGroupObj = groups.find(g => g.name === selectedGroup);
  const activeGroupId = activeGroupObj ? activeGroupObj._id : null;

  // 2. Get categories from the database
  let currentCategories = [];
  
  if (selectedGroup !== 'All') {
    // Try to get categories from the Categories collection
    currentCategories = categories
      .filter(c => c.group === activeGroupId)
      .map(c => c.name);

    // 🚨 FALLBACK: If we didn't find any, scan the Menu Items to find the categories!
    if (currentCategories.length === 0) {
      const groupItems = items.filter(item => item.group === selectedGroup);
      // Get unique category names from those items
      currentCategories = [...new Set(groupItems.map(item => item.category))];
    }
  }

  return (
    <div className="category-pills-wrapper">

      {/* GROUP FILTERS (Top Row) */}
      <div className="group-container">

        {groups.map((group) => (
          <button
            key={group._id || group.name}
            className={`group-pill ${selectedGroup === group.name ? 'active' : ''}`}
            onClick={() => onSelectGroup(group.name)}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* CATEGORY FILTERS (Bottom Row) */}
      {selectedGroup !== 'All' && currentCategories.length > 0 && (
        <div className="category-container">
          <button
            className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => onSelectCategory('All')}
          >
            All
          </button>

          {currentCategories.map((catName) => (
            <button
              key={catName}
              className={`category-pill ${selectedCategory === catName ? 'active' : ''}`}
              onClick={() => onSelectCategory(catName)}
            >
              {catName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPills;