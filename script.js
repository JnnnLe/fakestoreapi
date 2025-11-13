// endpoints available: /products; /carts; /users; /auth

const syncBtn = document.getElementById("syncBtn");
const productCard = document.getElementById("product-card");

syncBtn.addEventListener("click", fetchProducts);

async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response}`);
    }

    const data = await response.json();
    // console.log("DATA: ", data);

    const productsContainer = document.getElementById("products-container");
    const productCard = document.getElementById("product-card");

    data.forEach(product => {
      const card = productCard.content.cloneNode(true);
      card.querySelector(".title").textContent = `${product.title}`;
      card.querySelector(".price").textContent = `$${product.price}`;
      card.querySelector(".description").textContent = `${product.description}`;
      productsContainer.appendChild(card);
    });


    return data;
  } catch (error) {
    console.log("ERROR fetching data: ", error);
  }

}


/* Notes:
Dispalyed data fetched from api and added minimal "style"

Next: Gather user data, sum total, and add more style

Understand why:
  const card = productCard.content.cloneNode(true);
 */