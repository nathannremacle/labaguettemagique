/**
 * Validate menu link by checking if category and item exist in menu data
 */
function validateMenuLink(menuData, categoryId, itemName) {
  if (!categoryId || !itemName) {
    return { valid: false, error: 'Missing category or item name' };
  }

  const categoryData = menuData[categoryId];
  if (!categoryData) {
    return { valid: false, error: `Category "${categoryId}" not found` };
  }

  if (!categoryData.items.includes(itemName)) {
    // Try to find a similar item
    const similarItem = categoryData.items.find(i => 
      i.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(i.toLowerCase())
    );
    
    if (similarItem) {
      return { valid: true, correctedItem: similarItem, originalItem: itemName };
    }
    
    return { valid: false, error: `Item "${itemName}" not found in category "${categoryId}"` };
  }

  return { valid: true };
}

module.exports = { validateMenuLink };

