// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://ykowaltdatbdnjqwgcoh.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrb3dhbHRkYXRiZG5qcXdnY29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzE2MTIsImV4cCI6MjA5MzEwNzYxMn0.RrnjLJ84S-BRsjBCBgK1DUd4P2qsxEnusqyMjfJ5Fx8"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Listen for order from index.html
window.addEventListener("saveToFirebase", async (event) => {
    const orderData = event.detail;

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_name:    orderData.customerName,
                customer_phone:   orderData.customerPhone,
                items:            JSON.stringify(orderData.items),
                subtotal:         orderData.subtotal,
                delivery_charge:  orderData.deliveryCharge,
                grand_total:      orderData.grandTotal,
                location:         orderData.location,
                custom_request:   orderData.customRequest,
                status:           "Pending",
                date:             orderData.date
            }]);

        if (error) {
            console.error("Supabase error:", error.message);
        } else {
            console.log("Order saved to Supabase successfully! ✅");
        }

    } catch (err) {
        console.error("Something went wrong:", err);
    }
});
