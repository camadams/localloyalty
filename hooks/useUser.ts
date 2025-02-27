import { useState, useEffect } from "react";
import { getUser } from "@/db/dummyData";
import { User } from "@/db/schema";

const useUser = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);
      } catch (e) {
        console.log(e);
      }
    }
    start();
  }, []);

  return { user, isLoadingUser };
};

export default useUser;
