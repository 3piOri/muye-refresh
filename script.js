const productsGrid = document.querySelector("#products-grid");
const productsSection = document.querySelector(".products-section");
const productsViewport = document.querySelector(".products-viewport");
const productsSticky = document.querySelector(".products-sticky");

if (!productsGrid) {
    throw new Error('No se encontró el contenedor "#products-grid".');
}

if (!productsSection || !productsViewport || !productsSticky) {
    throw new Error("No se encontró la estructura del carrusel de productos.");
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let carouselEnabled = false;
let carouselFrame = 0;
let descriptionOverflowFrame = 0;
let horizontalDistance = 0;

function updateProductDescriptionOverflow() {
    productsGrid.querySelectorAll(".product-card").forEach((card) => {
        const description = card.querySelector(".description");
        const readMoreButton = card.querySelector(".read-more");
        readMoreButton.hidden = description.scrollHeight <= description.clientHeight + 1;
    });
}

function scheduleDescriptionOverflowCheck() {
    if (descriptionOverflowFrame) {
        return;
    }

    descriptionOverflowFrame = window.requestAnimationFrame(() => {
        descriptionOverflowFrame = 0;
        updateProductDescriptionOverflow();
    });
}

function updateCarouselPosition() {
    if (!carouselEnabled) {
        return;
    }

    const sectionTop = productsSection.getBoundingClientRect().top + window.scrollY;
    const verticalDistance = productsSection.offsetHeight - productsSticky.offsetHeight;
    const progress = verticalDistance > 0
        ? Math.min(Math.max((window.scrollY - sectionTop) / verticalDistance, 0), 1)
        : 0;

    productsGrid.style.transform = `translate3d(${-horizontalDistance * progress}px, 0, 0)`;
}

function scheduleCarouselUpdate() {
    if (!carouselEnabled || carouselFrame) {
        return;
    }

    carouselFrame = window.requestAnimationFrame(() => {
        carouselFrame = 0;
        updateCarouselPosition();
    });
}

function refreshProductCarousel() {
    if (prefersReducedMotion.matches) {
        carouselEnabled = false;
        productsSection.classList.remove("is-carousel");
        productsSection.style.removeProperty("--carousel-scroll-distance");
        productsSection.style.removeProperty("--carousel-card-width");
        productsGrid.style.removeProperty("transform");
        scheduleDescriptionOverflowCheck();
        return;
    }

    productsSection.classList.add("is-carousel");
    productsSection.style.setProperty("--carousel-card-width", `${productsViewport.clientWidth}px`);
    horizontalDistance = Math.max(0, productsGrid.scrollWidth - productsViewport.clientWidth);

    if (horizontalDistance <= 1) {
        carouselEnabled = false;
        productsSection.classList.remove("is-carousel");
        productsSection.style.removeProperty("--carousel-scroll-distance");
        productsSection.style.removeProperty("--carousel-card-width");
        productsGrid.style.removeProperty("transform");
        scheduleDescriptionOverflowCheck();
        return;
    }

    productsSection.style.setProperty("--carousel-scroll-distance", `${horizontalDistance}px`);
    carouselEnabled = true;
    updateCarouselPosition();
    scheduleDescriptionOverflowCheck();
}

window.addEventListener("scroll", scheduleCarouselUpdate, { passive: true });
window.addEventListener("resize", refreshProductCarousel);
prefersReducedMotion.addEventListener("change", refreshProductCarousel);

if ("ResizeObserver" in window) {
    const carouselResizeObserver = new ResizeObserver(refreshProductCarousel);
    carouselResizeObserver.observe(productsViewport);
    carouselResizeObserver.observe(productsGrid);
}

if (document.fonts) {
    document.fonts.ready.then(scheduleDescriptionOverflowCheck);
}

function createProductCard(product) {
    const orderUrl = new URL(product.whatsappUrl, window.location.href);
    if (orderUrl.protocol !== "https:") {
        throw new Error(`El enlace para pedir "${product.name}" debe usar HTTPS.`);
    }

    const card = document.createElement("div");
    card.className = "product-card";

    const imageContainer = document.createElement("div");
    imageContainer.className = "product-image";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    imageContainer.append(image);

    if (product.tag) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = product.tag;
        imageContainer.append(tag);
    }

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = product.price;

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = product.description;

    const readMoreButton = document.createElement("button");
    readMoreButton.className = "read-more";
    readMoreButton.type = "button";
    readMoreButton.textContent = "Leer más";
    readMoreButton.hidden = true;

    const descriptionDialog = document.createElement("dialog");
    descriptionDialog.className = "product-description-dialog";
    descriptionDialog.setAttribute("aria-label", `Descripción de ${product.name}`);

    const dialogHeader = document.createElement("div");
    dialogHeader.className = "description-dialog-header";

    const dialogTitle = document.createElement("h3");
    dialogTitle.textContent = product.name;

    const closeDialogButton = document.createElement("button");
    closeDialogButton.className = "description-dialog-close";
    closeDialogButton.type = "button";
    closeDialogButton.setAttribute("aria-label", "Cerrar descripción");
    closeDialogButton.textContent = "×";
    closeDialogButton.addEventListener("click", () => descriptionDialog.close());

    const fullDescription = document.createElement("p");
    fullDescription.textContent = product.description;

    dialogHeader.append(dialogTitle, closeDialogButton);
    descriptionDialog.append(dialogHeader, fullDescription);
    descriptionDialog.addEventListener("click", (event) => {
        if (event.target === descriptionDialog) {
            descriptionDialog.close();
        }
    });
    readMoreButton.addEventListener("click", () => descriptionDialog.showModal());

    const orderButton = document.createElement("a");
    orderButton.href = orderUrl.href;
    orderButton.className = "btn-ws";
    orderButton.target = "_blank";
    orderButton.rel = "noopener noreferrer";

    const whatsappIcon = document.createElement("i");
    whatsappIcon.className = "fa-brands fa-whatsapp";
    orderButton.append(whatsappIcon, document.createTextNode(" Pedir por WhatsApp"));

    info.append(name, price, description);
    info.append(readMoreButton);
    info.append(orderButton);
    card.append(imageContainer, info);
    card.append(descriptionDialog);

    return card;
}

