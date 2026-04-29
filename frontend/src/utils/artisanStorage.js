const PROFILE_KEY = "artisan_profile";
const PRODUCTS_KEY = "artisan_products";
const READ_KEY = "artisan_learning_read";
const SELECTED_DESIGN_KEY = "artisan_selected_design";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson(key, fallbackValue) {
  if (!isBrowser()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function normalizePhoneNumber(phoneNumber = "") {
  return phoneNumber.replace(/\D/g, "").slice(-10);
}

export function getStorefrontId(phoneNumber = "") {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  return normalizedPhone.slice(-4) || "0000";
}

export function getArtisanProfile() {
  return readJson(PROFILE_KEY, null);
}

export function saveArtisanProfile(profile) {
  const normalizedPhone = normalizePhoneNumber(profile.phone);
  const value = {
    ...profile,
    phone: normalizedPhone,
    storefrontId: getStorefrontId(normalizedPhone),
    updatedAt: new Date().toISOString(),
  };

  writeJson(PROFILE_KEY, value);
  return value;
}

export function clearArtisanProfile() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(PROFILE_KEY);
}

export function getArtisanProducts() {
  return readJson(PRODUCTS_KEY, []);
}

export function saveArtisanProducts(products) {
  writeJson(PRODUCTS_KEY, products);
  return products;
}

export function getProductsForStorefront(storefrontId) {
  return getArtisanProducts().filter((product) => product.storefrontId === storefrontId);
}

export function saveSelectedDesign(design) {
  writeJson(SELECTED_DESIGN_KEY, {
    ...design,
    savedAt: new Date().toISOString(),
  });
}

export function getSelectedDesign() {
  return readJson(SELECTED_DESIGN_KEY, null);
}

export function clearSelectedDesign() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(SELECTED_DESIGN_KEY);
}

export function getLearningReadState() {
  return readJson(READ_KEY, {});
}

export function markLearningCardRead(cardId) {
  const current = getLearningReadState();
  const nextValue = {
    ...current,
    [cardId]: true,
  };

  writeJson(READ_KEY, nextValue);
  return nextValue;
}

export function buildStorefrontUrl(storefrontId) {
  if (typeof window === "undefined") {
    return `/store/${storefrontId}`;
  }

  return `${window.location.origin}/store/${storefrontId}`;
}
