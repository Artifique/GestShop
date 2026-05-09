import { pdf } from "@react-pdf/renderer";
import { ReceiptPDF } from "../components/ReceiptPDF";
import { createClient } from "@/lib/supabase/server";

import { Sale } from "@/lib/models/types";

export const ReceiptService = {
  async generateAndUpload(sale: Sale) {
    const supabase = await createClient();

    // 1. Génération du PDF en buffer
    const doc = ReceiptPDF({ sale });
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // 2. Upload vers Supabase Storage
    const fileName = `receipts/${sale.id}.pdf`;
    const { data, error } = await supabase.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    // 3. Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },
};