function renderProducts(products) {
    productsGrid.replaceChildren();

    if (products.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "catalog-empty";
        emptyMessage.textContent = "Estamos preparando nuevos productos.";
        productsGrid.append(emptyMessage);
        refreshProductCarousel();
        return;
    }

    products.forEach((product) => {
        const requiredFields = ["image", "name", "description", "price", "whatsappUrl"];
        const missingField = requiredFields.find((field) => (
            typeof product[field] !== "string" || product[field].trim() === ""
        ));

        if (missingField) {
            throw new Error(`Falta el campo "${missingField}" en un producto del catálogo.`);
        }

        productsGrid.append(createProductCard(product));
    });

    refreshProductCarousel();
}

function showCatalogError(message) {
    const error = document.createElement("p");
    error.className = "catalog-error";
    error.setAttribute("role", "alert");
    error.textContent = message;
    productsGrid.replaceChildren(error);
    refreshProductCarousel();
}

async function loadProducts() {
    const config = window.supabaseConfig;
    const hasSupabaseConfig = config && config.url && config.anonKey;

    if (!hasSupabaseConfig) {
        const products = window.servicesData && window.servicesData.products;
        if (!Array.isArray(products)) {
            throw new Error("No se encontró una lista válida de productos en services-data.js.");
        }
        renderProducts(products);
        return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("No se pudo cargar Supabase. Revisa tu conexión a internet e inténtalo de nuevo.");
    }

    const client = window.supabase.createClient(config.url, config.anonKey);
    const { data, error } = await client
        .from("products")
        .select("image, name, description, price, whatsapp_url, tag")
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
    }

    renderProducts(data.map((product) => ({
        ...product,
        whatsappUrl: product.whatsapp_url
    })));
}

loadProducts().catch((error) => {
    console.error(error);
    showCatalogError("No pudimos cargar el catálogo en este momento. Intenta de nuevo mÃ¡s tarde.");
});