const handleStockSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    let response;
    
    console.log('Sending stock form:', stockForm); // Tambahkan log ini
    
    if (isEditing && editingStock) {
      // Update existing stock
      response = await fetch(`/api/admin/robux-stock/${editingStock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm),
      });
    } else {
      // Create new stock
      response = await fetch('/api/admin/robux-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm),
      });
    }

    if (response.ok) {
      const result = await response.json();
      console.log('Response from API:', result); // Tambahkan log ini
      
      setStockForm({ amount: 100, price: 13500, isActive: true, allowOrders: true });
      setEditingStock(null);
      setIsEditing(false);
      onRefresh();
      alert(isEditing ? 'Stock berhasil diupdate!' : 'Stock berhasil ditambahkan!');
    } else {
      alert('Gagal menyimpan stock!');
    }
  } catch (error) {
    console.error('Error saving stock:', error); // Tambahkan log ini
    alert('Gagal menyimpan stock!');
  } finally {
    setIsLoading(false);
  }
};