const syncBtn = document.getElementById("syncBtn");
const ordersList = document.getElementById("ordersList");
const statusDiv = document.getElementById("status");

syncBtn.addEventListener("click", fetchAndDisplayOrders);

async function fetchAndDisplayOrders() {
  statusDiv.textContent = "Syncing orders...";
  ordersList.innerHTML = "";

  try {
    // 1. Fetch all carts (orders)
    const cartsResponse = await fetch("https://fakestoreapi.com/carts");

    if (!cartsResponse.ok) {
      throw new Error(`Error fetching carts: ${cartsResponse.status} - ${cartsResponse.statusText}`);
    }

    const carts = await cartsResponse.json();

    // 2. Enrich each cart with user + product details in parallel
    const enrichedOrders = await Promise.all(
      carts.map(cart => enrichCart(cart))
    );

    statusDiv.textContent = `Synced ${enrichedOrders.length} orders`;

    // 3. Render enriched orders
    enrichedOrders.forEach(order => {
      const li = document.createElement("li");

      const header = document.createElement("div");
      header.innerHTML = `<strong>Order ID:</strong> ${order.id} | <strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}`;

      const userInfo = document.createElement("div");
      const user = order.user;
      userInfo.innerHTML = `
        <strong>Customer:</strong> ${user.name.firstname} ${user.name.lastname} 
        | <strong>Email:</strong> ${user.email} 
        | <strong>City:</strong> ${user.address.city}
      `;

      const productsList = document.createElement("ul");
      productsList.style.marginTop = "8px";

      order.productsDetailed.forEach(prod => {
        const productItem = document.createElement("li");
        productItem.style.listStyleType = "disc";
        productItem.style.marginLeft = "20px";
        productItem.textContent = `${prod.title} — Qty: ${prod.quantity} — $${prod.price.toFixed(2)} each`;
        productsList.appendChild(productItem);
      });

      const totalDiv = document.createElement("div");
      totalDiv.style.marginTop = "8px";
      totalDiv.innerHTML = `<strong>Order Total:</strong> $${order.orderTotal.toFixed(2)}`;

      li.appendChild(header);
      li.appendChild(userInfo);
      li.appendChild(productsList);
      li.appendChild(totalDiv);

      ordersList.appendChild(li);
    });

  } catch (error) {
    statusDiv.textContent = "Failed to sync orders. Check console for details.";
    console.error("Integration Error:", error);
  }
}

/**
 * Enrich a cart with:
 * - user details
 * - product details
 * - computed order total
 */
async function enrichCart(cart) {
  try {
    // Fetch user details
    const userResponse = await fetch(`https://fakestoreapi.com/users/${cart.userId}`);
    if (!userResponse.ok) {
      throw new Error(`Error fetching user ${cart.userId}: ${userResponse.status}`);
    }
    const user = await userResponse.json();

    // Fetch product details for each product in the cart
    const productsDetailed = await Promise.all(
      cart.products.map(async (p) => {
        const productResponse = await fetch(`https://fakestoreapi.com/products/${p.productId}`);
        if (!productResponse.ok) {
          throw new Error(`Error fetching product ${p.productId}: ${productResponse.status}`);
        }
        const productData = await productResponse.json();
        return {
          ...productData,
          quantity: p.quantity
        };
      })
    );

    // Compute order total
    const orderTotal = productsDetailed.reduce((sum, prod) => {
      return sum + prod.price * prod.quantity;
    }, 0);

    return {
      ...cart,
      user,
      productsDetailed,
      orderTotal
    };
  } catch (error) {
    console.error(`Error enriching cart ${cart.id}:`, error);
    // If enrichment fails, still return basic cart so UI doesn't completely break
    return {
      ...cart,
      user: {
        name: { firstname: "Unknown", lastname: "" },
        email: "N/A",
        address: { city: "N/A" }
      },
      productsDetailed: [],
      orderTotal: 0
    };
  }
}