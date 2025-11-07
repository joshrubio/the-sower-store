import OrderConfirmationEmail from "@/emails/order-confirmation";

export default function TestEmailPage() {
  return (
    <div>
      <h1 style={{ padding: "20px" }}>Vista previa del Email:</h1>
      <OrderConfirmationEmail
        orderId="TEST123"
        items={[
          { name: "Camiseta Fe", quantity: 2, price: 2500, size: "M", color: "Negro" },
          { name: "Camiseta Esperanza", quantity: 1, price: 3000, size: "L", color: "Blanco" },
        ]}
        total={8000}
      />
    </div>
  );
}