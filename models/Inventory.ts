import mongoose, { Schema, model, models } from "mongoose";

export interface IInventory {
  productId: string; // ID del producto en Stripe
  productName: string;
  variants: Array<{
    size: string;
    color: string;
    stock: number;
    sku?: string; // Código único opcional
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    variants: [
      {
        size: { type: String, required: true },
        color: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
        sku: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Crear índice compuesto para búsquedas rápidas
InventorySchema.index({ productId: 1, "variants.size": 1, "variants.color": 1 });

const Inventory = models.Inventory || model<IInventory>("Inventory", InventorySchema);

export default Inventory;