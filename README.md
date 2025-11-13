## 🔄 Data Enrichment

For each order, the integration:

1. Fetches **cart data** from `/carts`
2. Uses `userId` to fetch **user details** from `/users/:id`
3. Uses each `productId` to fetch **product info** from `/products/:id`
4. Computes an **order total** using `price * quantity` for each product
5. Displays:
   - Order ID and date
   - Customer name, email, and city
   - Line items (product title, quantity, price)
   - Overall order total