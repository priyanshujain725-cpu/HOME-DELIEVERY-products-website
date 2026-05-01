// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://ykowaltdatbdnjqwgcoh.supabase.co"
const SUPABASE_KEY = "sb_publishable_DuwnJ4xkz91mPLF0Gsj-bA_aFHjG0XM"

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
