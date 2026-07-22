import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Prisma } from "@prisma/client";

type ChallanForPdf = Prisma.ChallanGetPayload<{
  include: {
    customer: true;
    createdBy: { select: { id: true; name: true; role: true } };
    items: true;
  };
}>;

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#172033" },
  header: { marginBottom: 24 },
  title: { fontSize: 22, marginBottom: 6 },
  muted: { color: "#667085" },
  section: { marginBottom: 18 },
  row: { flexDirection: "row", borderBottom: "1 solid #E5E7EB", paddingVertical: 8 },
  head: { backgroundColor: "#F3F4F6", fontWeight: 700 },
  colName: { width: "38%" },
  colSku: { width: "18%" },
  colQty: { width: "14%", textAlign: "right" },
  colPrice: { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  total: { marginTop: 14, textAlign: "right", fontSize: 13, fontWeight: 700 }
});

const money = (value: unknown) => `INR ${Number(value).toFixed(2)}`;

const ChallanDocument = ({ challan }: { challan: ChallanForPdf }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Challan</Text>
        <Text>Challan No: {challan.challanNumber}</Text>
        <Text>Status: {challan.status}</Text>
        <Text style={styles.muted}>Created: {challan.createdAt.toISOString().slice(0, 10)}</Text>
      </View>

      <View style={styles.section}>
        <Text>{challan.customer.businessName}</Text>
        <Text>{challan.customer.name}</Text>
        <Text>{challan.customer.mobile}</Text>
        <Text>{challan.customer.email}</Text>
        <Text>{challan.customer.address}</Text>
      </View>

      <View style={[styles.row, styles.head]}>
        <Text style={styles.colName}>Product</Text>
        <Text style={styles.colSku}>SKU</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colPrice}>Price</Text>
        <Text style={styles.colAmount}>Amount</Text>
      </View>

      {challan.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.colName}>{item.snapshotName}</Text>
          <Text style={styles.colSku}>{item.snapshotSku}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colPrice}>{money(item.snapshotPrice)}</Text>
          <Text style={styles.colAmount}>
            {money(Number(item.snapshotPrice) * item.quantity)}
          </Text>
        </View>
      ))}

      <Text style={styles.total}>
        Total Qty: {challan.totalQty}   Total: {money(challan.totalAmount)}
      </Text>
    </Page>
  </Document>
);

export const renderChallanPdf = (challan: ChallanForPdf) => renderToBuffer(<ChallanDocument challan={challan} />);

