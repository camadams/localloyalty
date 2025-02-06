import { eq } from "drizzle-orm";
import { cards, Card, User } from "./schema";

export type Business = User;

const dummyUser: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  image: "",
  emailVerified: new Date(),
};

const dummyBusiness: Business = {
  id: 2,
  name: "Surf Shack",
  email: "john@example.com",
  image: "",
  emailVerified: new Date(),
};

// export function getCards(userId: string): Promise<LoyaltyCard[]> {
//   return db.select().from(cards).where(eq(cards.userId, userId));
// }

export function getUser(): Promise<User | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyUser);
    }, 200);
  });
}

export function getBusiness(): Promise<Business | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyBusiness);
    }, 200);
  });
}

type CreateCardType = {
  shopId: string;
  userId: number;
};

export function createCard({
  shopId,
  userId,
}: CreateCardType): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 2000);
  });
}
