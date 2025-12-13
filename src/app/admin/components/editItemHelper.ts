/**
 * Helper function to handle editing an item from the expanded view
 * Reduces nesting by extracting the complex edit button logic
 */
export function handleEditItemFromExpanded(
  itemId: number,
  onToggleExpand: () => void,
  onEditComplete: () => void
) {
  // Collapse the category first to show the collapsed view with EditableMenuItem
  onToggleExpand();
  
  // Wait for the collapse animation, then find and trigger edit mode
  setTimeout(() => {
    const itemElement = document.querySelector(
      `[data-item-id="${itemId}"]`
    );
    
    if (!itemElement) {
      return;
    }
    
    // Scroll to item first
    itemElement.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Then find and click the edit button
    setTimeout(() => {
      const editButton = itemElement.querySelector('button[aria-label="Edit"]') as HTMLButtonElement;
      
      if (editButton) {
        editButton.click();
        onEditComplete();
        return;
      }
      
      // Fallback: try to find any button with Edit icon
      const buttons = itemElement.querySelectorAll('button');
      buttons.forEach(btn => {
        const icon = btn.querySelector('svg');
        if (icon && icon.classList.contains('lucide-edit')) {
          btn.click();
          onEditComplete();
        }
      });
    }, 300);
  }, 100);
}


