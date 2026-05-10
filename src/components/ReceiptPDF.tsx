import React from 'react';
import { Sale } from '@/lib/models/types';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 24, marginBottom: 20 },
  text: { fontSize: 12, marginBottom: 5 },
});

export const ReceiptPDF = ({ sale }: { sale: Sale }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>Reçu de Paiement</Text>
        <Text style={styles.text}>N°: {sale.receipt_number}</Text>
        <Text style={styles.text}>Total: {sale.total_amount} FCFA</Text>
        <Text style={styles.text}>Date: {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "N/A"}</Text>
      </View>
    </Page>
  </Document>
);
