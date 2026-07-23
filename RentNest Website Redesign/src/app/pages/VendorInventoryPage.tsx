import React, { useState } from "react";
import { Plus, Package, AlertTriangle, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useVendorInventoryQuery, useAddInventoryMutation, useUpdateStockMutation } from "@/features/vendor/hooks/useVendorData";
import { showToast } from "@/components/ui/Toast";

export const VendorInventoryPage: React.FC = () => {
  const { data: inventory } = useVendorInventoryQuery();
  const addMutation = useAddInventoryMutation();
  const updateStockMutation = useUpdateStockMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [quantityInStock, setQuantityInStock] = useState(10);
  const [unitCost, setUnitCost] = useState(25);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(
      {
        itemName,
        category,
        quantityInStock: Number(quantityInStock),
        unitCost: Number(unitCost),
      },
      {
        onSuccess: () => {
          showToast.success("Stock Added", `Added ${itemName} to inventory.`);
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            Parts & Spare Inventory Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Track spare replacement parts, reorder thresholds, warehouse locations, and stock levels.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Add New Stock Item
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory?.map((item) => (
          <Card key={item.id} variant="default" className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <span className="text-[10px] font-bold text-primary">{item.sku}</span>
                <h3 className="font-heading text-xs font-bold text-foreground">{item.itemName}</h3>
              </div>
              <span className="text-xs font-bold text-foreground">${item.unitCost}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Category: {item.category}</span>
              <span className="font-semibold text-foreground">Qty: {item.quantityInStock} units</span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  updateStockMutation.mutate({ id: item.id, quantity: item.quantityInStock + 5 })
                }
              >
                + Restock (+5)
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border/50 p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">Add Spare Part Stock</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Item Name</label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Quantity</label>
                  <Input type="number" value={quantityInStock} onChange={(e) => setQuantityInStock(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Unit Cost ($)</label>
                  <Input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInventoryPage;
