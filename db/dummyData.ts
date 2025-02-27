import { User } from "./schema";

const businessOwner: User = {
  id: "2",
  name: "",
  email: "john@example.com",
  image: "",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const customer: User = {
  id: "1",
  name: "",
  email: "john@example.com",
  image: "",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const dummyUser = businessOwner;

export function getUser(): Promise<User | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyUser);
    }, 200);
  });
}
