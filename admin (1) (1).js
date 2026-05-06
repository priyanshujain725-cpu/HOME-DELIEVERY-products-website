// Supabase Setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://ykowaltdatbdnjqwgcoh.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrb3dhbHRkYXRiZG5qcXdnY29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzE2MTIsImV4cCI6MjA5MzEwNzYxMn0.RrnjLJ84S-BRsjBCBgK1DUd4P2qsxEnusqyMjfJ5Fx8"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let currentOrderId = null;
let allProductCounts = {};

// ============ LOAD ORDERS ============
async function loadOrders() {
    const tableBody = document.getElementById("orderTableBody");
    const topProductDisplay = document.getElementById("topProduct");

    tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:20px;'>Loading orders...</td></tr>";

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            tableBody.innerHTML = `<tr><td colspan='6'>❌ Error: ${error.message}</td></tr>`;
            return;
        }

        if (orders.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:30px;'>No orders yet! 📦</td></tr>";
            topProductDisplay.innerText = "No orders yet";
            document.getElementById("totalOrders").innerText = "0";
            document.getElementById("totalRevenue").innerText = "₹0";
            document.getElementById("totalDelivered").innerText = "0";
            return;
        }

        tableBody.innerHTML = "";
        allProductCounts = {};
        let totalRevenue = 0;
        let totalDelivered = 0;

        orders.forEach((order) => {
            const dateObj = new Date(order.date);
            const formattedDate = dateObj.toLocaleDateString('en-IN') + "<br><small>" + dateObj.toLocaleTimeString('en-IN') + "</small>";

            // Parse items
            let itemsSummary = "";
            try {
                const items = JSON.parse(order.items);
                items.forEach(item => {
                    itemsSummary += `• ${item.name} x${item.quantity}<br>`;
                    // Only count product units if order is NOT cancelled
                    if (order.status !== 'Cancelled') {
                        if (allProductCounts[item.name]) {
                            allProductCounts[item.name] += item.quantity;
                        } else {
                            allProductCounts[item.name] = item.quantity;
                        }
                    }
                });
            } catch {
                itemsSummary = order.items || "N/A";
            }

            if (order.status !== 'Cancelled') totalRevenue += order.grand_total || 0;
            if (order.status === 'Delivered') totalDelivered++;

            // Status badge
            let statusBg = '#fff3cd', statusColor = '#856404';
            if (order.status === 'Delivered') { statusBg = '#d4edda'; statusColor = '#155724'; }
            if (order.status === 'Cancelled') { statusBg = '#f8d7da'; statusColor = '#721c24'; }

            const row = `
                <tr>
                    <td>${formattedDate}</td>
                    <td><strong>${order.customer_name || "N/A"}</strong><br><small>📞 ${order.customer_phone || ""}</small></td>
                    <td style="font-size:13px;">${itemsSummary}</td>
                    <td><strong>₹${order.grand_total || 0}</strong></td>
                    <td><span style="background:${statusBg};color:${statusColor};padding:5px 12px;border-radius:20px;font-weight:700;font-size:12px;">${order.status || "Pending"}</span></td>
                    <td><button class="change-btn" onclick='openOrderDrawer(${JSON.stringify(order)})'>📋 Details</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Most popular product
        let mostPopular = "No orders yet";
        let highestCount = 0;
        for (const product in allProductCounts) {
            if (allProductCounts[product] > highestCount) {
                highestCount = allProductCounts[product];
                mostPopular = product;
            }
        }

        topProductDisplay.innerText = highestCount > 0 ? `${mostPopular} (${highestCount} units)` : "No orders yet";
        document.getElementById("totalRevenue").innerText = `₹${totalRevenue}`;
        document.getElementById("totalOrders").innerText = orders.length;
        document.getElementById("totalDelivered").innerText = totalDelivered;

    } catch (err) {
        console.error("Error:", err);
    }
}

// ============ OPEN ORDER DRAWER ============
window.openOrderDrawer = function(order) {
    currentOrderId = order.id;

    document.getElementById("d-name").innerText    = order.customer_name || "N/A";
    document.getElementById("d-phone").innerText   = order.customer_phone || "N/A";
    document.getElementById("d-date").innerText    = new Date(order.date).toLocaleString('en-IN');
    document.getElementById("d-location").href     = order.location || "#";
    document.getElementById("d-subtotal").innerText  = `₹${order.subtotal || 0}`;
    document.getElementById("d-delivery").innerText  = `₹${order.delivery_charge || 0}`;
    document.getElementById("d-grand").innerText     = `₹${order.grand_total || 0}`;
    document.getElementById("d-custom").innerText    = order.custom_request || "None";
    document.getElementById("status-msg").innerText  = "";

    // Items list
    let itemsHTML = "";
    try {
        const items = JSON.parse(order.items);
        items.forEach(item => {
            itemsHTML += `
                <div class="item-row">
                    <span class="item-name">${item.name} <small style="color:#999;">x${item.quantity}</small></span>
                    <span class="item-price">₹${item.subtotal}</span>
                </div>`;
        });
    } catch {
        itemsHTML = `<div class="item-row"><span>${order.items}</span></div>`;
    }
    document.getElementById("d-items").innerHTML = itemsHTML;

    // Highlight active status button
    document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active-status'));
    const statusMap = { 'Pending': 'btn-pending', 'Delivered': 'btn-delivered', 'Cancelled': 'btn-cancelled' };
    if (statusMap[order.status]) {
        document.getElementById(statusMap[order.status]).classList.add('active-status');
    }

    document.getElementById("drawerOverlay").classList.add("open");
    document.getElementById("orderDrawer").classList.add("open");
}

window.closeOrderDrawer = function() {
    document.getElementById("drawerOverlay").classList.remove("open");
    document.getElementById("orderDrawer").classList.remove("open");
}

// ============ UPDATE STATUS ============
window.updateStatus = async function(newStatus) {
    if (!currentOrderId) return;

    const msg = document.getElementById("status-msg");
    msg.innerText = "Updating...";
    msg.style.color = "#555";

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', currentOrderId);

    if (error) {
        msg.innerText = "❌ Failed to update!";
        msg.style.color = "red";
    } else {
        msg.innerText = `✅ Status updated to "${newStatus}"!`;
        msg.style.color = "green";

        // Highlight active button
        document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active-status'));
        const statusMap = { 'Pending': 'btn-pending', 'Delivered': 'btn-delivered', 'Cancelled': 'btn-cancelled' };
        if (statusMap[newStatus]) {
            document.getElementById(statusMap[newStatus]).classList.add('active-status');
        }

        // Reload table after 1 second
        setTimeout(() => { loadOrders(); }, 1000);
    }
}

// ============ PRODUCTS DRAWER ============
window.openProductsDrawer = function() {
    const list = document.getElementById("productStatsList");

    if (Object.keys(allProductCounts).length === 0) {
        list.innerHTML = "<p style='color:#999;text-align:center;'>No product data yet.</p>";
    } else {
        // Sort by units sold
        const sorted = Object.entries(allProductCounts).sort((a, b) => b[1] - a[1]);
        const maxCount = sorted[0][1];

        list.innerHTML = sorted.map(([name, count], index) => {
            const barWidth = Math.round((count / maxCount) * 100);
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
            return `
                <div class="product-stat-row">
                    <div class="product-stat-top">
                        <span class="prod-stat-name">${medal} ${name}</span>
                        <span class="prod-stat-badge">${count} units</span>
                    </div>
                    <div class="prod-bar-wrap">
                        <div class="prod-bar" style="width:${barWidth}%"></div>
                    </div>
                </div>`;
        }).join('');
    }

    document.getElementById("productsOverlay").classList.add("open");
    document.getElementById("productsDrawer").classList.add("open");
}

window.closeProductsDrawer = function() {
    document.getElementById("productsOverlay").classList.remove("open");
    document.getElementById("productsDrawer").classList.remove("open");
}

// Run on page load
loadOrders();
