// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://ykowaltdatbdnjqwgcoh.supabase.co"
const SUPABASE_KEY = "sb_publishable_DuwnJ4xkz91mPLF0Gsj-bA_aFHjG0XM"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function loadOrders() {
    const tableBody = document.getElementById("orderTableBody");
    const topProductDisplay = document.getElementById("topProduct");

    tableBody.innerHTML = "<tr><td colspan='6'>Loading orders...</td></tr>";

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Supabase error:", error.message);
            tableBody.innerHTML = `<tr><td colspan='6'>❌ Error: ${error.message}</td></tr>`;
            return;
        }

        if (orders.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:30px;'>No orders yet! 📦</td></tr>";
            topProductDisplay.innerText = "No orders yet";
            document.getElementById("totalOrders").innerText = "0";
            document.getElementById("totalRevenue").innerText = "₹0";
            return;
        }

        tableBody.innerHTML = "";
        let productCounts = {};
        let totalRevenue = 0;

        orders.forEach((order) => {
            const dateObj = new Date(order.date);
            const formattedDate = dateObj.toLocaleDateString('en-IN') + " " + dateObj.toLocaleTimeString('en-IN');

            let itemsList = "";
            try {
                const items = JSON.parse(order.items);
                items.forEach(item => {
                    itemsList += `• ${item.name} x${item.quantity} = ₹${item.subtotal}<br>`;
                    if (productCounts[item.name]) {
                        productCounts[item.name] += item.quantity;
                    } else {
                        productCounts[item.name] = item.quantity;
                    }
                });
            } catch {
                itemsList = order.items || "N/A";
            }

            if (order.custom_request && order.custom_request !== "") {
                itemsList += `📝 <i>Requested: ${order.custom_request}</i>`;
            }

            totalRevenue += order.grand_total || 0;

            const statusColor = order.status === 'Pending'
                ? 'background:#fff3cd;color:#856404;'
                : 'background:#d4edda;color:#155724;';

            const row = `
                <tr>
                    <td>${formattedDate}</td>
                    <td><strong>${order.customer_name || "N/A"}</strong><br><small>📞 ${order.customer_phone || ""}</small></td>
                    <td>${itemsList}</td>
                    <td>₹${order.subtotal || 0}<br><small>Delivery: ₹${order.delivery_charge || 0}</small></td>
                    <td><strong>₹${order.grand_total || 0}</strong></td>
                    <td><span style="${statusColor} padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;">${order.status || "Pending"}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        let mostPopularProduct = "No orders yet";
        let highestCount = 0;
        for (const product in productCounts) {
            if (productCounts[product] > highestCount) {
                highestCount = productCounts[product];
                mostPopularProduct = product;
            }
        }

        topProductDisplay.innerText = highestCount > 0 ? `${mostPopularProduct} (${highestCount} units sold)` : "No orders yet";
        document.getElementById("totalRevenue").innerText = `₹${totalRevenue}`;
        document.getElementById("totalOrders").innerText = orders.length;

    } catch (err) {
        console.error("Something went wrong:", err);
        tableBody.innerHTML = "<tr><td colspan='6'>❌ Error loading orders.</td></tr>";
    }
}

loadOrders();
