import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  orderId?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  total?: number;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  customerEmail?: string;
}

export const OrderConfirmationEmail = ({
  orderId = "12345",
  items = [
    {
      name: "Camiseta Ejemplo",
      quantity: 2,
      price: 2500,
      size: "M",
      color: "Negro",
    },
  ],
  total = 5000,
  shippingAddress,
  customerEmail,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nuevo pedido recibido - #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nuevo Pedido - The Sower</Heading>
          <Text style={text}>Pedido #{orderId}</Text>

          {customerEmail && (
            <Section style={infoSection}>
              <Text style={infoLabel}>Email del cliente:</Text>
              <Text style={infoValue}>{customerEmail}</Text>
            </Section>
          )}

          {shippingAddress && (
            <Section style={infoSection}>
              <Text style={infoLabel}>Dirección de envío:</Text>
              <Text style={addressText}>{shippingAddress.name}</Text>
              <Text style={addressText}>{shippingAddress.line1}</Text>
              {shippingAddress.line2 && (
                <Text style={addressText}>{shippingAddress.line2}</Text>
              )}
              <Text style={addressText}>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
              </Text>
              <Text style={addressText}>{shippingAddress.country}</Text>
            </Section>
          )}

          <Section style={itemsSection}>
            <Heading as="h2" style={h2}>
              Productos:
            </Heading>
            {items.map((item, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemName}>{item.name}</Text>
                {item.size && (
                  <Text style={itemDetail}>Talla: {item.size}</Text>
                )}
                {item.color && (
                  <Text style={itemDetail}>Color: {item.color}</Text>
                )}
                <Text style={itemDetail}>Cantidad: {item.quantity}</Text>
                <Text style={itemPrice}>
                  ${(item.price / 100).toFixed(2)}
                </Text>
              </div>
            ))}
          </Section>

          <Text style={totalText}>Total: ${(total / 100).toFixed(2)}</Text>
        </Container>
      </Body>
    </Html>
  );
};

OrderConfirmationEmail.PreviewProps = {
  orderId: "12345",
  items: [
    {
      name: "Camiseta Fe",
      quantity: 2,
      price: 2500,
      size: "M",
      color: "Negro",
    },
  ],
  total: 5000,
  shippingAddress: {
    name: "Juan Pérez",
    line1: "Calle Principal 123",
    line2: "Apt 4B",
    city: "Madrid",
    state: "Madrid",
    postal_code: "28001",
    country: "ES",
  },
  customerEmail: "cliente@ejemplo.com",
} as OrderConfirmationEmailProps;

export default OrderConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
};

const infoSection = {
  marginBottom: "20px",
  backgroundColor: "#f9fafb",
  borderRadius: "5px",
  padding: "15px",
};

const infoLabel = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#666",
  margin: "0 0 5px 0",
  textTransform: "uppercase" as const,
};

const infoValue = {
  fontSize: "14px",
  color: "#333",
  margin: "0",
};

const addressText = {
  fontSize: "14px",
  color: "#333",
  margin: "2px 0",
};

const itemsSection = {
  padding: "0 40px",
};

const itemCard = {
  border: "1px solid #eee",
  borderRadius: "5px",
  padding: "15px",
  marginBottom: "10px",
};

const itemName = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 5px 0",
};

const itemDetail = {
  fontSize: "14px",
  color: "#666",
  margin: "2px 0",
};

const itemPrice = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#000",
  marginTop: "5px",
};

const totalText = {
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};