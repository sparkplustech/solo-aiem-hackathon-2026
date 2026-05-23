import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { Product, RegisteredUser } from "./types";
import { PRODUCTS_CATALOG, INITIAL_USERS } from "./data";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed the initial products catalog to Firestore if the collection is empty
export async function seedProductsIfNeeded(): Promise<Product[]> {
  const path = "products";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("[Firebase] Products catalog empty. Seeding initial products...");
      const seeded: Product[] = [];
      for (const prod of PRODUCTS_CATALOG) {
        await setDoc(doc(db, "products", prod.id), prod);
        seeded.push(prod);
      }
      return seeded;
    } else {
      const items: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });
      // Sort to keep newest or original ids stable
      return items.sort((a,b) => b.id.localeCompare(a.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return PRODUCTS_CATALOG;
  }
}

// Seed the initial accounts and point ledgers to Firestore if empty
export async function seedUsersIfNeeded(): Promise<RegisteredUser[]> {
  const path = "users";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("[Firebase] Users database empty. Seeding initial users...");
      const seeded: RegisteredUser[] = [];
      for (const u of INITIAL_USERS) {
        // Embed standard preview credentials inside document
        const passwordSeed = u.email === "admin@ecokart.in" ? "admin123" : "user123";
        const roleSeed = u.email === "admin@ecokart.in" ? "admin" : "user";
        const userDocument = {
          ...u,
          password: passwordSeed,
          role: roleSeed
        };
        await setDoc(doc(db, "users", u.email.toLowerCase().trim()), userDocument);
        seeded.push(userDocument as any);
      }
      return seeded;
    } else {
      const items: RegisteredUser[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push(docSnap.data() as RegisteredUser);
      });
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return INITIAL_USERS;
  }
}

// Fetch all registered users
export async function fetchUsersFromDb(): Promise<RegisteredUser[]> {
  const path = "users";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: RegisteredUser[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as RegisteredUser);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Fetch all products
export async function fetchProductsFromDb(): Promise<Product[]> {
  const path = "products";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Product);
    });
    return items.sort((a,b) => b.id.localeCompare(a.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Save or Update a single user Profile
export async function saveUserProfile(user: RegisteredUser): Promise<void> {
  const path = `users/${user.email}`;
  try {
    await setDoc(doc(db, "users", user.email.toLowerCase().trim()), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Create a new product registration
export async function registerProductToDb(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, "products", product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a product from Firestore
export async function deleteProductFromDb(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
